# ZeroKlue Backend

> ⚠️ **STATUS: DEPRECATED - NOT USED**

---

## This Folder Is Obsolete

This backend was designed for the **old OTP-based approach** which required:
- Redis for OTP storage
- Resend for email delivery  
- EdDSA credential signing
- A running server

**WE NO LONGER USE THIS.**

---

## Current Approach (No Backend)

ZeroKlue now uses **Google OAuth JWTs** verified directly in zero-knowledge:

```
┌──────────────────────────────────────────────────────────────────┐
│                       NO BACKEND NEEDED                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Browser                                                        │
│   ├── Google OAuth → Returns JWT signed by Google                │
│   ├── NoirJS → Generates ZK proof of JWT validity                │
│   └── wagmi → Submits proof to smart contract                    │
│                                                                  │
│   Smart Contract (Anvil/Sepolia)                                 │
│   ├── HonkVerifier.sol → Verifies ZK proof                       │
│   └── ZeroKlue.sol → Mints soulbound NFT                         │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

**Benefits of JWT approach:**
- ✅ No server to run or deploy
- ✅ No Redis, no email service
- ✅ No secrets to manage
- ✅ Truly trustless - Google is the only signer
- ✅ Works entirely client-side

---

## Where the Real Code Lives

All verification logic is in the frontend:

```
zeroklue-app/packages/nextjs/
├── lib/
│   ├── providers/google-oauth.ts    # Google OAuth + JWT extraction
│   ├── circuits/jwt.ts              # ZK proof generation
│   └── ephemeral-key.ts             # Session key management
├── hooks/
│   └── useStudentVerification.ts    # React hook for full flow
└── public/circuits/
    ├── circuit.json                 # Compiled Noir circuit
    └── circuit-vkey.json            # Verification key
```

---

## Can This Folder Be Deleted?

**Yes**, but we're keeping it as a historical reference. The code here shows the original OTP approach we considered but abandoned in favor of the superior JWT approach.

If you're working on ZeroKlue, **ignore this folder entirely**.

---

## See Instead

- [FRONTEND_GUIDE.md](../../FRONTEND_GUIDE.md) - How to build the frontend
- [ROADMAP.md](../../ROADMAP.md) - What needs to be done
- [ENGINEERING_PLAN.md](../../ENGINEERING_PLAN.md) - Technical architecture
