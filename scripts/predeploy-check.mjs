const required = [
  "VITE_SUPABASE_PROJECT_ID",
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_PUBLISHABLE_KEY",
];

const expectedRef = process.env.EXPECTED_SUPABASE_REF || "ybludwecmqghoheotzzz";
const expectedUrl = `https://${expectedRef}.supabase.co`;
const bannedRefs = ["ofgdycudacoqvkxtbadr"];

const missing = required.filter((k) => !process.env[k]);
if (missing.length > 0) {
  console.error(`[predeploy-check] Missing env vars: ${missing.join(", ")}`);
  process.exit(1);
}

const projectId = process.env.VITE_SUPABASE_PROJECT_ID;
const supabaseUrl = process.env.VITE_SUPABASE_URL;

console.log("[predeploy-check] Effective deployment auth config:");
console.log(`  VITE_SUPABASE_PROJECT_ID=${projectId}`);
console.log(`  VITE_SUPABASE_URL=${supabaseUrl}`);
console.log(`  EXPECTED_SUPABASE_REF=${expectedRef}`);

if (bannedRefs.includes(projectId) || supabaseUrl.includes("ofgdycudacoqvkxtbadr")) {
  console.error("[predeploy-check] Refusing deploy: environment points at banned legacy project.");
  process.exit(1);
}

if (projectId !== expectedRef) {
  console.error(`[predeploy-check] Project ref mismatch. Expected '${expectedRef}', got '${projectId}'.`);
  process.exit(1);
}

if (supabaseUrl !== expectedUrl) {
  console.error(`[predeploy-check] Supabase URL mismatch. Expected '${expectedUrl}', got '${supabaseUrl}'.`);
  process.exit(1);
}

console.log("[predeploy-check] OK.");
