# ZeroKlue

ZeroKlue is a prototype for generating a JWT proof in the browser and checking it on-chain before recording a wallet. It combines Google Workspace sign-in, a Noir JWT circuit, an UltraHonk verifier, and a small Solidity registry.

## Flow

1. The browser requests a Google ID token with a nonce bound to a short-lived ephemeral key.
2. It generates a zero-knowledge proof from the token and circuit inputs.
3. The wallet submits the proof and its 85 public inputs to `ZeroKlue`.
4. The contract checks the key expiry, calls the generated Honk verifier, then records the ephemeral key for that wallet. Reused keys and invalid proofs are rejected.

The contract verifies that a proof satisfies the compiled circuit. **This is a prototype, not production student verification.** The circuit accepts a supplied RSA key and does not prove that the key belongs to Google; its domain input and `email_verified` claim therefore do not independently establish a Google-issued student credential. It also does not constrain JWT issuer, audience, or expiry. The browser fetches a Google key and checks Workspace claims locally, but callers can bypass browser code. The public-input expiry only limits the ephemeral key lifetime.

The circuit source imports [`noir-jwt`](https://github.com/saleel/noir-jwt). The compiled circuit and verification key are checked in under `zeroklue-app/packages/nextjs/public/circuits/`; the Solidity verifier is checked in under both `packages/circuits/` and `zeroklue-app/packages/foundry/contracts/`. `packages/circuits/build.sh` regenerates these outputs from the Noir package using Nargo and Barretenberg. The original project documentation attributes the circuit artifacts to [StealthNote](https://github.com/saleel/stealthnote); retain that attribution and review its license when redistributing. The Noir toolchain was unavailable for this change, so the checked-in outputs were not regenerated or compared against the source here.

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

Open [http://localhost:3000](http://localhost:3000), connect to the local chain, and use the verification flow. Root-level `npm run dev`, `build`, `start`, `lint`, and `typecheck` shortcuts are also available. `npm run contracts:test` runs the Foundry contract tests. The contract tests use a mock verifier to cover registry behavior; they do not test a real generated proof. The browser proof and local-chain transaction should be tried with a Google OAuth client configured for the local origin.

Run `yarn workspace @se-2/nextjs check:circuit-artifacts` from `zeroklue-app` to confirm the browser circuit, verification-key files and Solidity verifier are generated from the same artifact. This catches mismatched proof-verifier deployments before starting the app.

## Scope and attribution

This prototype does not include trusted-key rotation/allowlisting, a production credential policy, an independent cryptographic audit, or a production deployment. A verified registry entry means the deployed verifier accepted the submitted proof under its compiled circuit; it must not be represented as proof of university enrollment.

- [StealthNote](https://github.com/saleel/stealthnote): upstream attribution for the circuit artifacts in the original project documentation.
- [noir-jwt](https://github.com/saleel/noir-jwt): JWT circuit dependency.
- [Scaffold-ETH 2](https://scaffoldeth.io/): web application framework.
