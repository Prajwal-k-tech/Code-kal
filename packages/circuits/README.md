# ZeroKlue Circuits

> ⚠️ **STATUS: DEPRECATED** - This folder contains the original circuit plan. The actual circuit we use is from [StealthNote](https://github.com/nicholashc/stealthnote) and is already compiled in `zeroklue-app/packages/nextjs/public/circuits/`.

---

## What We Actually Use

**We use StealthNote's JWT verification circuit** - a production-ready Noir circuit that verifies Google OAuth JWTs directly in zero-knowledge.

### Location of Real Circuit Artifacts

```
zeroklue-app/
└── packages/nextjs/public/circuits/
    ├── circuit.json          # Compiled circuit (1.3MB) - Noir 1.0.0-beta.3
    └── circuit-vkey.json     # Verification key
```

These are loaded by the frontend at runtime via `lib/circuits/jwt.ts`.

### What the Circuit Proves

| What | How |
|------|-----|
| **JWT is valid** | RSA signature verification against Google's public key |
| **Email domain is .edu** | Pattern matching inside the JWT payload |
| **Nullifier derivation** | Poseidon hash of email for sybil resistance |
| **Ephemeral key binding** | Proof is bound to this session/wallet |

### Public Inputs (85 total)

The circuit produces 85 public inputs, including:
- JWT claims commitment
- Domain hash (split into lo/hi)  
- Nullifier (prevents double-verification)
- Ephemeral key hash

### Key Dependency

```toml
# In any Nargo.toml that compiles this circuit:
[dependencies]
noir_jwt = { tag = "v0.2.1", git = "https://github.com/saleel/noir-jwt" }
```

---

## Why We Don't Use the Original Plan

The original plan in this folder used:
- ❌ EdDSA signatures (requires backend to sign credentials)
- ❌ OTP email verification (requires Redis, Resend, server)
- ❌ 4 public inputs (didn't support JWT)

**The JWT approach is better because:**
- ✅ No backend needed - Google signs the JWT
- ✅ No OTP needed - OAuth is instant
- ✅ Battle-tested - StealthNote circuit is production-ready

---

## For Frontend Developers

**You don't need to compile anything.** The circuit is pre-compiled and lives at:
```
zeroklue-app/packages/nextjs/public/circuits/circuit.json
```

Proof generation happens in the browser via:
```
zeroklue-app/packages/nextjs/lib/circuits/jwt.ts
```

See [FRONTEND_GUIDE.md](../../FRONTEND_GUIDE.md) for integration details.

---

## Resources

- [StealthNote GitHub](https://github.com/nicholashc/stealthnote) - Source of the circuit
- [noir-jwt Library](https://github.com/saleel/noir-jwt) - JWT verification in Noir
- [Noir Documentation](https://noir-lang.org/docs) - General Noir reference
