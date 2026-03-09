import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRecipient {
  email: string;
  name?: string;
}

interface SendBulkEmailRequest {
  subject: string;
  html: string;
  recipients: EmailRecipient[];
  from_name?: string;
  from_email?: string;
  reply_to?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Check for authorization header (basic validation)
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const resendApiKey = Deno.env.get("RESEND_API_KEY");

  if (!resendApiKey) {
    return new Response(
      JSON.stringify({ error: "RESEND_API_KEY not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const body: SendBulkEmailRequest = await req.json();
    const { subject, html, recipients, from_name, from_email, reply_to } = body;

    if (!subject || !html || !recipients?.length) {
      return new Response(
        JSON.stringify({ error: "subject, html, and recipients are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[send-bulk-email] Sending to ${recipients.length} recipients`);

    // Send emails via Resend
    const results: { email: string; success: boolean; error?: string; id?: string }[] = [];

    // Use Resend batch API for efficiency (up to 100 emails per request)
    const batchSize = 100;
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);

      // Resend batch endpoint
      const batchPayload = batch.map(recipient => ({
        from: from_name
          ? `${from_name} <${from_email || "hello@stepwise.education"}>`
          : from_email || "hello@stepwise.education",
        to: [recipient.email],
        subject: subject,
        html: personalizeHtml(html, recipient),
        reply_to: reply_to,
      }));

      try {
        const response = await fetch("https://api.resend.com/emails/batch", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(batchPayload),
        });

        const responseData = await response.json();

        if (response.ok && responseData.data) {
          // Batch success - map results
          responseData.data.forEach((result: { id: string }, index: number) => {
            results.push({
              email: batch[index].email,
              success: true,
              id: result.id,
            });
          });
        } else {
          // Batch failed - mark all as failed
          batch.forEach(recipient => {
            results.push({
              email: recipient.email,
              success: false,
              error: responseData.message || "Resend API error",
            });
          });
        }
      } catch (err: any) {
        batch.forEach(recipient => {
          results.push({
            email: recipient.email,
            success: false,
            error: err.message,
          });
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    console.log(`[send-bulk-email] Completed: ${successCount} sent, ${failCount} failed`);

    return new Response(
      JSON.stringify({
        success: failCount === 0,
        sent: successCount,
        failed: failCount,
        results: results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error(`[send-bulk-email] Error:`, err);
    return new Response(
      JSON.stringify({ error: err.message || "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Replace variables like {{firstName}} with actual values
function personalizeHtml(html: string, recipient: EmailRecipient): string {
  let result = html;

  // Extract first name from full name
  const firstName = recipient.name?.split(" ")[0] || "";
  const lastName = recipient.name?.split(" ").slice(1).join(" ") || "";

  result = result.replace(/\{\{firstName\}\}/gi, firstName);
  result = result.replace(/\{\{lastName\}\}/gi, lastName);
  result = result.replace(/\{\{name\}\}/gi, recipient.name || "");
  result = result.replace(/\{\{email\}\}/gi, recipient.email);

  return result;
}
