# Circuit source and artifacts

`src/main.nr` defines the JWT proof statement. `build.sh` compiles it with Nargo, writes the browser artifact and verification key, and generates `zeroklue-app/packages/foundry/contracts/HonkVerifier.sol`. The app uses the checked-in browser artifact; the contract invokes the checked-in verifier.

The original project documentation attributes the circuit artifacts to [StealthNote](https://github.com/saleel/stealthnote). Preserve that attribution and review the upstream license when redistributing. The source imports [`noir-jwt`](https://github.com/saleel/noir-jwt).

The checked-in browser artifact was reproduced from `src/main.nr` with Noir `1.0.0-beta.3`; `noir_version`, artifact hash, and bytecode match. The Solidity verifier and all verification-key copies were regenerated from that artifact after an end-to-end test found the old Solidity key did not match it. The imported `noir-jwt` dependency does not compile with newer Noir releases. Nargo's manifest constraint cannot pin a prerelease version, so use `1.0.0-beta.3` when recompiling. From `zeroklue-app`, run `yarn workspace @se-2/nextjs check:circuit-artifacts` to detect drift among generated files.

## What the circuit checks

- RSA/SHA-256 signature against the public key provided as an input.
- `email_verified == true` and an email/domain match.
- A JWT nonce bound to the ephemeral key, salt, and expiry.

The circuit verifies the RSA signature against its public modulus input and proves a verified email ends in the public domain input. The contract now requires owner-approved fingerprints for both values before recording a wallet. Contract owners must derive signing-key fingerprints only from Google's published JWKS and approve only institutional domains they intend to accept. Key rotation requires updating the on-chain allowlist. The circuit still does not check the JWT issuer, audience, or expiry, and a verified Workspace email does not prove current student enrollment. Treat this as a prototype, not production credential verification.
