# ZeroKlue Team Plan & Task Division

**Version**: 2.1 (Final Push)  
**Team Size**: 3 people  
**Time Remaining**: ~17 hours

---

## Current Status

| Component | Status | Notes |
|-----------|--------|-------|
| Noir circuit (JWT verification) | ✅ Done | Using StealthNote's proven circuit |
| HonkVerifier.sol | ✅ Done | Generated, 1884 lines |
| ZeroKlue.sol | ✅ Done | Registry + verification logic |
| Deploy script | ✅ Ready | Just needs `yarn deploy` |
| Scaffold-ETH 2 base | ✅ Set up | RainbowKit, wagmi working |
| Frontend integration | 🔴 TODO | Copy StealthNote libs, wire up |
| Merchant demo | 🔴 TODO | Simple page checking NFT |

---

## Remaining Work (Prioritized)

### MUST HAVE (Demo-blocking)

| Task | Owner | Time | Priority |
|------|-------|------|----------|
| Copy StealthNote frontend libs | Frontend | 30m | P0 |
| Add domain filter (iiitkottayam.ac.in) | Frontend | 15m | P0 |
| Create useStudentVerification hook | Frontend | 1h | P0 |
| Build VerificationCard UI | Frontend | 1h | P0 |
| Wire proof → contract call | Frontend | 1h | P0 |
| Deploy contracts to Anvil | Prajwal | 30m | P0 |
| Build merchant demo page | Frontend | 1.5h | P0 |
| E2E testing | All | 1.5h | P0 |

### NICE TO HAVE (Polish)

| Task | Owner | Time | Priority |
|------|-------|------|----------|
| Loading animations | Frontend | 30m | P1 |
| Error handling UI | Frontend | 30m | P1 |
| Hero page styling | Frontend | 30m | P1 |
| Success confetti | Frontend | 15m | P2 |
| Mobile responsive | Frontend | 1h | P2 |

---

## Team Roles

| Role | Person | Focus Area |
|------|--------|------------|
| **Blockchain Lead** | Prajwal | Circuit porting, Solidity contracts, on-chain verification |
| **Frontend Lead** | Frontend Dev 1 | Google OAuth, proof generation, wallet integration |
| **UI/UX Lead** | Frontend Dev 2 | Marketplace UI, styling, demo polish |

---

## What We're Porting from StealthNote

```
StealthNote (cloned to /tmp/research-zk/stealthnote/)
├── circuit/
│   ├── src/main.nr          ──→ packages/circuits/src/main.nr
│   └── Nargo.toml           ──→ packages/circuits/Nargo.toml
├── app/lib/
│   ├── providers/
│   │   └── google-oauth.ts  ──→ packages/nextjs/lib/google-oauth.ts
│   ├── circuits/
│   │   ├── jwt.ts           ──→ packages/nextjs/lib/circuits/jwt.ts
│   │   └── ephemeral-key.ts ──→ packages/nextjs/lib/circuits/ephemeral-key.ts
│   └── utils/
│       └── various          ──→ packages/nextjs/lib/utils/
```

---

## Detailed Task Breakdown

### Hour 0-2: Setup & Understanding

| Task | Owner | Time | Deliverable |
|------|-------|------|-------------|
| Study StealthNote codebase | ALL | 1h | Understand OAuth + proof flow |
| Port circuit files | Prajwal | 30m | Working `packages/circuits/` |
| Test circuit compiles | Prajwal | 30m | `nargo compile` succeeds |

### Hour 2-6: Core Infrastructure

| Task | Owner | Time | Deliverable |
|------|-------|------|-------------|
| Generate Solidity verifier | Prajwal | 1h | `Verifier.sol` in foundry |
| Write ZeroKlue.sol | Prajwal | 2h | NFT + nullifier contract |
| Contract tests | Prajwal | 1h | Foundry tests passing |
| Port OAuth helpers | Frontend 1 | 2h | Google sign-in working |
| Port proof gen helpers | Frontend 1 | 2h | JWT proof generation working |

### Hour 6-12: Frontend Integration

| Task | Owner | Time | Deliverable |
|------|-------|------|-------------|
| Connect wallet + OAuth flow | Frontend 1 | 2h | Full verification flow |
| Proof → Contract submission | Frontend 1 | 2h | NFT minted on success |
| Error handling | Frontend 1 | 2h | User-friendly errors |
| Landing page | Frontend 2 | 2h | Hero section, how it works |
| Verification UI | Frontend 2 | 2h | Progress steps, loading states |
| Marketplace grid | Frontend 2 | 2h | Offer cards (mock data) |

### Hour 12-18: Integration & Testing

| Task | Owner | Time | Deliverable |
|------|-------|------|-------------|
| E2E integration test | Prajwal | 2h | Full flow on localhost |
| Deploy to Anvil | Prajwal | 1h | Contracts on local chain |
| Gas optimization | Prajwal | 1h | Reasonable verification cost |
| Frontend polish | Frontend 2 | 3h | Animations, responsive |
| Connect UI to contracts | Frontend 1 | 2h | Live contract calls |
| Bug fixes | ALL | 2h | Stability |

### Hour 18-24: Demo Prep

| Task | Owner | Time | Deliverable |
|------|-------|------|-------------|
| Demo script | Prajwal | 1h | Step-by-step demo plan |
| Presentation slides | Frontend 2 | 2h | Pitch deck |
| Practice demo | ALL | 1h | Smooth presentation |
| Final testing | ALL | 2h | Everything works |
| Buffer for issues | ALL | 2h | Flex time |

---

## Critical Path

```
    HOUR 0          HOUR 6          HOUR 12         HOUR 18         HOUR 24
      │               │               │               │               │
      ▼               ▼               ▼               ▼               ▼
    ┌─────────────────────────────────────────────────────────────────────┐
    │ PRAJWAL: Circuit → Verifier.sol → ZeroKlue.sol → Integration → Demo │
    └─────────────────────────────────────────────────────────────────────┘
    ┌─────────────────────────────────────────────────────────────────────┐
    │ FRONTEND 1: Study → Port OAuth → Port Proof → Connect → E2E        │
    └─────────────────────────────────────────────────────────────────────┘
    ┌─────────────────────────────────────────────────────────────────────┐
    │ FRONTEND 2: Study → Landing → Verify UI → Marketplace → Polish     │
    └─────────────────────────────────────────────────────────────────────┘
```

**Blocking Dependencies:**
1. Circuit must compile → before Solidity verifier
2. Solidity verifier → before ZeroKlue.sol integration
3. OAuth helpers → before Frontend can test
4. Proof generation → before Contract submission

---

## Parallel Work Streams

### Stream 1: Contracts (Prajwal)
```
packages/circuits/      ──→ packages/foundry/contracts/
     main.nr                    Verifier.sol
                                ZeroKlue.sol
```

### Stream 2: Auth & Proof (Frontend 1)
```
packages/nextjs/lib/
    google-oauth.ts     ──→ VerifyStudent.tsx
    circuits/jwt.ts          useStudentVerification.ts
```

### Stream 3: UI (Frontend 2)
```
packages/nextjs/
    app/page.tsx
    components/
        DiscountMarketplace.tsx
        StudentNFT.tsx
        VerificationProgress.tsx
```

---

## Communication Checkpoints

| Time | Checkpoint | Goal |
|------|------------|------|
| Hour 2 | Circuit compiles | Verify StealthNote port works |
| Hour 6 | Contracts deploy | Verifier + NFT on localhost |
| Hour 10 | OAuth works | Can sign in with Google |
| Hour 14 | E2E works | Full flow completes once |
| Hour 18 | Demo ready | Can show to someone |
| Hour 22 | Final test | Everything stable |

---

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Circuit doesn't compile | Medium | HIGH | Test early, hour 0-2 |
| Solidity verifier too big | Medium | HIGH | May need to split or simplify |
| OAuth setup issues | Low | Medium | Use localhost, no domain needed |
| Proof generation slow | Low | Low | Expected 20-40s, show loading |
| Gas too high | Medium | Medium | Demo on localhost, no real gas |

---

## File Ownership

| File/Folder | Owner | Status |
|-------------|-------|--------|
| `packages/circuits/` | Prajwal | ✅ Done |
| `packages/foundry/contracts/HonkVerifier.sol` | Prajwal | ✅ Done |
| `packages/foundry/contracts/ZeroKlue.sol` | Prajwal | ✅ Done |
| `packages/nextjs/lib/providers/google-oauth.ts` | Frontend | 🔴 TODO |
| `packages/nextjs/lib/circuits/jwt.ts` | Frontend | 🔴 TODO |
| `packages/nextjs/lib/ephemeral-key.ts` | Frontend | 🔴 TODO |
| `packages/nextjs/hooks/useStudentVerification.ts` | Frontend | 🔴 TODO |
| `packages/nextjs/components/VerificationCard.tsx` | Frontend | 🔴 TODO |
| `packages/nextjs/app/page.tsx` | Frontend | 🔴 TODO |
| `packages/nextjs/app/merchant/page.tsx` | Frontend | 🔴 TODO |
| `packages/nextjs/contracts/deployedContracts.ts` | Prajwal | 🔴 After deploy |

---

## Files to Copy from StealthNote

```bash
# From StealthNote repo to ZeroKlue
# (adjust paths as needed)

# OAuth provider
cp stealthnote/app/lib/providers/google-oauth.ts \
   zeroklue-app/packages/nextjs/lib/providers/

# Circuit helper
cp stealthnote/app/lib/circuits/jwt.ts \
   zeroklue-app/packages/nextjs/lib/circuits/

# Ephemeral key
cp stealthnote/app/lib/ephemeral-key.ts \
   zeroklue-app/packages/nextjs/lib/

# Lazy modules
cp stealthnote/app/lib/lazy-modules.ts \
   zeroklue-app/packages/nextjs/lib/

# Utils
cp stealthnote/app/lib/utils.ts \
   zeroklue-app/packages/nextjs/lib/

# Circuit artifacts
cp stealthnote/app/assets/jwt/circuit.json \
   zeroklue-app/packages/nextjs/public/circuits/
cp stealthnote/app/assets/jwt/circuit-vkey.json \
   zeroklue-app/packages/nextjs/public/circuits/
```

---

## Quick Commands

```bash
# Prajwal - Deploy contracts
cd zeroklue-app && yarn chain   # Terminal 1
cd zeroklue-app && yarn deploy  # Terminal 2 (after chain is running)

# Frontend - Start dev
cd zeroklue-app && yarn install
cd zeroklue-app/packages/nextjs && yarn add @aztec/bb.js @noir-lang/noir_js noir-jwt @noble/ed25519 @noble/hashes
yarn start

# Test full flow
# 1. MetaMask: Add network localhost:8545, chain ID 31337
# 2. Import test account (Anvil provides private keys)
# 3. Open localhost:3000
# 4. Connect wallet → Verify with Google → Wait for proof → Check merchant page
```

---

## Demo Day Checklist

- [ ] Local chain running (Anvil)
- [ ] Contracts deployed
- [ ] Frontend running on localhost:3000
- [ ] MetaMask connected to localhost:8545
- [ ] Test account with ETH imported
- [ ] Google OAuth working
- [ ] Proof generation completes (~30 sec)
- [ ] Contract verification succeeds
- [ ] Merchant page shows discount for verified wallet
- [ ] Demo script practiced

---

## Time Budget (Remaining ~17 hours)

| Phase | Time | Running Total |
|-------|------|---------------|
| Frontend integration | 3h | 3h |
| Contract deployment | 0.5h | 3.5h |
| Merchant demo page | 1.5h | 5h |
| E2E testing + debugging | 2h | 7h |
| Demo polish | 1h | 8h |
| Buffer for issues | 2h | 10h |
| **Presentation prep** | 2h | 12h |
| **Sleep/rest** | 5h | 17h |

**You have enough time. Stay focused. Ship it.** 🚀

---

## Success = Demo This Flow

```
1. Land on zeroklue.xyz (localhost:3000)
2. See locked offers (Spotify, GitHub, etc.)
3. Click "Connect Wallet" → MetaMask connects
4. Click "Verify with Google" → OAuth popup
5. Sign in with @university.edu account
6. See "Generating proof..." (20-40 seconds)
7. See "Minting NFT..."
8. 🎉 "You're verified!" + NFT card appears
9. Offers are now unlocked
10. Click one offer → shows verification success
```

**That's it. If we can demo this flow, we win.**
