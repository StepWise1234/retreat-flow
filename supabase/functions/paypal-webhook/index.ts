import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, paypal-transmission-id, paypal-transmission-time, paypal-transmission-sig, paypal-cert-url, paypal-auth-algo",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const webhookBody = await req.json();

    console.log("PayPal webhook received:", JSON.stringify(webhookBody, null, 2));

    const eventType = webhookBody.event_type;
    const resource = webhookBody.resource;

    // Handle payment capture completed
    if (eventType === "PAYMENT.CAPTURE.COMPLETED") {
      const orderId = resource.supplementary_data?.related_ids?.order_id;
      const transactionId = resource.id;
      const amountPaid = resource.amount?.value;

      if (orderId) {
        // Find enrollment by paypal order ID in notes
        const { data: enrollments } = await supabaseClient
          .from("enrollments")
          .select("id")
          .like("notes", `%paypal_order:${orderId}%`);

        if (enrollments && enrollments.length > 0) {
          await supabaseClient
            .from("enrollments")
            .update({
              payment_status: "paid",
              payment_amount_cents: amountPaid ? Math.round(parseFloat(amountPaid) * 100) : null,
              payment_date: new Date().toISOString(),
              notes: `paypal_order:${orderId},paypal_txn:${transactionId}`,
            })
            .eq("id", enrollments[0].id);

          console.log(`Updated enrollment ${enrollments[0].id} to paid`);
        }
      }
    }

    // Handle checkout order approved (user approved payment)
    if (eventType === "CHECKOUT.ORDER.APPROVED") {
      const orderId = resource.id;
      console.log(`Order ${orderId} approved, waiting for capture`);
    }

    // Handle subscription activated
    if (eventType === "BILLING.SUBSCRIPTION.ACTIVATED") {
      const subscriptionId = resource.id;
      const customId = resource.custom_id; // This is our enrollmentId

      if (customId) {
        await supabaseClient
          .from("enrollments")
          .update({
            payment_status: "paid",
            notes: `paypal_subscription:${subscriptionId}|status:active|activated:${new Date().toISOString()}`,
          })
          .eq("id", customId);

        console.log(`Subscription ${subscriptionId} activated for enrollment ${customId}`);
      }
    }

    // Handle subscription payment completed (monthly charge)
    if (eventType === "PAYMENT.SALE.COMPLETED" && resource.billing_agreement_id) {
      const subscriptionId = resource.billing_agreement_id;
      const amountPaid = resource.amount?.total;

      // Find enrollment by subscription ID
      const { data: enrollments } = await supabaseClient
        .from("enrollments")
        .select("id, notes")
        .like("notes", `%paypal_subscription:${subscriptionId}%`);

      if (enrollments && enrollments.length > 0) {
        // Update with latest payment info
        await supabaseClient
          .from("enrollments")
          .update({
            payment_status: "paid",
            payment_date: new Date().toISOString(),
            payment_amount_cents: amountPaid ? Math.round(parseFloat(amountPaid) * 100) : null,
          })
          .eq("id", enrollments[0].id);

        console.log(`Subscription payment received for ${enrollments[0].id}`);
      }
    }

    // Handle subscription cancelled
    if (eventType === "BILLING.SUBSCRIPTION.CANCELLED") {
      const subscriptionId = resource.id;
      const customId = resource.custom_id;

      if (customId) {
        await supabaseClient
          .from("enrollments")
          .update({
            payment_status: "cancelled",
            notes: `paypal_subscription:${subscriptionId}|status:cancelled|cancelled:${new Date().toISOString()}`,
          })
          .eq("id", customId);

        console.log(`Subscription ${subscriptionId} cancelled for enrollment ${customId}`);
      }
    }

    // Handle subscription payment failed
    if (eventType === "BILLING.SUBSCRIPTION.PAYMENT.FAILED") {
      const subscriptionId = resource.id;
      const customId = resource.custom_id;

      if (customId) {
        await supabaseClient
          .from("enrollments")
          .update({
            payment_status: "failed",
            notes: `paypal_subscription:${subscriptionId}|status:payment_failed|failed:${new Date().toISOString()}`,
          })
          .eq("id", customId);

        console.log(`Subscription payment failed for ${customId}`);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("PayPal webhook error:", error);
    // Always return 200 to PayPal to prevent retries
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }
});
