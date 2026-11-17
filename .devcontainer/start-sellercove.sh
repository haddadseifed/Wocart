#!/usr/bin/env bash
# Start the SellerCove local stack from the dev-container lifecycle, not a
# disposable integrated terminal. Safe to run repeatedly: existing listeners
# are detected and never duplicated.
set -Eeuo pipefail

ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_DIR="${TMPDIR:-/tmp}/sellercove-codespaces"
mkdir -p "$LOG_DIR"

http_responds() {
  curl --silent --show-error --max-time 2 --output /dev/null "http://127.0.0.1:$1/" >/dev/null 2>&1
}

port_has_listener() {
  ss -ltnH 2>/dev/null | grep -Eq "[:.]$1[[:space:]]"
}

start_service() {
  local name="$1"
  local port="$2"
  shift 2

  if http_responds "$port"; then
    echo "[SellerCove] $name already responds on $port"
    return 0
  fi

  if port_has_listener "$port"; then
    echo "[SellerCove] $name has a listener on $port but no HTTP response; leaving it untouched"
    return 0
  fi

  echo "[SellerCove] starting $name on $port; log: $LOG_DIR/$name.log"
  nohup "$@" >"$LOG_DIR/$name.log" 2>&1 </dev/null &
}

# Start the API first. It uses the existing local Wrangler/D1 configuration
# and the persistent .wrangler-shared directory; no remote resources are used.
start_service api 8787 npm --prefix "$ROOT/cod-server" run dev

# Give Wrangler up to 90 seconds to initialize before starting the UIs.
api_ready=false
for _ in $(seq 1 90); do
  if http_responds 8787; then
    api_ready=true
    break
  fi
  sleep 1
done

if "$api_ready"; then
  echo "[SellerCove] API responds on 8787"
else
  echo "[SellerCove] WARNING: API did not respond within 90 seconds; see $LOG_DIR/api.log"
fi

start_service dashboard 4321 npm --prefix "$ROOT/cod-client-astro" run dev -- --host 0.0.0.0 --port 4321
start_service storefront 4322 npm --prefix "$ROOT/cod-astro/sellercove" run dev -- --host 0.0.0.0 --port 4322

echo "[SellerCove] startup requested. Logs are in $LOG_DIR"
