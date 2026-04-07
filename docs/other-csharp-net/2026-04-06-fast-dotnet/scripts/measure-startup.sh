#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CONFIGURATION="${CONFIGURATION:-Release}"
FRAMEWORK="${FRAMEWORK:-net10.0}"
PORT="${PORT:-7443}"
ATTEMPTS="${ATTEMPTS:-5}"
POLL_DELAY_SECONDS="${POLL_DELAY_SECONDS:-0.05}"
APP_DLL="$ROOT_DIR/bin/$CONFIGURATION/$FRAMEWORK/LocalFastUi.dll"
URL="https://localhost:$PORT/api/ping"

if ! command -v curl >/dev/null 2>&1; then
  echo "curl is required." >&2
  exit 1
fi

dotnet build "$ROOT_DIR/LocalFastUi.csproj" -c "$CONFIGURATION" >/dev/null

if [[ ! -f "$APP_DLL" ]]; then
  echo "Built app not found at $APP_DLL" >&2
  exit 1
fi

cleanup() {
  if [[ -n "${APP_PID:-}" ]] && kill -0 "$APP_PID" 2>/dev/null; then
    kill "$APP_PID" 2>/dev/null || true
    wait "$APP_PID" 2>/dev/null || true
  fi
}

trap cleanup EXIT

total_ms=0
min_ms=999999
max_ms=0

for attempt in $(seq 1 "$ATTEMPTS"); do
  cleanup

  start_ns=$(date +%s%N)
  dotnet "$APP_DLL" >/dev/null 2>&1 &
  APP_PID=$!

  while true; do
    if curl --silent --insecure --output /dev/null "$URL" 2>/dev/null; then
      end_ns=$(date +%s%N)
      break
    fi

    if ! kill -0 "$APP_PID" 2>/dev/null; then
      echo "Application exited before responding on attempt $attempt." >&2
      exit 1
    fi

    sleep "$POLL_DELAY_SECONDS"
  done

  elapsed_ms=$(((end_ns - start_ns) / 1000000))
  total_ms=$((total_ms + elapsed_ms))
  (( elapsed_ms < min_ms )) && min_ms=$elapsed_ms
  (( elapsed_ms > max_ms )) && max_ms=$elapsed_ms

  echo "Attempt $attempt: ${elapsed_ms} ms"
done

average_ms=$((total_ms / ATTEMPTS))

echo "Average: ${average_ms} ms"
echo "Min: ${min_ms} ms"
echo "Max: ${max_ms} ms"
