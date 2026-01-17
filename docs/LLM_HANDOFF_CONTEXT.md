# 🤖 LLM Handoff Context - ZeroKlue

**Date:** January 17, 2026  
**Purpose:** Complete context for new LLM (Antigravity or other)  
**Project Status:** Backend 100% complete, Frontend 70% complete (needs UI)

---

## 📋 Quick Reference

### What This Project Is
**ZeroKlue** = Zero-knowledge student verification for Web3 discounts
- Students verify once with Google .edu email → Get soulbound NFT
- Merchants check `balanceOf(address) == 1` → Apply discount
- Privacy-preserving: Email/university never revealed on-chain

### Project State
- ✅ **Smart contracts:** 100% complete, 19/19 tests passing
- ✅ **ZK circuit:** Working (StealthNote's noir-jwt, battle-tested)
- ✅ **Backend logic:** 100% complete (OAuth, proof gen, ephemeral keys)
- ⚠️ **Frontend UI:** 30% complete (needs pages, loading states, error display)
- ✅ **Documentation:** Comprehensive (12+ docs)

---

## 🎯 Critical Context for LLM

### 1. The NFT-LIKE Interface (NOT A BUG!)

**IMPORTANT:** The contract does NOT inherit ERC721. This is INTENTIONAL.

```solidity
// ZeroKlue.sol uses NFT-LIKE interface:
function balanceOf(address user) returns (uint256) {
    return verifications[user].isVerified ? 1 : 0;  // Simple lookup
}

function transferFrom(address, address, uint256) pure {
    revert("Soulbound: cannot transfer");  // Always fails
}

// No tokenURI(), tokenId, approve(), etc. - by design!
```

**Why?**
- Gas efficient (~100K savings vs full ERC721)
- Simpler (only need binary verification check)
- Still soulbound (transferFrom reverts)
- Merchants just call `balanceOf(address) == 1`

**Testing:** Confirmed working in `test_BalanceOf()` and `test_TransferFrom_Reverts()`

### 2. No Authentication Timeout Needed

**Question:** Should we add 2-minute timeout and window-closed detection like StealthNote?

**Answer:** NO. Reviewed their code (google-oauth.ts lines 219-246). They have it because:
- They use popup OAuth as fallback
- Popups can hang indefinitely
- They check if window is closed every 1 second

**Our situation:**
- Might use Google One Tap (simpler, no popup)
- If popup closes, user can just retry
- Not critical for MVP/demo
- Adds complexity for minimal benefit

**Decision:** Skip for now. Add later if users report issues.

### 3. One Discount Per Email (Merchant Responsibility)

**Question:** How to prevent students from using discount multiple times?

**Answer:** Merchants handle this OFF-CHAIN in their own databases.

**On-Chain (ZeroKlue contract):**
- Tracks: 1 wallet = verified student (yes/no)
- Does NOT track: discounts used, emails, purchase history

**Off-Chain (Merchant system):**
```sql
-- Merchant's database
CREATE TABLE student_discounts (
    email VARCHAR(255) PRIMARY KEY,
    wallet_address VARCHAR(42),
    discount_used BOOLEAN,
    first_order_date TIMESTAMP
);

-- When student checks out:
-- 1. Check balanceOf(wallet) == 1 (verified?)
-- 2. Ask for email (order confirmation)
-- 3. Check: SELECT discount_used FROM student_discounts WHERE email = ?
-- 4. Apply discount only if verified AND NOT discount_used
```

**Why merchants handle it:**
- Privacy: We don't link wallets → emails on-chain
- Flexibility: Each merchant has own policy (1/year, 1/lifetime, etc.)
- Scalability: Databases are cheaper than blockchain
- Business logic: Merchants control their own discount rules

**Documented in:** FRONTEND_TASKS.md (Merchant Integration section)

### 4. Files User Saved

**File:** `zeroklue-app/packages/nextjs/lib/providers/google-oauth.ts`

**What it is:** Complete Google OAuth integration with error handling

**Key features:**
- Lines 40-44: Google Workspace validation (checks `hd` field)
- Lines 47-49: Email verification check
- Lines 58-70: ZK proof generation wrapper
- Clean error messages for users

**Status:** ✅ Complete and correct. User saved it properly.

**Other files in lib/**:
- `circuits/jwt.ts` - NoirJS proof generation
- `ephemeral-key.ts` - ed25519 key management
- `types.ts` - TypeScript interfaces
- `utils.ts` - Helper functions

All these backend logic files are COMPLETE. Just need UI to use them.

---

## 🚀 What Frontend Devs Need to Build

### Priority 1: Merchant Demo Page (2-3 hours)
**File:** `zeroklue-app/packages/nextjs/app/merchant-demo/page.tsx`

```tsx
// Pseudocode:
1. Connect wallet (RainbowKit - already configured)
2. Read contract: const verified = await contract.read.isVerified([address])
3. Display:
   - If verified (balanceOf == 1): "✅ Student Verified - 20% Discount!"
   - If not: "❌ Not Verified - Use your verified wallet"
4. Show sample products with discount applied
```

### Priority 2: Verification Flow UI (3-4 hours)
**File:** `zeroklue-app/packages/nextjs/app/verify/page.tsx`

```tsx
// Pseudocode:
1. Step indicator: "1. Connect → 2. Google → 3. Proof → 4. Verify"
2. Google sign-in button (use google-oauth.ts)
3. Loading states:
   - "Connecting to Google..." (1-2 sec)
   - "Generating ZK proof... (~20 seconds)" - Progress bar
   - "Submitting to blockchain..." (network dependent)
4. Error handling (display errors from google-oauth.ts):
   - Non-Workspace: "⚠️ Must use Google Workspace account"
   - Email not verified: "⚠️ Verify your email with institution"
5. Success: "✅ Verified! Transaction: [hash]"
```

### Priority 3: Homepage/Landing (2 hours)
**File:** `zeroklue-app/packages/nextjs/app/page.tsx`

```
Hero:
- "Prove You're a Student Without Revealing Your Identity"
- Subtitle: "Zero-knowledge student verification for Web3"
- CTA: "Verify Now"

How It Works:
1. Connect Wallet
2. Prove Student Status (Google OAuth)
3. Get Discounts

CTAs: "Start Verification" | "Try Demo Merchant"
```

**Full specs in:** `docs/FRONTEND_TASKS.md`

---

## 📚 Documentation Map

### Start Here (New Devs)
1. **[FRONTEND_TASKS.md](./FRONTEND_TASKS.md)** ← MOST IMPORTANT
   - Complete task list with time estimates
   - Merchant integration guide
   - Business viability calculations
   - Sample merchant store ideas

2. **[QUICKSTART.md](./QUICKSTART.md)**
   - Setup instructions
   - How to run locally
   - Test commands

3. **[FRONTEND_GUIDE.md](./FRONTEND_GUIDE.md)**
   - UI/UX guidelines
   - Component patterns

### Understanding the System
4. **[TECHNICAL_DEEP_DIVE.md](./TECHNICAL_DEEP_DIVE.md)** ← BEST FOR LEARNING
   - Complete ZK/blockchain explanation
   - How everything works under the hood
   - Circuit details, proof generation, smart contracts
   - Cryptographic primitives explained
   - Security model

5. **[PRD.md](./PRD.md)**
   - Product requirements
   - User stories
   - Success criteria

### Reference
6. **[PROJECT_AUDIT.md](./PROJECT_AUDIT.md)**
   - Component-by-component status
   - What's complete, what's missing
   - Test results

7. **[SECURITY_ANALYSIS.md](./SECURITY_ANALYSIS.md)**
   - Known risks and mitigations
   - Trust assumptions
   - Attack vectors

8. **[TECHNICAL_DECISIONS.md](./TECHNICAL_DECISIONS.md)**
   - Why we chose each technology
   - Alternative approaches considered

### Demo & Presentation
9. **[METAMASK_FOUNDRY_DEMO.md](./METAMASK_FOUNDRY_DEMO.md)**
   - How to demo with real wallets locally

10. **[HACKATHON_QA.md](./HACKATHON_QA.md)**
    - Answers to judges' questions

11. **[PITCH.md](./PITCH.md)**
    - Elevator pitch

---

## 🔑 Key Technical Details

### The Complete Verification Flow

```
1. USER ACTION: Clicks "Verify with Google"
   ↓
2. GOOGLE OAUTH: User signs in, Google returns JWT
   File: lib/providers/google-oauth.ts (verifyWithGoogle function)
   ↓
3. JWT PARSING: Extract email, domain (hd), expiry
   Validation: 
   - Check payload.hd exists (Workspace account)
   - Check payload.email_verified === true
   ↓
4. EPHEMERAL KEY: Generate ed25519 keypair
   File: lib/ephemeral-key.ts (generateEphemeralKey function)
   Purpose: Session binding, prevents replay attacks
   ↓
5. ZK PROOF GENERATION: NoirJS + Barretenberg (~30 seconds)
   File: lib/circuits/jwt.ts (JWTCircuitHelper.generateProof)
   Inputs: JWT + Google pubkey + ephemeral key + domain
   Outputs: proof (bytes) + publicInputs (bytes32[85])
   ↓
6. CONTRACT CALL: verifyAndMint(proof, publicInputs)
   File: contracts/ZeroKlue.sol
   Steps:
   a. Call HonkVerifier.verify(proof, publicInputs)
   b. Check ephemeral key not already used
   c. Store verification data
   d. Mark ephemeral key as used
   e. Emit Verified event
   ↓
7. SUCCESS: User now has balanceOf() == 1
```

### Public Inputs Breakdown (85 fields)

```javascript
publicInputs[0-17]:   // Google's RSA-2048 public key (18 x 120-bit limbs)
publicInputs[18-81]:  // Email domain as bytes (64 bytes)
publicInputs[82]:     // Domain length
publicInputs[83]:     // Ephemeral public key
publicInputs[84]:     // Ephemeral key expiry timestamp
```

### Contract State

```solidity
struct StudentVerification {
    bool isVerified;           // Is this address verified?
    uint256 verifiedAt;        // When? (block.timestamp)
    bytes32 ephemeralPubkey;   // Which session key was used?
    bytes32[] publicInputs;    // The proof's public inputs (for audits)
}

mapping(address => StudentVerification) public verifications;
mapping(bytes32 => bool) public usedEphemeralKeys;  // Prevent reuse
```

### Merchant Integration

```typescript
// React component example:
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

function DiscountCheck({ address }: { address: string }) {
  const { data: isVerified } = useScaffoldReadContract({
    contractName: "ZeroKlue",
    functionName: "isVerified",
    args: [address],
  });

  return (
    <div>
      {isVerified ? (
        <div>✅ Student Verified - 20% Off!</div>
      ) : (
        <div>❌ Not Verified - <Link to="/verify">Verify Now</Link></div>
      )}
    </div>
  );
}
```

---

## 🧪 Testing & Verification

### Run All Tests
```bash
cd zeroklue-app/packages/foundry
forge test -vvv
```

**Expected output:**
```
[PASS] testVerifyAndMint() (gas: 352841)
[PASS] testIsVerified() (gas: 10234)
[PASS] testBalanceOf() (gas: 8921)
[PASS] testTransferFrom_Reverts() (gas: 12453)
[PASS] testSybilResistance() (gas: 360123)
... (19 tests total, all passing)
```

### Local Development

```bash
# Terminal 1: Start local blockchain
cd zeroklue-app && yarn chain

# Terminal 2: Deploy contracts
cd zeroklue-app && yarn deploy

# Terminal 3: Start frontend
cd zeroklue-app/packages/nextjs && yarn dev
```

**Access:** http://localhost:3000

---

## 🚨 Common Pitfalls for New LLM

### ❌ DON'T: Try to add ERC721 inheritance
The NFT-LIKE interface is intentional. Don't "fix" it.

### ❌ DON'T: Add timeout/cancellation to OAuth
We reviewed StealthNote and determined it's not needed. Skip it.

### ❌ DON'T: Try to enforce "one discount per email" on-chain
This is merchant responsibility. Document it, don't implement it.

### ❌ DON'T: Change the public inputs format
The circuit expects exactly 85 fields in specific order. Changing breaks verification.

### ✅ DO: Focus on UI polish
All backend logic works. Build pages, add loading states, display errors nicely.

### ✅ DO: Use existing hooks and utilities
Don't rewrite google-oauth.ts or jwt.ts. They're complete. Just use them.

### ✅ DO: Read FRONTEND_TASKS.md first
It has everything prioritized with time estimates.

---

## 💡 Business Context

### Revenue Model
B2B SaaS for merchants:
- Starter: $49/mo (1K verifications)
- Growth: $199/mo (10K verifications)
- Enterprise: Custom pricing

### Unit Economics
- LTV: $8,940 (5 years × $1,788 ACV)
- CAC: $500 (content marketing)
- **LTV:CAC: 17.9:1** ← Excellent
- Payback: 3.4 months
- Gross margin: ~90%

### Path to $1M ARR
- Year 1: 50-200 merchants = $60K-$360K ARR
- Year 2: 500 merchants = $1M ARR

**Full calculations in:** FRONTEND_TASKS.md (Business Viability section)

---

## 🎓 Learning Resources

### Zero-Knowledge Proofs
- **Start:** TECHNICAL_DEEP_DIVE.md (ZK section)
- **Deeper:** [Noir Documentation](https://noir-lang.org/docs)
- **Circuit:** [noir-jwt repo](https://github.com/saleel/noir-jwt)

### Smart Contracts
- **Our contracts:** `zeroklue-app/packages/foundry/contracts/`
- **Tests:** `zeroklue-app/packages/foundry/test/ZeroKlue.t.sol`
- **Foundry docs:** [getfoundry.sh](https://book.getfoundry.sh/)

### Frontend
- **Scaffold-ETH 2:** [docs.scaffoldeth.io](https://docs.scaffoldeth.io)
- **RainbowKit:** [rainbowkit.com](https://www.rainbowkit.com/)
- **wagmi:** [wagmi.sh](https://wagmi.sh/)

---

## 🐛 Known Issues

| Issue | Status | Notes |
|-------|--------|-------|
| Same email → multiple wallets | ✅ By design | See SECURITY_ANALYSIS.md |
| Gas costs (~300K per verify) | ✅ Expected | ZK proofs are expensive; deploy to L2s for cheaper |
| Proof generation slow on mobile | ⚠️ Known | Recommend desktop for best experience |
| Google key rotation | ⚠️ Potential future issue | Would need new circuit if Google changes signing keys |

---

## 📞 Next Steps for New LLM

1. **Read this doc** (you're doing it!)
2. **Read FRONTEND_TASKS.md** (actionable task list)
3. **Skim TECHNICAL_DEEP_DIVE.md** (understand architecture)
4. **Check PROJECT_AUDIT.md** (what's complete)
5. **Start building UI** (follow FRONTEND_TASKS.md priorities)

---

## 🔐 Critical Files Reference

### Smart Contracts (DON'T MODIFY - 100% complete)
- `zeroklue-app/packages/foundry/contracts/ZeroKlue.sol` - Main contract
- `zeroklue-app/packages/foundry/contracts/HonkVerifier.sol` - Proof verifier (auto-generated)
- `zeroklue-app/packages/foundry/test/ZeroKlue.t.sol` - Test suite (19/19 passing)

### Backend Logic (DON'T MODIFY - 100% complete)
- `zeroklue-app/packages/nextjs/lib/providers/google-oauth.ts` - OAuth + JWT
- `zeroklue-app/packages/nextjs/lib/circuits/jwt.ts` - Proof generation
- `zeroklue-app/packages/nextjs/lib/ephemeral-key.ts` - Key management
- `zeroklue-app/packages/nextjs/lib/types.ts` - TypeScript types
- `zeroklue-app/packages/nextjs/lib/utils.ts` - Helpers

### Circuit (DON'T MODIFY - working)
- `zeroklue-app/packages/nextjs/public/circuits/circuit.json` - Compiled Noir circuit
- `zeroklue-app/packages/nextjs/public/circuits/circuit-vkey.json` - Verification key

### Frontend (NEEDS WORK - your job)
- `zeroklue-app/packages/nextjs/app/page.tsx` - Homepage (needs rebuild)
- `zeroklue-app/packages/nextjs/app/verify/page.tsx` - Verification flow (create new)
- `zeroklue-app/packages/nextjs/app/merchant-demo/page.tsx` - Merchant demo (create new)
- `zeroklue-app/packages/nextjs/components/` - React components (build as needed)

### Documentation (REFERENCE ONLY)
- `docs/README.md` - Master index
- `docs/FRONTEND_TASKS.md` - What to build
- `docs/TECHNICAL_DEEP_DIVE.md` - How it works
- `docs/PROJECT_AUDIT.md` - What's complete

---

## ✅ Pre-Push Checklist

Before pushing code, verify:

- [ ] All tests still pass: `forge test -vv`
- [ ] TypeScript compiles: `yarn typecheck`
- [ ] No console errors in browser
- [ ] Mobile responsive (test on 375px width)
- [ ] Error states handled gracefully
- [ ] Loading states show during async operations
- [ ] Wallet connection works (RainbowKit)
- [ ] Contract reads work (isVerified, balanceOf)
- [ ] Updated FRONTEND_TASKS.md (mark completed tasks)

---

## 🎬 Demo Script (for presentations)

```
1. INTRO (30 sec)
   "ZeroKlue: Prove you're a student without revealing your identity"

2. PROBLEM (30 sec)
   - Traditional student verification = share email, upload ID, trust companies
   - We use zero-knowledge proofs + blockchain

3. DEMO (3 min)
   a. Show homepage, explain concept
   b. Click "Verify with Google"
   c. Sign in with .edu account
   d. Show proof generation (20-30 sec)
   e. Transaction confirmed → Verified!
   f. Go to merchant demo
   g. Connect wallet → Discount shows

4. TECH (1 min)
   - Google OAuth → JWT
   - Noir ZK circuit → Proof
   - Smart contract → Soulbound NFT
   - Merchants check balanceOf() == 1

5. BUSINESS (1 min)
   - B2B SaaS: Merchants pay $49-$199/mo
   - $1M ARR achievable in 18-24 months
   - 17.9:1 LTV:CAC ratio

6. Q&A
   - Check HACKATHON_QA.md for prepared answers
```

---

## 🚀 Final Notes

This project is 70% complete. All the hard stuff (ZK circuits, smart contracts, proof generation) is DONE and TESTED. 

You're building the UI for a working system. Focus on user experience:
- Clear error messages
- Smooth loading states  
- Intuitive flow
- Mobile responsive

The backend will handle the crypto magic. You make it beautiful.

**Good luck! 🎉**

---

**Last Updated:** January 17, 2026  
**Next LLM:** Read FRONTEND_TASKS.md and start building!
