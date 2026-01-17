# 🎨 Frontend Developer Guide

> **Your mission**: Ship the Google OAuth → ZK proof → soulbound NFT flow. No backend. Everything runs in the browser and on-chain.

---

## What’s already in place
- `app/page.tsx` — Landing + verification card wired to the new hook
- `app/oauth-callback/page.tsx` — Handles Google redirect and posts the `id_token` back to opener
- `components/VerificationCard.tsx` — UI for the end-to-end flow (RainbowKit + hook)
- `hooks/useStudentVerification.ts` — Wallet check → OAuth → proof → contract call
- `lib/providers/google-oauth.ts` — OAuth helper (already wired)
- `lib/circuits/jwt.ts` — Proof generation + contract-ready formatting
- `lib/ephemeral-key.ts`, `lib/lazy-modules.ts`, `public/circuits/*` — ZK assets and loaders

Legacy OTP files are removed; the codebase matches the PRD (JWT + ZK, no backend).

---

## Next steps (do these first)
1) Install deps
```bash
cd zeroklue-app/packages/nextjs
yarn add @aztec/bb.js @noir-lang/noir_js noir-jwt @noble/ed25519 @noble/hashes
```

2) Env setup — create `.env.local`
```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
```
Authorized origins: `http://localhost:3000` • Redirect URI: `http://localhost:3000/oauth-callback`.

3) Deploy contracts (for real tx tests)
```bash
cd zeroklue-app/packages/foundry
forge script script/DeployZeroKlue.s.sol --rpc-url <rpc> --private-key <key> --broadcast
```
Copy addresses/ABIs into `packages/nextjs/contracts/deployedContracts.ts` (currently empty). `useDeployedContractInfo("ZeroKlue")` reads from there.

4) Run the app
```bash
cd zeroklue-app/packages/nextjs
yarn dev
```

5) Smoke test
- Connect wallet → “Verify with Google” → complete OAuth → wait 20-40s → see tx + success badge
- Keep the tab open during proof generation

---

## Flow map
- `VerificationCard` → `useStudentVerification()`
- Hook steps: wallet check → ephemeral key → `verifyWithGoogle()` → `contractProof` returned → `verifyAndMint(contractProof.proofHex, contractProof.publicInputs)` → track receipt
- Statuses: `idle → connecting_wallet → authenticating → generating_proof → submitting_tx → success|error`

---

## UI polish ideas
- Skeleton/progress for the 20-40s proof window
- Mobile warning (proof is heavy)
- Success CTAs: “View on explorer” (tx hash captured) + “Claim discounts”
- Offers grid can live in `components/offers/` (folder exists)

---

## PRD alignment checklist
- ✅ No backend
- ✅ Google Workspace JWT as trusted issuer
- ✅ noir-jwt ZK proof (artifacts in `public/circuits`)
- ✅ Soulbound mint via `ZeroKlue.sol`

---

## Reference docs
- [PRD.md](PRD.md)
- [ENGINEERING_PLAN.md](ENGINEERING_PLAN.md)
- [TECHNICAL_DECISIONS.md](TECHNICAL_DECISIONS.md)

**You’re set. Build the UI and ship 🚀**
