# ZeroKlue Demo Roadmap

**Time Remaining**: ~17 hours  
**Goal**: Working end-to-end demo for hackathon judges

---

## The Demo Flow (What Judges Will See)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  SITE 1: ZEROKLUE (zeroklue.local:3000)                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. Hero page with blurred "exclusive offers" (locked)                      │
│  2. User clicks "Connect Wallet" → MetaMask popup                           │
│  3. User clicks "Verify with Google" → Google OAuth popup                   │
│  4. Signs in with @iiitkottayam.ac.in account                               │
│  5. Progress bar: "Generating ZK proof..." (~30 seconds)                    │
│  6. Progress bar: "Minting your Student Pass..."                            │
│  7. 🎉 SUCCESS! NFT minted, offers unlocked                                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  SITE 2: SAMPLE MERCHANT (merchant.local:3001)                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. "TechMart - Student Discount Store"                                     │
│  2. Product shown: "MacBook Pro - $999 (Students: $799)"                    │
│  3. User clicks "Claim Student Discount"                                    │
│  4. "Connect Wallet" → MetaMask                                             │
│  5. Contract checks: Does wallet have ZeroKlue NFT?                         │
│  6. ✅ YES → "Discount Applied! Pay $799"                                   │
│  7. ❌ NO  → "Verify at ZeroKlue first"                                     │
│                                                                             │
│  KEY: Merchant NEVER sees student's email, name, or university.             │
│       Only checks: balanceOf(wallet) > 0                                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## What's Ready from StealthNote (Just Copy)

StealthNote is MIT-licensed. These files are battle-tested and work out of the box:

### Circuit Artifacts (Copy to `public/circuits/`)
| File | Purpose | Lines |
|------|---------|-------|
| `circuit.json` | Compiled Noir circuit (ACIR) | ~large |
| `circuit-vkey.json` | Verification key for proofs | ~large |

### Frontend Libraries (Copy to `lib/`)
| File | Purpose | What It Does |
|------|---------|--------------|
| `providers/google-oauth.ts` | Google sign-in | Handles OAuth popup, returns JWT |
| `circuits/jwt.ts` | Proof generation | Builds circuit inputs, calls NoirJS, generates proof |
| `ephemeral-key.ts` | Key management | Generates ed25519 keypair for signing |
| `lazy-modules.ts` | Async imports | Loads @noir-lang/noir_js and @aztec/bb.js |
| `utils.ts` | Helpers | bytesToBigInt, splitBigIntToLimbs, etc. |

### What You Need to Change
1. **Domain filter**: Add check `if (domain !== 'iiitkottayam.ac.in') throw`
2. **After proof**: Call `ZeroKlue.verifyAndMint()` instead of server API
3. **Asset paths**: Update imports to use `public/circuits/` paths

---

## What's Already Done ✅

| Component | Status | Location |
|-----------|--------|----------|
| Noir circuit (JWT verification) | ✅ Ready | Uses StealthNote's circuit |
| HonkVerifier.sol | ✅ Generated | `zeroklue-app/packages/foundry/contracts/HonkVerifier.sol` |
| ZeroKlue.sol (registry + verification) | ✅ Written | `zeroklue-app/packages/foundry/contracts/ZeroKlue.sol` |
| Deploy script | ✅ Exists | `zeroklue-app/packages/foundry/script/Deploy.s.sol` |
| Scaffold-ETH 2 base | ✅ Set up | `zeroklue-app/packages/nextjs/` |
| Circuit artifacts | ✅ Compiled | `packages/circuits/target/` |

---

## What Needs to Be Done

### Phase 1: Frontend Integration (3 hours)

**Files to copy from StealthNote:**
```
StealthNote                          →  ZeroKlue
─────────────────────────────────────────────────────────────
app/lib/providers/google-oauth.ts    →  lib/providers/google-oauth.ts
app/lib/circuits/jwt.ts              →  lib/circuits/jwt.ts
app/lib/ephemeral-key.ts             →  lib/ephemeral-key.ts
app/lib/lazy-modules.ts              →  lib/lazy-modules.ts
app/lib/utils.ts (bytesToBigInt etc) →  lib/utils.ts
app/assets/jwt/circuit.json          →  public/circuits/circuit.json
app/assets/jwt/circuit-vkey.json     →  public/circuits/circuit-vkey.json
```

**Files to create:**
| File | Purpose |
|------|---------|
| `lib/providers/google-oauth.ts` | Google sign-in + domain filter (iiitkottayam.ac.in) |
| `lib/circuits/jwt.ts` | Proof generation using NoirJS |
| `hooks/useStudentVerification.ts` | React hook for full flow |
| `components/VerificationCard.tsx` | UI component with progress steps |
| `app/page.tsx` | Hero + verification flow + locked offers |

**Key modifications from StealthNote:**
1. Add domain whitelist check: `if (domain !== 'iiitkottayam.ac.in') throw`
2. After proof generation, call `ZeroKlue.verifyAndMint()` on-chain
3. Show NFT badge after successful mint

### Phase 2: Contract Deployment (30 min)

```bash
# Start local chain
cd zeroklue-app && yarn chain

# Deploy contracts
yarn deploy

# Note the deployed addresses
# Update deployedContracts.ts with addresses + ABIs
```

### Phase 3: Sample Merchant Site (1.5 hours)

Create a simple second page or separate app:

**Option A**: New route in same app (`/merchant`)
**Option B**: Separate minimal Next.js app

**Merchant page needs:**
```tsx
// Pseudocode
const { address } = useAccount();
const balance = useReadContract({
  address: ZEROKLUE_ADDRESS,
  abi: ZeroKlueABI,
  functionName: 'balanceOf',
  args: [address],
});

const isStudent = balance > 0;

return (
  <div>
    <h1>TechMart Student Store</h1>
    <ProductCard 
      name="MacBook Pro"
      regularPrice="$999"
      studentPrice="$799"
      canClaim={isStudent}
    />
    {!isStudent && <Link href="/">Verify at ZeroKlue first</Link>}
  </div>
);
```

### Phase 4: E2E Testing (1.5 hours)

1. Start local chain (`yarn chain`)
2. Deploy contracts (`yarn deploy`)
3. Start frontend (`yarn start`)
4. Connect MetaMask to localhost:8545
5. Import test account with ETH
6. Full flow: Connect → Google Sign-in → Proof → Mint → Check merchant

### Phase 5: Demo Polish (1 hour)

- Loading animations
- Error messages
- Success confetti
- Mobile responsive (optional)
- Demo script for judges

---

## Time Estimates

| Phase | Task | Time | Owner |
|-------|------|------|-------|
| 1a | Copy StealthNote libs | 30 min | Frontend |
| 1b | Add domain filter | 15 min | Frontend |
| 1c | Wire proof → contract call | 1 hr | Frontend |
| 1d | Build VerificationCard UI | 1 hr | Frontend |
| 1e | Hero page with locked offers | 30 min | Frontend |
| **1 Total** | **Frontend Integration** | **~3 hrs** | |
| 2 | Deploy contracts locally | 30 min | Backend/Prajwal |
| 3 | Build merchant demo page | 1.5 hr | Frontend |
| 4 | E2E testing + debugging | 1.5 hr | All |
| 5 | Demo polish | 1 hr | All |
| **Buffer** | Unexpected issues | 2 hr | All |
| **TOTAL** | | **~10 hrs** | |

**Remaining buffer**: ~7 hours for judge prep, presentation, sleep

---

## Environment Setup

### Required for Frontend Dev

```bash
# Install dependencies
cd zeroklue-app/packages/nextjs
yarn add @aztec/bb.js @noir-lang/noir_js noir-jwt @noble/ed25519 @noble/hashes

# Create .env.local
echo "NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com" > .env.local
```

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 Client ID
3. Add authorized origins: `http://localhost:3000`
4. Copy Client ID to `.env.local`

### MetaMask Setup for Demo

1. Add network: Localhost 8545 (Chain ID: 31337)
2. Import account with ETH (Anvil provides 10 test accounts)

---

## NFT Minting Clarification

**Current ZeroKlue.sol**: Registry-style (not full ERC721)
- `balanceOf(address)` returns 0 or 1
- `isVerified(address)` returns true/false
- `isRecentlyVerified(address, maxAge)` for freshness checks
- Soulbound (cannot transfer)

**For demo purposes**: This is PERFECT
- Merchant checks `balanceOf(wallet) > 0` → Student verified
- No need for OpenSea, tokenURI, etc.
- Simpler, fewer things to break

**If judges ask "where's the NFT?"**:
> "It's a soulbound registry credential. The contract tracks verification status. 
> Merchants query `isVerified(address)` on-chain. We chose this over ERC721 
> for simplicity and gas efficiency, but could add full NFT metadata post-hackathon."

---

## Demo Script for Judges

### Part 1: The Problem (30 sec)
"Current student verification requires sharing your full email, name, and university with every merchant. That's a privacy nightmare and GDPR liability."

### Part 2: The Solution (30 sec)
"ZeroKlue lets you prove you're a student without revealing WHO you are. Using zero-knowledge proofs, we verify your Google Workspace account cryptographically."

### Part 3: Live Demo (2 min)
1. Open ZeroKlue app
2. "I'll connect my wallet" → MetaMask
3. "Now I verify with my university Google account" → OAuth popup
4. "The browser is generating a ZK proof - this proves my JWT is valid without revealing my email"
5. "Proof submitted to blockchain... NFT minted!"
6. Open merchant site
7. "Now I visit TechMart. I connect wallet. The contract sees my student credential."
8. "Discount applied! They never saw my email."

### Part 4: Technical Depth (if asked)
"We're using StealthNote's JWT verification circuit - it checks Google's RSA signature inside the ZK proof. The public inputs include a nullifier (prevents double-mint) and domain hash (proves I'm from an approved university). All verification happens on-chain via a generated Solidity verifier."

---

## Files to Commit After Each Phase

### After Phase 1:
```
lib/providers/google-oauth.ts
lib/circuits/jwt.ts
lib/ephemeral-key.ts
lib/lazy-modules.ts
lib/utils.ts
public/circuits/circuit.json
public/circuits/circuit-vkey.json
hooks/useStudentVerification.ts
components/VerificationCard.tsx
app/page.tsx
```

### After Phase 2:
```
contracts/deployedContracts.ts (with addresses)
```

### After Phase 3:
```
app/merchant/page.tsx (or separate app)
```

---

## Quick Reference Commands

```bash
# Start local blockchain
cd zeroklue-app && yarn chain

# Deploy contracts (new terminal)
yarn deploy

# Start frontend (new terminal)  
yarn start

# Run contract tests
cd packages/foundry && forge test -vvv

# Compile circuit (if needed)
cd packages/circuits && nargo compile
```

---

## Success Criteria

- [ ] Can connect MetaMask wallet
- [ ] Can sign in with Google (@iiitkottayam.ac.in)
- [ ] ZK proof generates in browser (~30 sec)
- [ ] Proof submits to local blockchain
- [ ] Contract verifies and records verification
- [ ] Merchant page shows discount for verified users
- [ ] Merchant page shows "verify first" for non-verified
- [ ] Demo runs smoothly without crashes

---

**You've got this. The hard cryptography is done. Now it's integration and polish.** 🚀
