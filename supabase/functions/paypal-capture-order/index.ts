import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PAYPAL_API_URL = "https://api-m.paypal.com"; // Live

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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "" // Use service role to update enrollment
  );

  try {
    const { orderId, enrollmentId } = await req.json();
    if (!orderId) {
      throw new Error("orderId is required");
    }

    // Get PayPal access token
    const accessToken = await getPayPalAccessToken();

    // Capture the order (finalize payment)
    const captureResponse = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders/${orderId}/capture`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    const captureData = await captureResponse.json();

    if (!captureResponse.ok) {
      throw new Error(`PayPal capture failed: ${JSON.stringify(captureData)}`);
    }

    if (captureData.status === "COMPLETED") {
      // Get payment details
      const capture = captureData.purchase_units?.[0]?.payments?.captures?.[0];
      const amountPaid = capture?.amount?.value;
      const transactionId = capture?.id;
      const referenceId = captureData.purchase_units?.[0]?.reference_id;

      // Update enrollment payment status
      const enrollmentToUpdate = enrollmentId || referenceId;
      if (enrollmentToUpdate) {
        await supabaseClient
          .from("enrollments")
          .update({
            payment_status: "paid",
            payment_amount_cents: amountPaid ? Math.round(parseFloat(amountPaid) * 100) : null,
            payment_date: new Date().toISOString(),
            notes: `paypal_order:${orderId},paypal_txn:${transactionId}`,
          })
          .eq("id", enrollmentToUpdate);
      }

      return new Response(JSON.stringify({
        success: true,
        status: captureData.status,
        transactionId,
        amountPaid,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } else {
      throw new Error(`Unexpected payment status: ${captureData.status}`);
    }
  } catch (error) {
    console.error("PayPal capture error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
