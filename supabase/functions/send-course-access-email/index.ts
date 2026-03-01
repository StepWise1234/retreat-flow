import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SendCourseAccessEmailRequest {
  user_id?: string;
  email?: string;
  course_name?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Use service role client for database operations
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const correlationId = crypto.randomUUID();

  try {
    const body: SendCourseAccessEmailRequest = await req.json();
    const { user_id, email, course_name = "Beginning" } = body;

    if (!user_id && !email) {
      return new Response(
        JSON.stringify({ error: "user_id or email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get recipient email
    let recipientEmail = email;
    let recipientName = "";

    if (user_id && !email) {
      // Look up email from auth.users via applications
      const { data: app } = await supabase
        .from("applications")
        .select("email, first_name")
        .eq("user_id", user_id)
        .maybeSingle();

      if (app) {
        recipientEmail = app.email;
        recipientName = app.first_name || "";
      }
    }

    if (!recipientEmail) {
      return new Response(
        JSON.stringify({ error: "Could not determine recipient email" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[send-course-access-email] Sending to ${recipientEmail}, correlation: ${correlationId}`);

    // Fetch email settings
    const { data: settings, error: settErr } = await supabase
      .from("email_settings")
      .select("*")
      .limit(1)
      .single();

    if (settErr || !settings) {
      console.error(`[send-course-access-email] Email settings not configured`, settErr);
      return new Response(
        JSON.stringify({ error: "Email settings not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!settings.smtp_host || !settings.from_email) {
      return new Response(
        JSON.stringify({ error: "SMTP not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build email content
    const subject = `Your ${course_name} Course Access is Ready!`;
    const greeting = recipientName ? `Hi ${recipientName},` : "Hi,";
    const body = `${greeting}

Great news! You now have access to the ${course_name} course in your StepWise portal.

You can start your learning journey by logging in at:
https://stepwise.education/portal/course

We're excited to have you in the training!

Warmly,
The StepWise Team`;

    // Send via SMTP
    const smtpResult = await sendViaSMTP({
      host: settings.smtp_host,
      port: settings.smtp_port || 1025,
      username: settings.smtp_username || "",
      password: settings.smtp_password || "",
      from: settings.from_name ? `${settings.from_name} <${settings.from_email}>` : settings.from_email,
      to: recipientEmail,
      subject,
      body,
      replyTo: settings.reply_to_email || undefined,
    });

    if (smtpResult.success) {
      console.log(`[send-course-access-email] Email sent successfully to ${recipientEmail}`);

      // Log the email in integration_logs
      await supabase.from("integration_logs").insert({
        provider: "ProtonBridgeSMTP",
        action: "send_course_access_email",
        status: "success",
        correlation_id: correlationId,
        metadata: {
          to: recipientEmail,
          course: course_name,
          providerMessageId: smtpResult.messageId,
        },
      });

      return new Response(
        JSON.stringify({ success: true, message: "Email sent" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      console.error(`[send-course-access-email] SMTP error: ${smtpResult.error}`);

      await supabase.from("integration_logs").insert({
        provider: "ProtonBridgeSMTP",
        action: "send_course_access_email",
        status: "error",
        error: smtpResult.error,
        correlation_id: correlationId,
        metadata: { to: recipientEmail, course: course_name },
      });

      return new Response(
        JSON.stringify({ error: smtpResult.error }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (err: any) {
    console.error(`[send-course-access-email] Unhandled error:`, err);
    return new Response(
      JSON.stringify({ error: err.message || "Unknown error" }),
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
      return response;
    }

    // Read greeting
    const greeting = await readResponse();
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
    const messageId = `<${crypto.randomUUID()}@stepwise.education>`;
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
