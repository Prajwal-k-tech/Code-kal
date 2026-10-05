# ZeroKlue

ZeroKlue is a prototype for generating a JWT proof in the browser and checking it on-chain before recording a wallet. It combines Google Workspace sign-in, a Noir JWT circuit, an UltraHonk verifier, and a small Solidity registry.

## Flow

1. The browser requests a Google ID token with a nonce bound to a short-lived ephemeral key.
2. It generates a zero-knowledge proof from the token and circuit inputs.
3. The wallet submits the proof and its 167 public inputs to `ZeroKlue`.
4. The circuit verifies Google's issuer, the OAuth audience, an unexpired `exp`, the Workspace `hd` claim, email verification, and the nonce bound to the ephemeral key.
5. The contract checks owner-approved signing-key, Workspace-domain, and OAuth-audience fingerprints, verifies both key and ID-token expiries, then records the wallet. Reused keys and invalid proofs are rejected.

The contract checks the proof's RSA modulus, Google Workspace `hd` domain, and OAuth audience against owner-managed allowlists. Owners must source signing-key fingerprints from Google's published JWKS and approve only intended domains and client IDs; when Google rotates keys, owners must approve current keys and revoke retired fingerprints. **This is a prototype, not production student verification.** A verified Workspace account does not prove current enrollment, and the proof does not attest enrollment dates or student status.

The circuit source imports [`noir-jwt`](https://github.com/saleel/noir-jwt). The compiled circuit and verification key are checked in under `zeroklue-app/packages/nextjs/public/circuits/`; the Solidity verifier is checked in under both `packages/circuits/` and `zeroklue-app/packages/foundry/contracts/`. `packages/circuits/build.sh` regenerates these outputs from the Noir package using Nargo and Barretenberg. The original project documentation attributes the circuit artifacts to [StealthNote](https://github.com/saleel/stealthnote); retain that attribution and review its license when redistributing. The circuit source compiles with Noir `1.0.0-beta.3` and reproduces the checked-in bytecode; the manifest can't pin that prerelease.

## Run locally

Requirements: Node.js 20.18.3+, the checked-in Yarn 3.2.3 release, and Foundry/Anvil. Google OAuth requires a configured client ID in `zeroklue-app/packages/nextjs/.env.local` (`NEXT_PUBLIC_GOOGLE_CLIENT_ID`).

```bash
git clone --recurse-submodules https://github.com/Prajwal-k-tech/Code-kal.git
cd Code-kal/zeroklue-app
node .yarn/releases/yarn-3.2.3.cjs install --immutable
```

Run these from `zeroklue-app` in separate terminals:

```bash
node .yarn/releases/yarn-3.2.3.cjs chain
node .yarn/releases/yarn-3.2.3.cjs deploy
node .yarn/releases/yarn-3.2.3.cjs start
```

Open [http://localhost:3000](http://localhost:3000), connect to the local chain, and use the verification flow. Root-level `npm run dev`, `build`, `start`, `lint`, and `typecheck` shortcuts are also available. `npm run contracts:test` runs the Foundry tests: most use a mock verifier for fast registry checks, and one exercises the real Solidity verifier with a synthetic proof fixture. The browser proof and local-chain transaction should be tried with a Google OAuth client configured for the local origin.

Before registration can succeed, the owner must configure the verifier's allowlists on the local deployment. Set `NEXT_PUBLIC_GOOGLE_CLIENT_ID`, `ZERO_KLUE_WORKSPACE_DOMAIN`, and `ZERO_KLUE_ADMIN_PRIVATE_KEY` in `packages/nextjs/.env.local` (use the first Anvil account printed by `yarn chain`), then run `yarn allowlist:local` from `zeroklue-app/packages/nextjs`. The script reads the deployed local contract address from `contracts/deployedContracts.ts`, fetches Google's current RS256 JWKS keys, and approves those key fingerprints plus the configured Workspace domain and OAuth audience. It refuses to write to a non-local chain. On a later key rotation, approve the new JWKS keys and revoke any retired fingerprints with the owner account. Never use the sample Anvil key or this local configuration on a public network.

`yarn workspace @se-2/foundry test --offline` includes a real Solidity verifier test using a synthetic, locally signed JWT proof. It exercises proof verification and wallet registration without Google credentials; it does not establish that the synthetic signing key belongs to Google.

Run `yarn workspace @se-2/nextjs check:circuit-artifacts` from `zeroklue-app` to confirm the browser circuit, verification-key files and Solidity verifier are generated from the same artifact. This catches mismatched proof-verifier deployments before starting the app.

## Scope and attribution

This prototype has owner-managed signing-key, domain, and OAuth-audience allowlists, but no automated trusted-key rotation, institutional enrollment check, independent cryptographic audit, or production deployment. A registry entry means an approved-key, approved-audience Google ID token with an approved Workspace domain was accepted; it must not be represented as proof of current university enrollment.

- [StealthNote](https://github.com/saleel/stealthnote): upstream attribution for the circuit artifacts in the original project documentation.
- [noir-jwt](https://github.com/saleel/noir-jwt): JWT circuit dependency.
- [Scaffold-ETH 2](https://scaffoldeth.io/): web application framework.
