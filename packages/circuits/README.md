# Circuit source and artifacts

`src/main.nr` is the Noir source checked into this repository. The browser loads the compiled circuit from `zeroklue-app/packages/nextjs/public/circuits/circuit.json`.

The checked-in artifacts are attributed to [StealthNote](https://github.com/saleel/stealthnote) in the original project documentation. This repository does not establish that they were compiled from the checked-in `main.nr`; treat the source and artifacts as separate until reproducible build output is compared. The source also imports [`noir-jwt`](https://github.com/saleel/noir-jwt).

## Current limits

- The browser code generates proof material but does not verify it with the available verifier interface.
- The app submits only an ephemeral public key to `ZeroKlue.registerStudent`.
- `ZeroKlue` does not invoke a verifier, so its registered flag is not evidence that the circuit accepted a credential.
- The source checks JWT signature, `email_verified`, an email domain, and a nonce binding. It does not establish that the supplied signing key is Google's, and it does not check issuer, audience, or JWT expiry.
- The OAuth flow checks Google's hosted-domain (`hd`) value in browser code. The circuit does not prove that claim, and a Workspace domain does not by itself establish student status.

Do not describe these files as a complete or production-ready student-verification protocol. See the repository README for the full flow and limitations.
