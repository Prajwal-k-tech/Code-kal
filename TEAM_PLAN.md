# ZeroKlue Team Plan & Task Division

**Version**: 2.0 (StealthNote Fork Approach)  
**Team Size**: 3 people  
**Timeline**: 24 hours

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
| `packages/circuits/` | Prajwal | 🔴 Not started |
| `packages/foundry/contracts/Verifier.sol` | Prajwal | 🔴 Not started |
| `packages/foundry/contracts/ZeroKlue.sol` | Prajwal | 🔴 Not started |
| `packages/nextjs/lib/google-oauth.ts` | Frontend 1 | 🔴 Not started |
| `packages/nextjs/lib/circuits/` | Frontend 1 | 🔴 Not started |
| `packages/nextjs/components/VerifyStudent.tsx` | Frontend 1 | 🔴 Not started |
| `packages/nextjs/app/page.tsx` | Frontend 2 | 🔴 Not started |
| `packages/nextjs/components/DiscountMarketplace.tsx` | Frontend 2 | 🔴 Not started |

---

## Quick Commands

```bash
# Prajwal - Circuit & Contracts
cd packages/circuits && nargo compile
bb write_vk -b ./target/main.json -o ./target --oracle_hash keccak
bb write_solidity_verifier -k ./target/vk -o ../foundry/contracts/Verifier.sol
cd ../foundry && forge test

# Frontend 1 - Start dev
cd zeroklue-app && yarn install && yarn start

# Frontend 2 - Just UI work
cd zeroklue-app/packages/nextjs && yarn dev
```

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
