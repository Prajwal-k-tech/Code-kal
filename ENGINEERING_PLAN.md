# ZeroKlue Engineering Implementation Plan

> **Reality Check**: 22.5 hours, 4 people, hackathon environment

## Critical Engineering Decision: Timestamp Anti-Abuse

### Problem
Students stay students for years, but some merchants want "currently enrolled" verification.

### Solution: Time-Bounded NFTs

```solidity
struct StudentVerification {
    uint256 verifiedAt;      // When proof was verified
    uint256 nullifier;       // Prevents duplicate verifications
}

// Merchants can check age
function isRecentlyVerified(address student, uint256 maxAge) public view returns (bool) {
    StudentVerification memory verification = verifications[student];
    return (block.timestamp - verification.verifiedAt) <= maxAge;
}

// Examples:
// 1 year: isRecentlyVerified(user, 365 days)
// 6 months: isRecentlyVerified(user, 180 days)
// Forever: balanceOf(user) > 0
```

**Benefits**:
- ✅ Merchants control their own policies
- ✅ No forced expiry (NFT never burns)
- ✅ Students can re-verify to refresh timestamp
- ✅ Flexible for different use cases

---

## Tech Stack (Revised - Practical for Hackathon)

### ✅ What We're ACTUALLY Using

```
┌─────────────────────────────────────────────┐
│         SCAFFOLD-ETH 2 (Base)               │
├─────────────────────────────────────────────┤
│ ✅ Foundry (contracts)                      │
│ ✅ Next.js 14 (frontend)                    │
│ ✅ RainbowKit (wallet)                      │
│ ✅ wagmi/viem (Ethereum interaction)        │
│ ✅ Tailwind + daisyUI (styling)             │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│         CUSTOM ADDITIONS                    │
├─────────────────────────────────────────────┤
│ ⚡ Noir 0.38.0 (ZK circuits)                │
│ ⚡ Express API (email verification)         │
│ ⚡ Redis (OTP storage)                      │
│ ⚡ Resend (email delivery)                  │
└─────────────────────────────────────────────┘
```

### Why This Stack?

| Technology | Why | Alternative Considered |
|------------|-----|----------------------|
| **Scaffold-ETH** | 2-hour setup → 15 minutes | Manual Next.js + Hardhat |
| **Foundry** | Fast tests, better DX | Hardhat (slower) |
| **NoirJS** | Client-side proving | Circom (more complex) |
| **Resend** | 5-min email setup | SendGrid (overkill) |
| **Redis** | OTP cache, no DB needed | PostgreSQL (overengineering) |

---

## File Structure (After Scaffold)

```
zeroklue-app/
├── packages/
│   ├── foundry/              # Smart contracts
│   │   ├── contracts/
│   │   │   └── ZeroKlue.sol
│   │   ├── script/
│   │   │   └── Deploy.s.sol
│   │   └── test/
│   │       └── ZeroKlue.t.sol
│   │
│   └── nextjs/               # Frontend
│       ├── app/
│       │   ├── page.tsx      # Main verification flow
│       │   └── merchant/     # Merchant demo
│       ├── components/
│       │   ├── EmailVerify.tsx
│       │   ├── ProofGenerator.tsx
│       │   └── StudentPass.tsx
│       └── lib/
│           └── noir/         # Noir circuits + artifacts
│
├── backend/                  # Express API (separate)
│   ├── src/
│   │   ├── routes/
│   │   └── services/
│   └── package.json
│
└── docs/
    ├── PITCH.md
    ├── HACKATHON_QA.md
    ├── PRD.md
    └── TEAM_PLAN.md
```

---

## Revised 4-Person Split (22.5 Hours)

### Person 1: Frontend + Integration Lead
**Location**: `zeroklue-app/packages/nextjs/`

**Hours 0-2: Scaffold Customization**
- [ ] Remove example contracts UI
- [ ] Create 3 pages: Verify, Marketplace, Merchant Demo
- [ ] Set up routing

**Hours 2-6: Email Verification UI**
- [ ] Email input form with domain validation
- [ ] OTP input component
- [ ] Connect to backend API
- [ ] Show credential in UI

**Hours 6-10: Proof Generation**
- [ ] Install NoirJS in Next.js
- [ ] Create proof generation component
- [ ] Show progress (compiling circuit → proving → submitting)
- [ ] Handle errors gracefully

**Hours 10-14: Marketplace**
- [ ] 4 offer cards (unlocked/locked states)
- [ ] Check NFT ownership
- [ ] Beautiful animations

**Hours 14-20: Polish + Merchant Demo**
- [ ] Create merchant demo page
- [ ] Test full flow 10 times
- [ ] Mobile responsive
- [ ] Add confetti on success 🎉

**Hours 20-22.5: Final Testing**
- [ ] Cross-browser testing
- [ ] Deploy to Vercel
- [ ] Record demo video

---

### Person 2: Backend + DevOps
**Location**: `backend/` (separate from Scaffold)

**Hours 0-2: Setup**
- [ ] Create Express app
- [ ] Set up Redis locally
- [ ] Configure Resend account
- [ ] Test email sending

**Hours 2-6: API Development**
- [ ] `POST /verify/email` (send OTP)
- [ ] `POST /verify/otp` (verify + sign)
- [ ] Domain allowlist logic
- [ ] Error handling

**Hours 6-10: Crypto Implementation**
- [ ] Research EdDSA signing with @noble/curves
- [ ] Implement signature generation
- [ ] Generate issuer keypair
- [ ] Test signature format

**Hours 10-14: Integration Testing**
- [ ] Create test credentials
- [ ] Share with Person 3 (circuits)
- [ ] Debug signature mismatches
- [ ] Document API usage

**Hours 14-18: Deployment**
- [ ] Deploy to Railway/Render
- [ ] Set up environment variables
- [ ] Test from production URL
- [ ] Monitor logs

**Hours 18-22.5: Support + Debug**
- [ ] Help Person 1 with API integration
- [ ] Fix any backend bugs
- [ ] Add logging for demo
- [ ] Backup plan if email fails

---

### Person 3: Circuits + Crypto
**Location**: `backend/lib/noir/` (circuits live here)

**Hours 0-3: Circuit Design**
- [ ] Study Anon-Aadhaar circuit structure
- [ ] Design our simpler EdDSA circuit
- [ ] Install Noir dependencies
- [ ] Set up Nargo project

**Hours 3-7: Circuit Implementation**
- [ ] Write main.nr with signature verification
- [ ] Add nullifier logic
- [ ] Create test Prover.toml
- [ ] Test with `nargo prove`

**Hours 7-11: Debugging**
- [ ] Fix circuit errors (this WILL take time)
- [ ] Coordinate with Person 2 on signature format
- [ ] Generate test vectors
- [ ] Verify proofs work

**Hours 11-15: Frontend Integration**
- [ ] Copy circuit artifacts to Next.js public folder
- [ ] Help Person 1 with NoirJS setup
- [ ] Test proof generation in browser
- [ ] Optimize for speed

**Hours 15-18: Verifier Generation**
- [ ] Generate Solidity verifier
- [ ] Give to Person 4
- [ ] Test verifier independently
- [ ] Document public inputs order

**Hours 18-22.5: Testing + Documentation**
- [ ] End-to-end proof verification
- [ ] Create test credentials for team
- [ ] Write circuit documentation
- [ ] Backup: pre-generate proof if demo breaks

---

### Person 4: Smart Contracts
**Location**: `zeroklue-app/packages/foundry/contracts/`

**Hours 0-3: Contract Design**
- [ ] Study Scaffold-ETH example contracts
- [ ] Design ZeroKlue.sol interface
- [ ] Plan storage structure
- [ ] Write pseudocode

**Hours 3-7: Contract Implementation**
```solidity
contract ZeroKlue {
    struct StudentVerification {
        uint256 verifiedAt;
        uint256 nullifier;
    }
    
    mapping(address => StudentVerification) public verifications;
    mapping(uint256 => bool) public usedNullifiers;
    
    function verifyAndMint(
        uint256[8] calldata proof,
        uint256[4] calldata publicInputs
    ) external {
        // 1. Verify ZK proof
        // 2. Check nullifier not used
        // 3. Store verification with timestamp
        // 4. Emit event
    }
    
    function isRecentlyVerified(address student, uint256 maxAge) 
        external view returns (bool) {
        // Check timestamp
    }
}
```

**Hours 7-11: Testing**
- [ ] Write Foundry tests
- [ ] Test with mock proofs
- [ ] Test nullifier prevention
- [ ] Test timestamp logic

**Hours 11-15: Verifier Integration**
- [ ] Get Solidity verifier from Person 3
- [ ] Integrate verifier into contract
- [ ] Test with real proofs
- [ ] Debug integration issues

**Hours 15-18: Deployment**
- [ ] Deploy to Holesky testnet
- [ ] Verify on Etherscan
- [ ] Test from frontend
- [ ] Get testnet ETH from faucet

**Hours 18-22.5: Merchant Demo Support**
- [ ] Create simple merchant contract/logic
- [ ] Help Person 1 with NFT checking
- [ ] Test discount logic
- [ ] Document for demo

---

## Critical Dependencies (Must Coordinate!)

### ⚠️ Person 2 → Person 3
**Blocker**: Circuit needs exact signature format from backend

**Solution**:
1. Person 2 generates keypair FIRST (Hour 6)
2. Person 2 creates test signature (Hour 7)
3. Person 3 tests circuit with this signature (Hour 8)
4. Debug together if mismatch (Hour 9-10)

### ⚠️ Person 3 → Person 4
**Blocker**: Contract needs Solidity verifier from circuit

**Solution**:
1. Person 3 generates verifier by Hour 15
2. Person 4 uses mock verifier until then
3. Swap in real verifier (Hour 15-16)
4. Test together (Hour 16-17)

### ⚠️ Person 4 → Person 1
**Blocker**: Frontend needs deployed contract address

**Solution**:
1. Person 4 deploys to testnet by Hour 15
2. Person 1 uses mock/local until then
3. Update contract address in frontend config
4. Test E2E (Hour 16-18)

### ⚠️ Person 1 → Everyone
**Blocker**: Frontend integration requires all pieces

**Solution**:
1. Person 1 builds UI with mocks first (Hour 2-10)
2. Integrate backend (Hour 10-12)
3. Integrate circuits (Hour 12-14)
4. Integrate contracts (Hour 14-16)
5. E2E testing (Hour 16-20)

---

## Realistic Scope Reduction

### 🎯 MUST HAVE (Core Demo)

1. ✅ Email verification with OTP
2. ✅ EdDSA credential signing
3. ✅ Noir circuit (even if slow)
4. ✅ Smart contract with timestamp
5. ✅ Frontend flow (email → proof → mint)
6. ✅ Merchant demo (check NFT age)

### 🌟 NICE TO HAVE (If Time Permits)

1. ⏰ Beautiful animations
2. ⏰ Multiple university domains
3. ⏰ Gas optimization
4. ⏰ Mobile responsive
5. ⏰ Error recovery

### ❌ CUT FROM SCOPE

1. ❌ Multiple merchants in marketplace
2. ❌ Real ZK email verification (use OTP)
3. ❌ Mainnet deployment
4. ❌ Audit-ready code
5. ❌ Decentralized issuer

---

## Emergency Fallback Plan

### If Circuits Break (Hour 18+)

**Option A**: Pre-generated Proof
```typescript
// Use a valid proof generated earlier
const DEMO_PROOF = "0x1234..."; // From successful test
const DEMO_PUBLIC_INPUTS = [/* ... */];
```

**Option B**: Mock Verification
```solidity
// Contract accepts any proof for demo
function verifyProof(...) internal pure returns (bool) {
    return true; // DEMO ONLY
}
```

### If Backend Breaks (Hour 18+)

**Option A**: Hardcoded OTP
```typescript
// For demo only
if (email.endsWith('@iiitkottayam.ac.in')) {
    otp = '123456'; // Always works
}
```

**Option B**: Skip Email
```typescript
// Just sign credentials directly
// No OTP verification for demo
```

### If Deployment Breaks (Hour 20+)

**Option A**: Local Demo
- Run everything locally
- Screen record
- Use pre-recorded video

**Option B**: Deployed Parts
- Frontend on Vercel (always works)
- Contract on testnet (always works)
- Backend local (show in terminal)

---

## Hour-by-Hour Checkpoints

| Hour | Checkpoint | All Hands? |
|------|-----------|-----------|
| 0 | Project structure set up | ✅ Yes |
| 2 | Everyone has their environment working | ✅ Yes |
| 6 | Backend API working, Circuit design done | No |
| 10 | Circuit compiles, Frontend UI done | No |
| 12 | Integration begins | ✅ Yes |
| 14 | Backend + Circuit working together | No |
| 16 | E2E flow works once | ✅ Yes |
| 18 | Deployed to production | ✅ Yes |
| 20 | Demo-ready, testing | ✅ Yes |
| 22 | Final polish | ✅ Yes |

---

## Key Engineering Insights

### 1. **Scaffold-ETH is CRITICAL**
- Saves 4-6 hours of setup
- Battle-tested boilerplate
- Great UI components out of the box

### 2. **EdDSA > ECDSA for Circuits**
- 10x fewer constraints
- Much faster proving
- BabyJubJub support in Noir

### 3. **Timestamp, Not Expiry**
- More flexible for merchants
- NFT never burns (better UX)
- Each merchant sets own policy

### 4. **Nullifier is Essential**
- Prevents same email → multiple wallets
- Simple: `hash(email)`
- Contract tracks used nullifiers

### 5. **OTP > ZK Email**
- ZK email circuits are HUGE (>100K constraints)
- OTP is "good enough" for hackathon
- Can upgrade to zkEmail later

### 6. **Pre-Generate Proofs for Demo**
- Proof generation might fail during demo
- Have 3-4 pre-made proofs ready
- Show code, use backup proof

---

## Success Metrics (Realistic)

**By Hour 16** (Minimum Viable Demo):
- ✅ Email → OTP → Credential works
- ✅ Circuit generates proof (even if slow)
- ✅ Contract accepts proof and mints NFT
- ✅ Merchant can check NFT age

**By Hour 20** (Polished Demo):
- ✅ Beautiful UI
- ✅ Deployed to testnet
- ✅ Merchant demo works
- ✅ No critical bugs

**By Hour 22** (Demo Ready):
- ✅ Tested 5+ times end-to-end
- ✅ Backup video recorded
- ✅ Pitch rehearsed
- ✅ Q&A prep done

---

## Technologies Summary

### Core Stack (Scaffold-ETH)
```bash
✅ Foundry (contracts)
✅ Next.js 14 (frontend)
✅ RainbowKit (wallet)
✅ Tailwind CSS (styling)
✅ daisyUI (components)
```

### Custom Additions
```bash
⚡ Noir 0.38.0 + Barretenberg
⚡ NoirJS (proof generation)
⚡ Express.js (backend API)
⚡ Redis (OTP cache)
⚡ Resend (email)
⚡ @noble/curves (EdDSA)
```

### Infrastructure
```bash
🚀 Vercel (frontend)
🚀 Railway (backend)
🚀 Holesky (testnet)
```

---

## Next Steps RIGHT NOW

1. **Person 1**: Explore Scaffold-ETH frontend (`zeroklue-app/packages/nextjs`)
2. **Person 2**: Set up backend (`backend/`) with Redis + Resend
3. **Person 3**: Study Anon-Aadhaar circuit, plan our circuit
4. **Person 4**: Read Scaffold-ETH contract examples, design ZeroKlue.sol

**All**: Meet back in 2 hours to show progress!

---

**Remember**: Hackathon code doesn't need to be perfect. It needs to DEMO well. 🚀
