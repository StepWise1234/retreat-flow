import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PAYPAL_API_URL = "https://api-m.paypal.com"; // Live

// Case Consult Plan ID - you need to create this in PayPal first
// We'll create it on first request if it doesn't exist
const CASE_CONSULT_PLAN_ID: string | null = null;

async function getPayPalAccessToken(): Promise<string> {
  const clientId = Deno.env.get("PAYPAL_CLIENT_ID");
  const clientSecret = Deno.env.get("PAYPAL_CLIENT_SECRET");
  const auth = btoa(`${clientId}:${clientSecret}`);

  const response = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`PayPal auth failed: ${JSON.stringify(data)}`);
  }
  return data.access_token;
}

async function getOrCreatePlan(accessToken: string, priceInCents: number): Promise<string> {
  // Check if we have a stored plan ID in Supabase
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  const { data: configData } = await supabaseClient
    .from("app_config")
    .select("value")
    .eq("key", "paypal_case_consult_plan_id")
    .single();

  if (configData?.value) {
    return configData.value;
  }

  // Create a product first
  const productResponse = await fetch(`${PAYPAL_API_URL}/v1/catalogs/products`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: "StepWise Group Case Consult",
      description: "Monthly group case consultation with StepWise facilitators",
      type: "SERVICE",
      category: "CONSULTING_SERVICES",
    }),
  });

  const productData = await productResponse.json();
  if (!productResponse.ok) {
    throw new Error(`Failed to create product: ${JSON.stringify(productData)}`);
  }

  // Create a billing plan
  const planResponse = await fetch(`${PAYPAL_API_URL}/v1/billing/plans`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      product_id: productData.id,
      name: "Case Consult Monthly Subscription",
      description: "Monthly access to StepWise Group Case Consult sessions",
      status: "ACTIVE",
      billing_cycles: [
        {
          frequency: {
            interval_unit: "MONTH",
            interval_count: 1,
          },
          tenure_type: "REGULAR",
          sequence: 1,
          total_cycles: 0, // 0 = infinite
          pricing_scheme: {
            fixed_price: {
              value: (priceInCents / 100).toFixed(2),
              currency_code: "USD",
            },
          },
        },
      ],
      payment_preferences: {
        auto_bill_outstanding: true,
        setup_fee: {
          value: "0",
          currency_code: "USD",
        },
        setup_fee_failure_action: "CONTINUE",
        payment_failure_threshold: 3,
      },
    }),
  });

  const planData = await planResponse.json();
  if (!planResponse.ok) {
    throw new Error(`Failed to create plan: ${JSON.stringify(planData)}`);
  }

  // Store the plan ID for future use
  await supabaseClient
    .from("app_config")
    .upsert({ key: "paypal_case_consult_plan_id", value: planData.id });

  return planData.id;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    // Authenticate user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated");

    const { enrollmentId, priceInCents, eventName } = await req.json();
    if (!enrollmentId || !priceInCents) {
      throw new Error("enrollmentId and priceInCents are required");
    }

    const accessToken = await getPayPalAccessToken();
    const planId = await getOrCreatePlan(accessToken, priceInCents);

    // Create subscription
    const subscriptionResponse = await fetch(`${PAYPAL_API_URL}/v1/billing/subscriptions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        plan_id: planId,
        subscriber: {
          name: {
            given_name: user.user_metadata?.first_name || user.email.split("@")[0],
            surname: user.user_metadata?.last_name || "",
          },
          email_address: user.email,
        },
        application_context: {
          brand_name: "StepWise",
          locale: "en-US",
          user_action: "SUBSCRIBE_NOW",
          payment_method: {
            payer_selected: "PAYPAL",
            payee_preferred: "IMMEDIATE_PAYMENT_REQUIRED",
          },
          return_url: `${req.headers.get("origin")}/portal/events?subscription=success&enrollment=${enrollmentId}`,
          cancel_url: `${req.headers.get("origin")}/portal/events?subscription=cancelled`,
        },
        custom_id: enrollmentId, // Link subscription to enrollment
      }),
    });

    const subscriptionData = await subscriptionResponse.json();
    if (!subscriptionResponse.ok) {
      throw new Error(`Failed to create subscription: ${JSON.stringify(subscriptionData)}`);
    }

    // Store subscription ID in enrollment
    await supabaseClient
      .from("enrollments")
      .update({
        notes: `paypal_subscription:${subscriptionData.id}`,
        payment_status: "pending",
      })
      .eq("id", enrollmentId);

    // Find approval link
    const approvalLink = subscriptionData.links?.find((link: { rel?: string; href?: string }) => link.rel === "approve")?.href;

    return new Response(JSON.stringify({
      subscriptionId: subscriptionData.id,
      approvalUrl: approvalLink,
      status: subscriptionData.status,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("PayPal create subscription error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
