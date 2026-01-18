# Frontend Development Tasks

**Last Updated:** January 17, 2026  
**Context:** Backend, contracts, ZK circuits, and tests are 100% complete. This is a handoff to frontend developers.

## Critical Priority - Demo Must-Haves

### 1. Merchant Demo Page (2-3 hours)
**Purpose:** Show how merchants/partners check student verification status.

**Location:** `zeroklue-app/packages/nextjs/app/merchant-demo/page.tsx`

**Requirements:**
```tsx
// Basic flow:
// 1. User connects wallet (RainbowKit already integrated)
// 2. Read contract: isVerified(address) or balanceOf(address)
// 3. Display result:
//    - If verified (balanceOf = 1): "✅ Student Verified - 20% Discount Unlocked!"
//    - If not verified (balanceOf = 0): "❌ Not Verified - Connect your verified wallet"

// Key functions to use:
const contract = useScaffoldReadContract({
  contractName: "ZeroKlue",
  functionName: "isVerified", // or "balanceOf"
  args: [address]
});
```

**Design Notes:**
- Make it look like a real e-commerce site (use web3 merchant examples)
- Show discount code reveal on verification
- Add merchant branding section (logo, name)
- Mobile-responsive

**Why Critical:** This demonstrates the actual business use case.

### 2. Verification Flow UI (3-4 hours)
**Purpose:** Clean up and polish the student verification experience.

**Location:** `zeroklue-app/packages/nextjs/app/verify/page.tsx` (or similar)

**Current State:**
- Backend logic exists in components/hooks
- Needs cohesive UI flow

**Requirements:**
1. **Step Indicator** - Show: "1. Connect Wallet → 2. Sign in with Google → 3. Generate Proof → 4. Verify on-chain"
2. **Google Sign-In Button** - Clear CTA, follows Google branding guidelines
3. **Loading States:**
   - "Connecting to Google..." (1-2 sec)
   - "Generating zero-knowledge proof... (~20 seconds)" - Add progress bar or spinner
   - "Submitting to blockchain..." (depends on network)
4. **Error Handling:**
   - Non-Workspace account: "⚠️ You must use a Google Workspace account from your educational institution"
   - Email not verified: "⚠️ Please verify your email with your institution"
   - Proof generation failed: Clear error message with retry button
5. **Success State:**
   - "✅ Verification Complete!"
   - Show transaction hash (link to block explorer)
   - "Your wallet [0x123...456] is now verified as a student"
   - CTA: "Try the merchant demo" (link to merchant page)

**Reference:** StealthNote's message-form.tsx (lines 55-80) has good error display patterns, but DON'T copy timeout logic (see below).

### 3. Homepage/Landing (2 hours)
**Purpose:** Explain ZeroKlue to first-time visitors.

**Location:** `zeroklue-app/packages/nextjs/app/page.tsx`

**Content Structure:**
```
Hero:
  - "Prove You're a Student Without Revealing Your Identity"
  - Subtitle: "Zero-knowledge student verification for Web3 discounts"
  - CTA: "Verify Now" (link to /verify)

How It Works (3 boxes):
  1. Connect Wallet - "Link your Ethereum address"
  2. Prove Student Status - "Sign in with your edu email via Google OAuth"
  3. Get Discounts - "Use your verified wallet at partner merchants"

Benefits:
  - Privacy-preserving (ZK proofs)
  - One-time verification (soulbound NFT)
  - Works with any merchant

CTA: "Start Verification" or "Try Demo Merchant"
```

---

## Important - Error Handling

### What We Already Have (GOOD ✅)
From `google-oauth.ts`:
- **Lines 40-44:** Google Workspace validation (checks `hd` field exists)
- **Lines 47-49:** Email verification check
- **Public key fetch errors:** Handled with try/catch

### What StealthNote Has That We DON'T Need (❌)
After reviewing their code:
1. **2-minute timeout (lines 236-238):** They have this because popup can hang indefinitely
2. **Window closed detection (lines 231-234):** Check if user closes popup

**DECISION: Skip timeout/cancellation handling for now.**
- Reasoning: 
  - StealthNote uses popup flow exclusively as fallback
  - We might use Google One Tap (simpler, no popup)
  - If popup closes, user can just retry
  - Not critical for demo/MVP
  - Adds complexity for minimal user benefit
- If needed later: Add 2-min timeout and window polling (see StealthNote google-oauth.ts lines 219-246)

### Error Messages to Display
Copy these exact patterns to UI:
```typescript
// From google-oauth.ts validation
if (!payload.hd) {
  throw new Error("You must use a Google Workspace account from your educational institution.");
}

if (!payload.email_verified) {
  throw new Error("Please verify your email address with your institution.");
}

// For proof generation (in hooks/useStudentVerification.ts)
try {
  // ... proof generation
} catch (error) {
  // Show user-friendly message:
  setError("Failed to generate verification proof. Please try again.");
}
```

---

## Optional Enhancements (Nice-to-Have)

### 4. Wallet Dashboard (1-2 hours)
Show verification status for connected wallet:
- "Verified since: [date]"
- "Verification expires: [date]" (if we add expiry)
- List of available merchant discounts
- Re-verification button (if expired)

### 5. Admin Panel (Future)
For managing merchants:
- Add/remove merchant partnerships
- View verification stats
- Update contract parameters

### 6. Merchant Directory (Future)
Public page listing all partner merchants with discounts.

---

## Technical Notes for Frontend Devs

### Contract Interface (IMPORTANT)
ZeroKlue uses an **NFT-LIKE** interface, not full ERC721:
```solidity
// These functions exist:
function isVerified(address user) public view returns (bool)
function isRecentlyVerified(address user, uint256 timeWindow) public view returns (bool)
function balanceOf(address user) public view returns (uint256) // Returns 1 if verified, 0 if not
function transferFrom(address, address, uint256) public pure // Always reverts (soulbound)

// Standard ERC721 functions DON'T exist:
// - No tokenURI()
// - No tokenId concept
// - No approve/setApprovalForAll
```

**Why:** Gas-efficient, simpler, still verifiable. This is INTENTIONAL, not a bug.

**Usage in Frontend:**
```typescript
// Check if user is verified (two options):
const verified1 = await contract.read.isVerified([address]);
const verified2 = (await contract.read.balanceOf([address])) === 1n;

// Check recent verification (within 30 days):
const recentlyVerified = await contract.read.isRecentlyVerified([
  address,
  30n * 24n * 60n * 60n // 30 days in seconds
]);
```

### Google OAuth Setup
**Google Client ID:** Already configured in environment variables.

**OAuth Flow:**
1. User clicks "Sign in with Google"
2. Google OAuth popup opens (or One Tap)
3. User authenticates
4. We receive JWT (ID token)
5. Extract email, domain (`hd`), verify Workspace
6. Generate ZK proof with noir-jwt circuit
7. Submit proof to contract

**Key Files:**
- `lib/providers/google-oauth.ts` - OAuth logic
- `hooks/useStudentVerification.ts` - React hook (create if doesn't exist)
- Components for UI

### One Discount Per Email
**Your Question:** "should merchants deal with handing over only 1 student discount?"

**Answer:** YES, merchants should handle this in their own systems. Here's why:

**On-Chain (Our Contract):**
- Tracks: 1 wallet = verified student (yes/no)
- Does NOT track: discounts used, purchase history, user identity

**Off-Chain (Merchant System):**
- Tracks: email → discount_used flag
- When student checkouts:
  1. Check wallet.balanceOf() == 1 (verified?)
  2. Ask for email (for order confirmation)
  3. Check their database: Has this email used discount before?
  4. Apply discount only if (verified AND !discount_used_by_email)

**Why Merchants Handle It:**
- Privacy: We don't link wallets to emails on-chain
- Flexibility: Each merchant has own discount policy (1 per email, 1 per year, etc.)
- Scalability: Merchant databases, not blockchain
- Business Logic: Merchants might allow re-verification after graduation, transfer students, etc.

**Our Docs Should Say:**
```
# Merchant Integration Guide

## Checking Verification
Your backend should:
1. Check: `ZeroKlue.balanceOf(userWallet) == 1`
2. If verified, ask for email (for your records)
3. Check your database: `SELECT discount_used FROM students WHERE email = ?`
4. Apply discount if verified AND not previously used

## Example Policy
- One discount per .edu email address
- Track in your database: email, discount_date, order_id
- Allow re-verification if student loses wallet access
```

---

## Sample Merchant Store Ideas (Web3 Focus)

### Realistic Options (Business Viability)

1. **NFT Marketplace - Student Discount on Gas/Fees**
   - Example: OpenSea competitor
   - Discount: "Students get 50% off marketplace fees"
   - Why: High volume, recurring revenue from fees
   - Verification: Check balanceOf() before checkout

2. **DeFi Platform - Reduced Trading Fees**
   - Example: Uniswap/1inch aggregator
   - Discount: "Students: 0.1% fee instead of 0.3%"
   - Why: Builds loyalty with next-gen traders
   - Verification: Check at swap execution

3. **Web3 SaaS - Development Tools**
   - Example: Alchemy/Infura competitor
   - Discount: "Students get 10M free API calls/month"
   - Why: Hook students early, they'll pay after graduation
   - Verification: Check wallet during sign-up

4. **DAO Tooling - Governance Platform**
   - Example: Snapshot, Tally competitor
   - Discount: "Student DAOs: Free premium features"
   - Why: Universities forming DAOs, clubs, etc.
   - Verification: Admin wallet must be verified

5. **On-Chain Gaming - Premium Items**
   - Example: Axie Infinity style
   - Discount: "Students: 30% off in-game purchases"
   - Why: Large student gaming audience
   - Verification: Check before purchase transaction

### Demo Implementation (Pick ONE for hackathon)
**Recommended:** "Crypto Learning Platform"
- Sell online courses about Web3/Solidity
- Students get 40% off any course
- Simple checkout flow
- Easy to demo
- Actually useful for students

**Mock Store Structure:**
```
Pages:
- /courses - Browse courses
- /course/[id] - Course details
- /checkout - Apply student discount here (verify wallet)

Courses to list:
1. "Solidity Fundamentals" - $99 → $59 (student)
2. "DeFi Development" - $149 → $89 (student)
3. "ZK Proofs Explained" - $199 → $119 (student)
```

---

## Business Viability Analysis

### Revenue Model
**B2B SaaS for Merchants:**
- Merchants pay monthly/annual subscription
- Pricing tiers based on verification volume

**Tier Structure:**
```
Starter: $49/mo
- Up to 1,000 verifications/month
- Basic API access
- Email support

Growth: $199/mo
- Up to 10,000 verifications/month
- Advanced analytics
- Priority support
- Custom branding

Enterprise: Custom
- Unlimited verifications
- Dedicated support
- Custom integration
- SLA guarantees
```

### Cost Analysis
**Fixed Costs (Monthly):**
- Infrastructure: $100/mo (Vercel, RPC nodes, etc.)
- Domain/SSL: $20/mo
- Development: 0 (you're building it)
- **Total: ~$120/mo**

**Variable Costs:**
- Gas fees: Paid by users (they verify their own wallets)
- Google OAuth: Free (under limits)
- Server compute: Minimal (reads are cheap)

**Margin:** ~90% gross margin (SaaS standard)

### Market Size
**TAM (Total Addressable Market):**
- Global students: ~300M
- Students with crypto: ~5M (growing)
- Web3 merchants needing verification: ~10K (growing fast)

**SAM (Serviceable Addressable Market):**
- Target: Web3 merchants offering student discounts
- Current size: ~1,000 merchants
- 5-year projection: ~50,000 merchants

**SOM (Serviceable Obtainable Market - Year 1):**
- Conservative: 50 merchants @ $99/mo avg = $4,950/mo = **$59K ARR**
- Moderate: 200 merchants @ $149/mo avg = $29,800/mo = **$357K ARR**
- Aggressive: 500 merchants @ $199/mo avg = $99,500/mo = **$1.19M ARR**

### Unit Economics (Per Merchant)
```
Average Contract Value (ACV): $1,788/year ($149/mo)
Customer Acquisition Cost (CAC): $500 (content marketing, SEO)
Lifetime Value (LTV): $8,940 (5 years × $1,788)
LTV:CAC Ratio: 17.9:1 ← Excellent (>3:1 is good)
Payback Period: 3.4 months
Churn: Assume 20% annual (students always exist)
```

### Path to $1M ARR
```
Month 1-3: Beta (10 merchants, $0 revenue)
Month 4-6: Launch (20 merchants × $99 = $1,980/mo)
Month 7-12: Growth (100 merchants × $149 avg = $14,900/mo)
Month 13-18: Scale (250 merchants × $149 = $37,250/mo)
Month 19-24: Hit target (500 merchants × $166 avg = $83,000/mo = $1M ARR)
```

**Catalysts:**
- Partner with 3-5 major Web3 platforms (OpenSea, Uniswap)
- Press coverage (TechCrunch, Decrypt, CoinDesk)
- University partnerships (MIT, Stanford crypto clubs)
- Developer advocacy (ETHGlobal, hackathons)

### Competitive Advantage
1. **Privacy:** ZK proofs vs. traditional .edu email verification
2. **Web3-Native:** On-chain, decentralized, permissionless
3. **Soulbound:** Can't transfer/sell verification
4. **Free for Students:** Gas-only, no subscriptions
5. **Simple for Merchants:** One contract call to verify

### Risk Factors
- **Adoption:** Merchants need education on ZK proofs
- **Gas Costs:** If ETH gas too high, students won't verify (Solution: Deploy to L2s)
- **Google Dependency:** If Google changes JWT format (Solution: Multi-provider support)
- **Competition:** Traditional student discount platforms (e.g., UNiDAYS)

### Mitigation Strategies
- Multi-chain deployment (Polygon, Arbitrum, Optimism)
- Support multiple OAuth providers (Microsoft, GitHub, university SAML)
- Build API that abstracts ZK complexity for merchants
- Focus on Web3-native merchants first (easier adoption)

---

## Files to Reference

### Backend (Complete, Don't Touch)
- `packages/backend/src/` - OTP and crypto services (if needed)
- `zeroklue-app/packages/foundry/contracts/ZeroKlue.sol` - Main contract
- `zeroklue-app/packages/foundry/test/ZeroKlue.t.sol` - Test suite (100% passing)
- `packages/circuits/src/main.nr` - Noir circuit (compiled, working)

### Frontend (Your Work)
- `zeroklue-app/packages/nextjs/app/` - Next.js pages
- `zeroklue-app/packages/nextjs/components/` - React components
- `zeroklue-app/packages/nextjs/hooks/scaffold-eth/` - Custom hooks
- `zeroklue-app/packages/nextjs/lib/` - Create this folder for OAuth logic
- `zeroklue-app/packages/nextjs/contracts/deployedContracts.ts` - Contract ABIs (auto-generated)

### Documentation (Read These First)
- `docs/TECHNICAL_DEEP_DIVE.md` - Full system architecture
- `docs/QUICKSTART.md` - Setup instructions
- `docs/SECURITY_ANALYSIS.md` - Security considerations
- `docs/FRONTEND_GUIDE.md` - UI/UX guidelines
- `docs/PRD.md` - Product requirements

---

## Next Steps

1. **Read docs** (30 min):
   - TECHNICAL_DEEP_DIVE.md
   - QUICKSTART.md
   - SECURITY_ANALYSIS.md

2. **Setup environment** (30 min):
   - Clone repo
   - Install dependencies (`yarn install`)
   - Start local blockchain (`yarn chain`)
   - Deploy contracts (`yarn deploy`)
   - Start Next.js (`yarn start`)

3. **Build merchant demo** (2-3 hours):
   - Create merchant-demo page
   - Integrate RainbowKit wallet connection
   - Read contract verification status
   - Display discount eligibility

4. **Build verification flow** (3-4 hours):
   - Create verify page
   - Add Google OAuth button
   - Integrate ZK proof generation
   - Add loading/error states
   - Success confirmation

5. **Polish homepage** (2 hours):
   - Hero section
   - How it works
   - CTAs

6. **Test end-to-end** (1 hour):
   - Student verifies → Merchant checks → Discount applies

---

## Questions? Check These First

**Q: Why isn't the contract ERC721?**
A: Intentional design. See "Contract Interface" section above.

**Q: Do we need timeout/cancellation handling?**
A: No, skip for now. See "Error Handling" section.

**Q: How do merchants prevent multiple discounts?**
A: Their database tracks email → discount_used. See "One Discount Per Email" section.

**Q: What if student changes wallets?**
A: They re-verify with new wallet. Old wallet verification remains (can't transfer).

**Q: Is this viable as a business?**
A: Yes. See "Business Viability Analysis" section. $1M ARR achievable in 18-24 months.

**Q: What about privacy?**
A: ZK proof reveals ONLY: "this wallet belongs to someone with a verified .edu email" (not which email, not identity).

---

## Success Criteria

**Demo Ready When:**
- [ ] Homepage explains ZeroKlue clearly
- [ ] Student can verify their wallet (Google OAuth → ZK proof → on-chain)
- [ ] Merchant demo shows discount for verified wallets
- [ ] All error states handled gracefully
- [ ] Mobile responsive
- [ ] No console errors
- [ ] Deploys to Vercel

**Time Estimate:** 8-12 hours total for experienced frontend dev.

---

## Contact & Handoff

**When you're done**, update these docs:
- Mark tasks as complete in this file
- Add screenshots to `docs/DEMO_SCREENSHOTS.md` (create new file)
- Document any new components in `docs/FRONTEND_GUIDE.md`
- Note any bugs/issues in GitHub Issues

**Critical:** Test with a real Google Workspace account before considering "done". Use your university email.

Good luck! 🚀
