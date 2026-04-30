const projectRef = process.env.SUPABASE_PROJECT_REF || "ybludwecmqghoheotzzz";
const anonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;
const testEmail = process.env.SYNTHETIC_TEST_EMAIL;
const debugToken = process.env.AUTH_EMAIL_DEBUG_TOKEN;
const webhook = process.env.SYNTHETIC_ALERT_WEBHOOK_URL || "";
const timeoutMs = Number(process.env.SYNTHETIC_TIMEOUT_MS || 90000);

if (!anonKey || !testEmail || !debugToken) {
  console.error("Missing required env vars: VITE_SUPABASE_PUBLISHABLE_KEY(or SUPABASE_ANON_KEY), SYNTHETIC_TEST_EMAIL, AUTH_EMAIL_DEBUG_TOKEN");
  process.exit(1);
}

const authUrl = `https://${projectRef}.supabase.co/auth/v1/otp`;
const debugUrl = `https://${projectRef}.supabase.co/functions/v1/auth-email-debug`;
const startedAt = Date.now();

const otpResp = await fetch(authUrl, {
  method: "POST",
  headers: {
    apikey: anonKey,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    email: testEmail,
    create_user: true,
    redirect_to: "https://stepwise.education/portal",
  }),
});

if (!otpResp.ok) {
  const text = await otpResp.text();
  await notify(`Synthetic magic-link OTP request failed: ${otpResp.status} ${text}`);
  process.exit(1);
}

let delivered = false;
let latestEvent = "none";

while (Date.now() - startedAt < timeoutMs) {
  await new Promise((r) => setTimeout(r, 6000));
  const resp = await fetch(debugUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-auth-email-debug-token": debugToken,
    },
    body: JSON.stringify({
      mode: "recent_for",
      email: testEmail,
      subject: "Your Magic Link",
    }),
  });

  const payload = await resp.json().catch(() => ({}));
  const body = JSON.parse(payload.resend_body || "{}");
  const first = (body.data || [])[0];
  latestEvent = first?.last_event || latestEvent;

  if (latestEvent === "delivered") {
    delivered = true;
    break;
  }
}

if (!delivered) {
  await notify(`Synthetic magic-link delivery failed for ${testEmail}. Last event: ${latestEvent}`);
  process.exit(1);
}

console.log(`[synthetic-magic-link-check] OK for ${testEmail}.`);

async function notify(message) {
  if (!webhook) {
    console.error(`[synthetic-magic-link-check] ALERT: ${message}`);
    return;
  }
  await fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: message }),
  });
}
