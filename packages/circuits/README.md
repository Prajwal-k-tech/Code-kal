# Circuit source and artifacts

`src/main.nr` defines the JWT proof statement. `build.sh` compiles it with Nargo, writes the browser artifact and verification key, and generates `zeroklue-app/packages/foundry/contracts/HonkVerifier.sol`. The app uses the checked-in browser artifact; the contract invokes the checked-in verifier.

The original project documentation attributes the circuit artifacts to [StealthNote](https://github.com/saleel/stealthnote). Preserve that attribution and review the upstream license when redistributing. The source imports [`noir-jwt`](https://github.com/saleel/noir-jwt).

The checked-in browser artifact was reproduced from `src/main.nr` with Noir `1.0.0-beta.3`; `noir_version`, artifact hash, and bytecode match. The Solidity verifier and all verification-key copies were regenerated from that artifact after an end-to-end test found the old Solidity key did not match it. The imported `noir-jwt` dependency does not compile with newer Noir releases. Nargo's manifest constraint cannot pin a prerelease version, so use `1.0.0-beta.3` when recompiling. From `zeroklue-app`, run `yarn workspace @se-2/nextjs check:circuit-artifacts` to detect drift among generated files.

## What the circuit checks

- RSA/SHA-256 signature against the public key provided as an input.
- Google issuer (`https://accounts.google.com` or its legacy spelling), OAuth audience, and unexpired numeric `exp` claim.
- `email_verified == true` and an exact match between the signed Workspace `hd` claim and the public organization domain.
- A JWT nonce bound to the ephemeral key, salt, and ephemeral-key expiry.

The contract requires owner-approved fingerprints for the signing key, Workspace domain, and OAuth client ID, and checks the ID-token and ephemeral-key expiries against chain time before recording a wallet. Contract owners must derive signing-key fingerprints only from Google's published JWKS and approve only intended institutional domains and OAuth clients. Key rotation requires updating the on-chain allowlist. These checks do not prove current student enrollment. Treat this as a prototype, not production credential verification.
