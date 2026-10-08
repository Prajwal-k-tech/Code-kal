#!/usr/bin/env bash
set -euo pipefail
root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
cat > "$tmp/forge" <<'MOCK'
#!/usr/bin/env bash
printf '%s\n' "$@" > "$ZERO_KLUE_TEST_ARGS"
printf '%s\n' "${ETH_KEYSTORE_ACCOUNT-unset}" > "$ZERO_KLUE_TEST_ACCOUNT"
MOCK
chmod +x "$tmp/forge"
export ZERO_KLUE_TEST_ARGS="$tmp/args" ZERO_KLUE_TEST_ACCOUNT="$tmp/account"
cd "$root/zeroklue-app/packages/foundry"
PATH="$tmp:$PATH" make deploy RPC_URL=localhost ETH_KEYSTORE_ACCOUNT=scaffold-eth-default >/dev/null
grep -qx -- '--private-key' "$tmp/args"
grep -qx 'unset' "$tmp/account"
! grep -qx -- '--password' "$tmp/args"
PATH="$tmp:$PATH" make deploy RPC_URL=sepolia ETH_KEYSTORE_ACCOUNT=real-user >/dev/null
! grep -qx -- '--private-key' "$tmp/args"
grep -qx 'real-user' "$tmp/account"
printf 'PASS local deployment avoids user keystores; remote deployment keeps explicit account\n'
