# ZeroKlue Reality Check: MVP vs Future Vision

> **TL;DR**: This is a solid, proven ZK pattern. StealthNote already shipped something nearly identical. We're simplifying for hackathon.

---

## Is This Idea Actually Good?

### ✅ YES. Here's proof:

| Existing Project | Stars | Status | Similarity to ZeroKlue |
|-----------------|-------|--------|------------------------|
| [StealthNote](https://github.com/saleel/stealthnote) | 49 | Live at stealthnote.xyz | 95% - Anonymous org membership via ZK |
| [Anon-Aadhaar](https://github.com/anon-aadhaar/anon-aadhaar-noir) | Active | Production | Same pattern, different credential |
| [ZKPassport](https://github.com/zkpassport/) | Active | Production | Passport instead of email |
| [noir-semaphore](https://github.com/distributed-lab/noir-semaphore) | 11 | Complete | Our nullifier pattern |

**We're not inventing anything new.** We're applying a proven pattern (ZK credential verification) to a specific use case (student discounts).

---

## MVP (24 Hours) vs Future Vision

### 🎯 What We're Building NOW

```
┌──────────────────────────────────────────────────────────────┐
│  HACKATHON MVP SCOPE (24 HOURS)                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Email Verification                                       │
│     ├─ Hipo API for domain check (10K+ universities)         │
│     ├─ Resend for OTP emails (100 free/day)                  │
│     └─ 6-digit OTP with 10min expiry                         │
│                                                              │
│  2. Credential Issuance                                      │
│     ├─ Backend generates EdDSA keypair (BabyJubJub)          │
│     ├─ Signs: message = poseidon(wallet, email_hash)         │
│     └─ Returns signature + nullifier_seed to user            │
│                                                              │
│  3. ZK Proof Generation (IN BROWSER)                         │
│     ├─ NoirJS + Barretenberg WASM (~8MB)                     │
│     ├─ Proves: "I have valid issuer signature"               │
│     ├─ Outputs: nullifier (public), proof                    │
│     └─ TIME: 15-40 seconds (realistic!)                      │
│                                                              │
│  4. On-Chain Verification                                    │
│     ├─ UltraHonk verifier contract                           │
│     ├─ Nullifier registry (prevents double-mint)             │
│     └─ Soulbound ERC-721 mint                                │
│                                                              │
│  5. Demo Merchant                                            │
│     ├─ /merchant route                                       │
│     ├─ Check NFT ownership                                   │
│     └─ Show discount price                                   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 🚀 Future Vision (NOT for hackathon)

| Feature | Hackathon | Future |
|---------|-----------|--------|
| Email verification | OTP + domain allowlist | OIDC/OAuth with Google Workspace |
| Credential type | EdDSA signature | JWT verification (like StealthNote) |
| University validation | Hipo API | University partnerships, .edu registry |
| Proof generation | Browser (15-40s) | Optimized proving server + client hints |
| NFT | Simple soulbound | Time-bounded, updatable metadata |
| Merchant integration | Demo page | SDK, REST API, Shopify plugin |
| Privacy | Email hash hidden | Full OIDC claim hiding |
| Multi-chain | Holesky testnet | Mainnet + L2s (Base, Optimism) |

---

## Honest Time Estimates

### ZK Circuit Development (Person 3 or 4)

| Task | Optimistic | Realistic | Pessimistic |
|------|-----------|-----------|-------------|
| Circuit logic (main.nr) | 2h | 4h | 6h |
| Backend EdDSA signing | 1h | 2h | 4h |
| NoirJS browser integration | 2h | 4h | 8h |
| Verifier contract generation | 0.5h | 1h | 2h |
| Integration testing | 2h | 4h | 6h |
| **TOTAL** | **7.5h** | **15h** | **26h** |

**Mitigation**: Our circuit is MUCH simpler than StealthNote's. They parse JWTs and verify RSA. We just verify EdDSA + compute nullifier.

### What Could Go Wrong

1. **EdDSA key mismatch** - Backend must use same curve as Noir's EdDSA lib (BabyJubJub)
2. **NoirJS version conflicts** - Pin exact versions
3. **Browser memory** - WASM needs ~500MB for proving
4. **Mobile browsers** - May crash. Focus on desktop for demo.

---

## Reference Resources (Steal This Code)

### 1. StealthNote's Lazy Module Loading
```typescript
// https://github.com/saleel/stealthnote/blob/main/app/lib/lazy-modules.ts
export async function initProver() {
  const [{ Noir }, { UltraHonkBackend }] = await Promise.all([
    import("@noir-lang/noir_js"),
    import("@aztec/bb.js"),
  ]);
  return { Noir, UltraHonkBackend };
}
```

### 2. StealthNote's Ephemeral Key Generation
```typescript
// https://github.com/saleel/stealthnote/blob/main/app/lib/ephemeral-key.ts
import * as ed25519 from '@noble/ed25519';
// Uses BabyJubJub for EdDSA - matches Noir's curve
```

### 3. noir-semaphore's Solidity Contracts
```
https://github.com/distributed-lab/noir-semaphore/tree/main/packages/contracts
```

### 4. Official NoirJS Tutorial
```
https://noir-lang.org/docs/tutorials/noirjs_app
```

---

## Key Dependencies (Pin These Versions!)

```json
{
  "@noir-lang/noir_js": "1.0.0-beta.15",
  "@aztec/bb.js": "3.0.0-nightly.20251104",
  "@noble/ed25519": "^2.0.0"
}
```

---

## Circuit Complexity Comparison

| Project | Circuit | Gate Count | Proving Time | Complexity |
|---------|---------|------------|--------------|------------|
| **ZeroKlue** | EdDSA verify + nullifier | ~10-20K | ~15s | Low ✅ |
| StealthNote | RSA verify + JWT parse | ~500K+ | ~20-30s | Very High |
| noir-semaphore | Merkle + nullifier | ~30K | ~15-20s | Medium |

**We're on the simpler end!**

---

## Final Verdict

| Question | Answer |
|----------|--------|
| Is the idea good? | ✅ Yes, proven pattern |
| Is it technically feasible? | ✅ Yes, simpler than existing projects |
| Can we finish in 24h? | ⚠️ Tight but doable with focus |
| What's the risk? | Integration bugs, not fundamentals |
| What if ZK is too slow? | Demo on good laptop, show pre-recorded backup |

---

## Team Action Items

1. **ZK Dev**: Clone noir-semaphore, study their circuit structure
2. **Backend Dev**: Study StealthNote's ephemeral key generation
3. **Frontend Dev**: Implement lazy loading for NoirJS
4. **Contract Dev**: Use foundry-noir-helper for integration

**Start with the happy path. Polish later.**
