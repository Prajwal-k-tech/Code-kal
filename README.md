# ZeroKlue

ZeroKlue is a prototype for browser-based Google sign-in and JWT proof generation, paired with a Solidity contract that records a wallet verification flag. The current contract does not verify a proof: the frontend generates proof data but submits only an ephemeral public key to `registerStudent`, and the contract accepts any unused key. As implemented, an on-chain verified flag is not evidence that the wallet proved a university credential.

## What the Noir source specifies

The checked-in source at `packages/circuits/src/main.nr` uses `noir-jwt` and specifies a circuit that:

- verifies an RSA/SHA-256 signed JWT using the supplied public key and signature;
- asserts that the JWT's `email_verified` claim is `true`;
- checks that the email claim contains a supplied domain after `@`;
- binds the JWT nonce to a Poseidon2 hash of an ephemeral public key, salt, and expiry value.

Signature verification uses the supplied public key; the statement alone does not establish that the key belongs to Google. A trusted-key binding must be enforced separately. This source does not assert JWT issuer, audience, or expiry claims, and does not prove the Google `hd` hosted-domain claim. It binds an expiry value into the nonce hash but does not check that the value is still in the future. The browser OAuth code checks for an `hd` value locally, but that local check is not part of the circuit statement. A hosted Google Workspace domain is not necessarily a university domain.

There is also an artifact mismatch to resolve before describing the proof as implemented: `packages/circuits/README.md` says the shipped compiled circuit is precompiled from [StealthNote](https://github.com/saleel/stealthnote) and points to the artifacts in `zeroklue-app/packages/nextjs/public/circuits/`. It does not establish that the compiled artifact was built from the checked-in `main.nr`. Preserve this upstream attribution. The project also uses [`noir-jwt`](https://github.com/saleel/noir-jwt); it is not an original cryptographic construction.

## Local development

The app workspace requires Node.js 20.18.3 or later and its checked-in Yarn 3.2.3 release. The local chain flow also requires Foundry/Anvil. Google OAuth client configuration is required to use sign-in. Root `npm run` shortcuts delegate to the actual nested workspace.

```bash
git clone https://github.com/Prajwal-k-tech/Code-kal.git
cd Code-kal/zeroklue-app
node .yarn/releases/yarn-3.2.3.cjs install --immutable
```

From the repository root, `npm run dev`, `npm run build`, `npm run start`,
`npm run lint`, and `npm run typecheck` forward to the real nested workspace.
`npm run contracts:test` requires Foundry and runs its Solidity tests.

From `zeroklue-app`, start a local chain, deploy the configured contracts, and start the frontend in separate terminals:

```bash
node .yarn/releases/yarn-3.2.3.cjs chain
```

```bash
node .yarn/releases/yarn-3.2.3.cjs deploy
```

```bash
node .yarn/releases/yarn-3.2.3.cjs start
```

Open [http://localhost:3000](http://localhost:3000). On Node.js 26.8.1, the
Next.js production build, lint and TypeScript check pass; the production server
returned HTTP 200 for `/`, `/verify`, `/marketplace` and `/merchant`. Dependency
installation completed with warnings because the optional `sharp` native build
failed on this host. The Anvil deployment and browser OAuth/proof-generation flow
have not been verified end to end. The contract does not check the generated
proof; the app labels its on-chain entry as a prototype record rather than a
verified student credential. Foundry tests were not run because Foundry was not
installed on the validation host.

## Current contract behavior

`ZeroKlue.sol` defines `registerStudent(bytes32 ephemeralPubkey)`. It records the caller, timestamp, and key after checking only that the key has not been used. The call accepts no proof or public inputs and invokes no verifier. The frontend submission paths generate proof data but pass only the ephemeral public key to this method. Therefore, a direct caller can set their wallet's `isVerified` flag with an arbitrary unused key. The one-use key check does not establish student status or Sybil resistance.

The browser receives the Google ID token and generates proof material client-side. The token and identity are handled in the browser flow, but this alone does not guarantee that identity is hidden from Google, browser extensions, or every application component. No end-to-end privacy or production security guarantee is claimed.

## Limitations and attribution

- The source-level JWT checks and the shipped compiled circuit have not been shown to match.
- The generated proof is not submitted to or verified by the Solidity contract in the inspected flow.
- The contract's wallet flag therefore must not be presented as a cryptographically verified credential.
- No independent protocol audit or production deployment evidence is documented.
- Application ideas such as airdrops, token-gated communities, or DAO Sybil resistance are not validated deployments.

Upstream projects:

- [StealthNote](https://github.com/saleel/stealthnote), identified in the circuits README as the source of the shipped compiled circuit. Preserve this attribution and check the upstream license when redistributing.
- [noir-jwt](https://github.com/saleel/noir-jwt), used by the checked-in Noir source.
- [Scaffold-ETH 2](https://scaffoldeth.io/), used as the web app framework.
