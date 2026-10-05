# Circuit source and artifacts

`src/main.nr` defines the JWT proof statement. `build.sh` compiles it with Nargo, writes the browser artifact and verification key, and generates `zeroklue-app/packages/foundry/contracts/HonkVerifier.sol`. The app uses the checked-in browser artifact; the contract invokes the checked-in verifier.

The original project documentation attributes the circuit artifacts to [StealthNote](https://github.com/saleel/stealthnote). Preserve that attribution and review the upstream license when redistributing. The source imports [`noir-jwt`](https://github.com/saleel/noir-jwt).

The Noir and Barretenberg toolchain was unavailable during this update, so the checked-in circuit artifact and verifier were not regenerated or compared against `src/main.nr` here. Run `build.sh` and review the resulting artifact/verifier changes before relying on a source change.

## What the circuit checks

- RSA/SHA-256 signature against the public key provided as an input.
- `email_verified == true` and an email/domain match.
- A JWT nonce bound to the ephemeral key, salt, and expiry.

The circuit does not constrain the RSA key to Google's published keys or check JWT issuer, audience, or expiry. The browser's Google key lookup and hosted-domain check are outside the proof statement. The on-chain contract verifies the proof and rejects expired ephemeral keys, but this does not establish that the token is Google-issued or that its holder is a student. Treat the app as a prototype, not production credential verification.
