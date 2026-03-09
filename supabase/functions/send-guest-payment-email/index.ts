import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface GuestPaymentRequest {
  enrollmentId: string;
  guestEmail: string;
  guestName: string;
  eventId: string;
  registrantName: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const body: GuestPaymentRequest = await req.json();
    const { enrollmentId, guestEmail, guestName, eventId, registrantName } = body;

    if (!guestEmail || !eventId) {
      return new Response(
        JSON.stringify({ error: "guestEmail and eventId are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch event details
    const { data: event, error: eventErr } = await supabase
      .from("trainings")
      .select("name, start_date, end_date, location, price_cents, description")
      .eq("id", eventId)
      .single();

    if (eventErr || !event) {
      return new Response(
        JSON.stringify({ error: "Event not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Format dates
    const formatDate = (dateStr: string | null) => {
      if (!dateStr) return null;
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    const startDate = formatDate(event.start_date);
    const endDate = formatDate(event.end_date);
    const price = event.price_cents ? `$${(event.price_cents / 100).toFixed(2)}` : 'Free';

    // Generate payment link with token
    const paymentToken = crypto.randomUUID();

    // Store the payment token for this guest
    await supabase
      .from("guest_payment_tokens")
      .upsert({
        token: paymentToken,
        enrollment_id: enrollmentId,
        guest_email: guestEmail,
        guest_name: guestName,
        event_id: eventId,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      });

    const paymentLink = `https://stepwise.education/guest-payment?token=${paymentToken}`;

    // Build email body
    const emailBody = `Hi ${guestName || 'there'},

${registrantName} has registered you for an upcoming StepWise event!

EVENT DETAILS
${'-'.repeat(40)}
${event.name}
${startDate ? `Date: ${startDate}${endDate && endDate !== startDate ? ` - ${endDate}` : ''}` : 'Recurring monthly event'}
${event.location ? `Location: ${event.location}` : ''}
Price: ${price}

${event.description ? `About this event:\n${event.description}\n` : ''}
COMPLETE YOUR REGISTRATION
${'-'.repeat(40)}
To confirm your spot, please complete your payment:

${paymentLink}

Pay securely with PayPal or Venmo.

Questions? Reply to this email and our team will help.

See you there!
The StepWise Team
stepwise.education`;

    // Fetch email settings
    const { data: settings } = await supabase
      .from("email_settings")
      .select("*")
      .limit(1)
      .single();

    if (!settings?.smtp_host || !settings?.from_email) {
      console.error("Email settings not configured");
      return new Response(
        JSON.stringify({ error: "Email settings not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send via SMTP
    const smtpResult = await sendViaSMTP({
      host: settings.smtp_host,
      port: settings.smtp_port || 1025,
      username: settings.smtp_username || "",
      password: settings.smtp_password || "",
      from: settings.from_name ? `${settings.from_name} <${settings.from_email}>` : settings.from_email,
      to: guestEmail,
      subject: `${registrantName} registered you for ${event.name} - Complete your payment`,
      body: emailBody,
      replyTo: settings.reply_to_email || undefined,
    });

    if (smtpResult.success) {
      console.log(`[send-guest-payment-email] Email sent to ${guestEmail}`);
      return new Response(
        JSON.stringify({ success: true, paymentLink }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      console.error(`[send-guest-payment-email] SMTP error: ${smtpResult.error}`);
      return new Response(
        JSON.stringify({ error: smtpResult.error }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (err: any) {
    console.error(`[send-guest-payment-email] Error:`, err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// SMTP Implementation
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
      return await readResponse();
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
    const fromEmail = opts.from.match(/<(.+?)>/)?.[1] || opts.from;
    response = await sendCommand(`MAIL FROM:<${fromEmail}>`);
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
