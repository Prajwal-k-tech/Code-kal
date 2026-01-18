# ZeroKlue Circuits

> **Note:** This folder contains the Noir circuit source. The actual compiled circuit we use is pre-compiled from [StealthNote](https://github.com/saleel/stealthnote).

---

## Where the Compiled Circuit Lives

```
zeroklue-app/packages/nextjs/public/circuits/
├── circuit.json       # Compiled Noir circuit (1.3MB)
└── circuit-vkey.json  # Verification key
```

**You don't need to compile anything.** Everything is ready to use.

---

## What the Circuit Proves

| Claim | Method |
|-------|--------|
| JWT is valid | RSA-SHA256 signature verification |
| Email domain is correct | Pattern matching in JWT payload |
| Nullifier | Poseidon hash for sybil resistance |
| Session binding | Ephemeral key hash |

---

## Resources

- [StealthNote](https://github.com/saleel/stealthnote) - Source of the circuit
- [noir-jwt](https://github.com/saleel/noir-jwt) - JWT verification in Noir
- [Noir Docs](https://noir-lang.org/docs) - Language reference
