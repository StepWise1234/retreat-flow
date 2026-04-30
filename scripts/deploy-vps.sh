#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DIST_DIR="$ROOT_DIR/dist"

: "${VITE_SUPABASE_PROJECT_ID:?VITE_SUPABASE_PROJECT_ID is required}"
: "${VITE_SUPABASE_URL:?VITE_SUPABASE_URL is required}"
: "${VITE_SUPABASE_PUBLISHABLE_KEY:?VITE_SUPABASE_PUBLISHABLE_KEY is required}"
: "${VPS_HOST:?VPS_HOST is required (example: root@80.78.31.210)}"
: "${VPS_SSH_KEY:?VPS_SSH_KEY is required (absolute path)}"
: "${VPS_WEBROOT:=/var/www/stepwise}"

echo "[deploy-vps] Running predeploy checks..."
node "$ROOT_DIR/scripts/predeploy-check.mjs"

echo "[deploy-vps] Building app..."
npm --prefix "$ROOT_DIR" run build

echo "[deploy-vps] Backing up and syncing to $VPS_HOST:$VPS_WEBROOT..."
ssh -i "$VPS_SSH_KEY" "$VPS_HOST" "cp -a \"$VPS_WEBROOT\" \"${VPS_WEBROOT}.backup-$(date +%Y%m%d%H%M%S)\""
rsync -az --delete -e "ssh -i $VPS_SSH_KEY" "$DIST_DIR/" "$VPS_HOST:$VPS_WEBROOT/"

echo "[deploy-vps] Running live canary check..."
node "$ROOT_DIR/scripts/canary-check.mjs"

echo "[deploy-vps] Deploy complete."
