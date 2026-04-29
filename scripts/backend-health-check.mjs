const projectRef = process.env.SUPABASE_PROJECT_REF || 'ybludwecmqghoheotzzz';
const expectedProjectRef = process.env.EXPECTED_SUPABASE_REF || 'ybludwecmqghoheotzzz';
const anonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;
const webhook = process.env.SYNTHETIC_ALERT_WEBHOOK_URL || '';
const timeoutMs = Number(process.env.SYNTHETIC_TIMEOUT_MS || 20000);

if (!anonKey) {
  console.error('Missing required env var: VITE_SUPABASE_PUBLISHABLE_KEY or SUPABASE_ANON_KEY');
  process.exit(1);
}

if (projectRef !== expectedProjectRef) {
  await notify(`StepWise backend health check project mismatch: ${projectRef} !== ${expectedProjectRef}`);
  process.exit(1);
}

const baseUrl = `https://${projectRef}.supabase.co`;
const checks = [
  {
    name: 'supabase-auth-settings',
    url: `${baseUrl}/auth/v1/settings`,
    init: { method: 'GET', headers: { apikey: anonKey } },
    expectStatus: 200,
  },
  {
    name: 'submit-application-validation',
    url: `${baseUrl}/functions/v1/submit-application`,
    init: {
      method: 'POST',
      headers: { apikey: anonKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    },
    expectStatus: 400,
    expectBodyIncludes: 'Name and valid email are required',
  },
  {
    name: 'select-training-auth-required',
    url: `${baseUrl}/functions/v1/select-training`,
    init: {
      method: 'POST',
      headers: { apikey: anonKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    },
    expectStatus: 401,
    expectBodyIncludes: 'Missing authorization header',
  },
];

const results = [];

for (const check of checks) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const resp = await fetch(check.url, { ...check.init, signal: controller.signal });
    const body = await resp.text();
    const ok = resp.status === check.expectStatus && (!check.expectBodyIncludes || body.includes(check.expectBodyIncludes));
    results.push({ name: check.name, status: resp.status, ok });

    if (!ok) {
      await notify(`StepWise backend health check failed: ${check.name} returned ${resp.status}; expected ${check.expectStatus}.`);
      process.exit(1);
    }
  } catch (error) {
    await notify(`StepWise backend health check failed: ${check.name} threw ${error?.message || error}`);
    process.exit(1);
  } finally {
    clearTimeout(timer);
  }
}

console.log(`[backend-health-check] OK ${results.map((r) => `${r.name}:${r.status}`).join(' ')}`);

async function notify(message) {
  if (!webhook) {
    console.error(`[backend-health-check] ALERT: ${message}`);
    return;
  }

  await fetch(webhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: message }),
  });
}
