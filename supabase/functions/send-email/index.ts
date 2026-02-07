import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface SendEmailRequest {
  messageId: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const correlationId = crypto.randomUUID();

  try {
    const { messageId } = (await req.json()) as SendEmailRequest;

    if (!messageId) {
      return new Response(
        JSON.stringify({ error: "messageId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[send-email] Processing message ${messageId}, correlation: ${correlationId}`);

    // Fetch the message
    const { data: message, error: msgErr } = await supabase
      .from("messages")
      .select("*")
      .eq("id", messageId)
      .single();

    if (msgErr || !message) {
      console.error(`[send-email] Message not found: ${messageId}`, msgErr);
      return new Response(
        JSON.stringify({ error: "Message not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (message.channel !== "Email") {
      return new Response(
        JSON.stringify({ error: "Message is not an Email" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check idempotency — skip if already sent
    if (message.status === "Sent" || message.status === "Delivered") {
      console.log(`[send-email] Message ${messageId} already ${message.status}, skipping`);
      return new Response(
        JSON.stringify({ status: message.status, message: "Already sent" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch email settings
    const { data: settings, error: settErr } = await supabase
      .from("email_settings")
      .select("*")
      .limit(1)
      .single();

    if (settErr || !settings) {
      const errMsg = "Email settings not configured";
      console.error(`[send-email] ${errMsg}`, settErr);
      await updateMessageStatus(supabase, messageId, "Failed", errMsg);
      await logIntegration(supabase, "ProtonBridgeSMTP", "send_email", "error", errMsg, correlationId);
      return new Response(
        JSON.stringify({ error: errMsg }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!settings.smtp_host || !settings.from_email) {
      const errMsg = "SMTP host or from_email not configured";
      console.error(`[send-email] ${errMsg}`);
      await updateMessageStatus(supabase, messageId, "Failed", errMsg);
      await logIntegration(supabase, "ProtonBridgeSMTP", "send_email", "error", errMsg, correlationId);
      return new Response(
        JSON.stringify({ error: errMsg }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build the email payload for SMTP
    const smtpHost = settings.smtp_host;
    const smtpPort = settings.smtp_port || 1025;
    const smtpUsername = settings.smtp_username || "";
    const smtpPassword = settings.smtp_password || "";
    const fromName = settings.from_name || "";
    const fromEmail = settings.from_email;
    const replyTo = settings.reply_to_email;

    console.log(`[send-email] Connecting to SMTP ${smtpHost}:${smtpPort}`);

    // Use Deno's built-in SMTP via denopkg SMTPClient
    // We'll use a raw SMTP socket approach for maximum compatibility with Proton Bridge
    const smtpResult = await sendViaSMTP({
      host: smtpHost,
      port: smtpPort,
      username: smtpUsername,
      password: smtpPassword,
      from: fromName ? `${fromName} <${fromEmail}>` : fromEmail,
      to: message.to_address,
      subject: message.subject || "(no subject)",
      body: message.body,
      replyTo: replyTo || undefined,
    });

    if (smtpResult.success) {
      console.log(`[send-email] Email sent successfully to ${message.to_address}`);
      await updateMessageStatus(supabase, messageId, "Sent", null, smtpResult.messageId);
      await logIntegration(supabase, "ProtonBridgeSMTP", "send_email", "success", null, correlationId, {
        to: message.to_address,
        providerMessageId: smtpResult.messageId,
      });

      // Update email_settings health
      await supabase.from("email_settings").update({
        is_healthy: true,
        last_success_at: new Date().toISOString(),
        last_tested_at: new Date().toISOString(),
        last_error: null,
      }).eq("id", settings.id);

      return new Response(
        JSON.stringify({ status: "Sent", providerMessageId: smtpResult.messageId }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      const errMsg = smtpResult.error || "SMTP send failed";
      console.error(`[send-email] SMTP error: ${errMsg}`);
      await updateMessageStatus(supabase, messageId, "Failed", errMsg);
      await logIntegration(supabase, "ProtonBridgeSMTP", "send_email", "error", errMsg, correlationId, {
        to: message.to_address,
      });

      // Update email_settings health
      await supabase.from("email_settings").update({
        is_healthy: false,
        last_tested_at: new Date().toISOString(),
        last_error: errMsg,
      }).eq("id", settings.id);

      return new Response(
        JSON.stringify({ error: errMsg }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (err: any) {
    const errMsg = err.message || "Unknown error";
    console.error(`[send-email] Unhandled error:`, err);
    await logIntegration(supabase, "ProtonBridgeSMTP", "send_email", "error", errMsg, correlationId);
    return new Response(
      JSON.stringify({ error: errMsg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// ─── SMTP Implementation ───

interface SMTPOptions {
  host: string;
  port: number;
  username: string;
  password: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  replyTo?: string;
}

interface SMTPResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

async function sendViaSMTP(opts: SMTPOptions): Promise<SMTPResult> {
  try {
    // Connect to SMTP server
    const conn = await Deno.connect({
      hostname: opts.host,
      port: opts.port,
    });

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    async function readResponse(): Promise<string> {
      const buf = new Uint8Array(4096);
      const n = await conn.read(buf);
      if (n === null) throw new Error("Connection closed unexpectedly");
      return decoder.decode(buf.subarray(0, n));
    }

    async function sendCommand(cmd: string): Promise<string> {
      await conn.write(encoder.encode(cmd + "\r\n"));
      const response = await readResponse();
      console.log(`[SMTP] > ${cmd.startsWith("AUTH") ? "AUTH ***" : cmd}`);
      console.log(`[SMTP] < ${response.trim()}`);
      return response;
    }

    // Read greeting
    const greeting = await readResponse();
    console.log(`[SMTP] < ${greeting.trim()}`);
    if (!greeting.startsWith("220")) {
      conn.close();
      return { success: false, error: `SMTP greeting failed: ${greeting.trim()}` };
    }

    // EHLO
    let response = await sendCommand(`EHLO localhost`);
    if (!response.startsWith("250")) {
      conn.close();
      return { success: false, error: `EHLO failed: ${response.trim()}` };
    }

    // AUTH LOGIN if credentials provided
    if (opts.username && opts.password) {
      response = await sendCommand("AUTH LOGIN");
      if (response.startsWith("334")) {
        response = await sendCommand(btoa(opts.username));
        if (response.startsWith("334")) {
          response = await sendCommand(btoa(opts.password));
          if (!response.startsWith("235")) {
            conn.close();
            return { success: false, error: `Authentication failed: ${response.trim()}` };
          }
        }
      }
    }

    // MAIL FROM
    response = await sendCommand(`MAIL FROM:<${extractEmail(opts.from)}>`);
    if (!response.startsWith("250")) {
      conn.close();
      return { success: false, error: `MAIL FROM failed: ${response.trim()}` };
    }

    // RCPT TO
    response = await sendCommand(`RCPT TO:<${opts.to}>`);
    if (!response.startsWith("250")) {
      conn.close();
      return { success: false, error: `RCPT TO failed: ${response.trim()}` };
    }

    // DATA
    response = await sendCommand("DATA");
    if (!response.startsWith("354")) {
      conn.close();
      return { success: false, error: `DATA failed: ${response.trim()}` };
    }

    // Build message
    const messageId = `<${crypto.randomUUID()}@retreat-ops>`;
    const headers = [
      `From: ${opts.from}`,
      `To: ${opts.to}`,
      `Subject: ${opts.subject}`,
      `Message-ID: ${messageId}`,
      `Date: ${new Date().toUTCString()}`,
      `MIME-Version: 1.0`,
      `Content-Type: text/plain; charset=UTF-8`,
    ];

    if (opts.replyTo) {
      headers.push(`Reply-To: ${opts.replyTo}`);
    }

    const emailData = headers.join("\r\n") + "\r\n\r\n" + opts.body + "\r\n.\r\n";
    await conn.write(encoder.encode(emailData));
    response = await readResponse();
    console.log(`[SMTP] < ${response.trim()}`);

    if (!response.startsWith("250")) {
      conn.close();
      return { success: false, error: `Message rejected: ${response.trim()}` };
    }

    // QUIT
    await sendCommand("QUIT");
    conn.close();

    return { success: true, messageId };
  } catch (err: any) {
    return { success: false, error: `SMTP connection error: ${err.message}` };
  }
}

function extractEmail(from: string): string {
  const match = from.match(/<(.+?)>/);
  return match ? match[1] : from;
}

// ─── Helpers ───

async function updateMessageStatus(
  supabase: any,
  messageId: string,
  status: string,
  errorMessage: string | null,
  providerMessageId?: string
) {
  const updates: Record<string, any> = { status };
  if (errorMessage !== null) updates.error_message = errorMessage;
  if (providerMessageId) updates.provider_message_id = providerMessageId;
  if (status === "Sent") updates.sent_at = new Date().toISOString();
  if (status === "Delivered") updates.delivered_at = new Date().toISOString();

  await supabase.from("messages").update(updates).eq("id", messageId);
}

async function logIntegration(
  supabase: any,
  provider: string,
  action: string,
  status: string,
  error: string | null,
  correlationId: string,
  metadata?: Record<string, any>
) {
  await supabase.from("integration_logs").insert({
    provider,
    action,
    status,
    error,
    correlation_id: correlationId,
    metadata: metadata || {},
  });
}
