import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const distDir = process.env.DIST_DIR || "dist";
const expectedRef = process.env.EXPECTED_SUPABASE_REF || "ybludwecmqghoheotzzz";
const bannedMarkers = [
  "ofgdycudacoqvkxtbadr",
  "auth.lovable.cloud",
  "retreat-flow-buddy.lovable.app",
];

function collectFiles(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) collectFiles(full, acc);
    else if (/\.(js|css|html|map)$/i.test(entry)) acc.push(full);
  }
  return acc;
}

const files = collectFiles(distDir);
if (files.length === 0) {
  console.error(`[guard-build] No build files found in ${distDir}`);
  process.exit(1);
}

let expectedFound = false;
const bannedHits = [];

for (const file of files) {
  const content = readFileSync(file, "utf8");
  if (content.includes(expectedRef)) expectedFound = true;
  for (const marker of bannedMarkers) {
    if (content.includes(marker)) {
      bannedHits.push({ file, marker });
    }
  }
}

if (!expectedFound) {
  console.error(`[guard-build] Expected Supabase ref '${expectedRef}' not found in build output.`);
  process.exit(1);
}

if (bannedHits.length > 0) {
  console.error("[guard-build] Banned auth markers found in build:");
  for (const hit of bannedHits) {
    console.error(`  - ${hit.marker} in ${hit.file}`);
  }
  process.exit(1);
}

console.log(`[guard-build] OK. Found expected ref '${expectedRef}' and no banned markers.`);
