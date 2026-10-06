#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$ROOT_DIR/zeroklue-app"
YARN_CLI="$APP_DIR/.yarn/releases/yarn-3.2.3.cjs"
RPC_URL="http://127.0.0.1:8545"
ANVIL_LOG="$(mktemp "${TMPDIR:-/tmp}/zeroklue-anvil.XXXXXX.log")"
ANVIL_PID=""

cleanup() {
  if [[ -n "$ANVIL_PID" ]] && kill -0 "$ANVIL_PID" 2>/dev/null; then
    kill "$ANVIL_PID" 2>/dev/null || true
    wait "$ANVIL_PID" 2>/dev/null || true
  fi
  rm -f "$ANVIL_LOG"
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

for tool in node anvil cast forge ps; do
  if ! command -v "$tool" >/dev/null 2>&1; then
    printf 'Missing required command: %s\n' "$tool" >&2
    exit 1
  fi
done

if [[ ! -f "$YARN_CLI" ]]; then
  printf 'Pinned Yarn release is missing: %s\n' "$YARN_CLI" >&2
  exit 1
fi

run_yarn() {
  node "$YARN_CLI" "$@"
}

cd "$APP_DIR"
printf 'Starting a local Anvil chain on 127.0.0.1:8545...\n'
anvil --code-size-limit 100000 --port 8545 --host 127.0.0.1 >"$ANVIL_LOG" 2>&1 &
ANVIL_PID=$!

ready=false
for _ in {1..50}; do
  process_state="$(ps -o stat= -p "$ANVIL_PID" 2>/dev/null | tr -d '[:space:]' || true)"
  if [[ -z "$process_state" || "$process_state" == Z* ]] || ! kill -0 "$ANVIL_PID" 2>/dev/null; then
    printf 'Anvil failed to start. Log:\n' >&2
    cat "$ANVIL_LOG" >&2
    exit 1
  fi
  if cast rpc web3_clientVersion --rpc-url "$RPC_URL" >/dev/null 2>&1; then
    ready=true
    break
  fi
  sleep 0.2
done

if [[ "$ready" != true ]]; then
  printf 'Timed out waiting for the local Anvil chain. Log:\n' >&2
  cat "$ANVIL_LOG" >&2
  exit 1
fi

printf 'Deploying local contracts...\n'
run_yarn foundry:clean
run_yarn deploy

# This is Anvil's published throwaway account key; the RPC is loopback-only.
ANVIL_PRIVATE_KEY="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
for wallet in \
  0xfb48fbA511C33bAB53a5e33f439D3a2C9971cdAd \
  0x70997970C51812dc3A010C7d01b50e0d17dc79C8 \
  0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC; do
  cast send "$wallet" --value 1000ether --private-key "$ANVIL_PRIVATE_KEY" --rpc-url "$RPC_URL" >/dev/null
done

printf 'Local contracts are deployed. Starting the app at http://localhost:3000\n'
run_yarn start
