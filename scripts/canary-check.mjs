const portalUrl = process.env.CANARY_PORTAL_URL || "https://stepwise.education/portal";
const expectedRef = process.env.EXPECTED_SUPABASE_REF || "ybludwecmqghoheotzzz";
const bannedMarkers = [
  "ofgdycudacoqvkxtbadr",
  "auth.lovable.cloud",
  "retreat-flow-buddy.lovable.app",
];

const htmlResp = await fetch(portalUrl);
if (!htmlResp.ok) {
  console.error(`[canary-check] Failed to fetch portal HTML: ${htmlResp.status}`);
  process.exit(1);
}
const html = await htmlResp.text();
const scriptMatch = html.match(/src="(\/assets\/index-[^"]+\.js)"/);
if (!scriptMatch) {
  console.error("[canary-check] Could not locate portal bundle script in HTML.");
  process.exit(1);
}

const scriptUrl = new URL(scriptMatch[1], portalUrl).toString();
const jsResp = await fetch(scriptUrl);
if (!jsResp.ok) {
  console.error(`[canary-check] Failed to fetch bundle: ${jsResp.status}`);
  process.exit(1);
}
const js = await jsResp.text();

if (!js.includes(expectedRef)) {
  console.error(`[canary-check] Expected Supabase ref '${expectedRef}' missing in live bundle: ${scriptUrl}`);
  process.exit(1);
}

for (const marker of bannedMarkers) {
  if (js.includes(marker)) {
    console.error(`[canary-check] Banned marker '${marker}' detected in live bundle: ${scriptUrl}`);
    process.exit(1);
  }
}

console.log(`[canary-check] OK. Live portal bundle ${scriptUrl} is pinned to '${expectedRef}'.`);
