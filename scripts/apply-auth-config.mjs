const projectRef = process.env.SUPABASE_PROJECT_REF || "ybludwecmqghoheotzzz";
const mgmtToken = process.env.SUPABASE_MANAGEMENT_TOKEN;
const hookSecret = process.env.SEND_EMAIL_HOOK_SECRET;

if (!mgmtToken) {
  console.error("Missing SUPABASE_MANAGEMENT_TOKEN.");
  process.exit(1);
}

const hookUri = `https://${projectRef}.supabase.co/functions/v1/auth-send-email`;
const payload = {
  site_url: "https://stepwise.education/portal",
  uri_allow_list:
    "https://stepwise.education/portal,https://stepwise.education/portal/,https://app.stepwise.education/portal,https://app.stepwise.education/portal/",
  external_email_enabled: true,
  rate_limit_email_sent: 30,
  hook_send_email_enabled: true,
  hook_send_email_uri: hookUri,
  hook_send_email_secrets: hookSecret ?? null,
  smtp_host: null,
  smtp_port: null,
  smtp_user: null,
  smtp_pass: null,
  smtp_admin_email: null,
  smtp_sender_name: null,
};

const resp = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/config/auth`, {
  method: "PATCH",
  headers: {
    Authorization: `Bearer ${mgmtToken}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(payload),
});

const body = await resp.text();
if (!resp.ok) {
  console.error(`Auth config patch failed: ${resp.status} ${body}`);
  process.exit(1);
}

console.log("[apply-auth-config] Updated auth config:");
const parsed = JSON.parse(body);
console.log(`  site_url=${parsed.site_url}`);
console.log(`  hook_send_email_enabled=${parsed.hook_send_email_enabled}`);
console.log(`  hook_send_email_uri=${parsed.hook_send_email_uri}`);
console.log(`  rate_limit_email_sent=${parsed.rate_limit_email_sent}`);
