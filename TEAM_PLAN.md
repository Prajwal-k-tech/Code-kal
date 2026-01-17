# ZeroKlue Project Analysis: Using Anon-Aadhaar Architecture

## Key Insights from Anon-Aadhaar

### What Anon-Aadhaar Does
- Proves ownership of Indian Aadhaar ID without revealing identity
- Uses RSA signature verification (Aadhaar QR codes have RSA signatures)
- Circuit size: ~237K gates (heavy but proven to work)
- Proving time: ~2.6 seconds on M1 Mac

### Why This is PERFECT for ZeroKlue

Anon-Aadhaar solves the EXACT same problem we have:
1. **Government credential** (Aadhaar) → **University credential** (email)
2. **RSA signature verification** → **EdDSA signature verification** (simpler!)
3. **Selective disclosure** → **Binary disclosure** (student or not)
4. **Nullifier for sybil resistance** → **Same pattern!**

### What We Can Learn

**Architecture Pattern**:
```
Anon-Aadhaar:
Aadhaar QR → RSA Signature → Noir Circuit → Proof → Smart Contract

ZeroKlue (Simplified):
University Email → EdDSA Signature → Noir Circuit → Proof → Smart Contract
```

**Key Difference**: We're MUCH simpler because:
- EdDSA << RSA (in circuit complexity)
- No need for QR code parsing
- Simpler identity data (just email domain, not full ID card)

---

## Useful Libraries from awesome-noir

### Must-Use

1. **EdDSA Signature Verification**
   - `https://github.com/noir-lang/eddsa` ✅
   - Already in our plan, validated by Anon-Aadhaar's approach

2. **Poseidon Hash** (for nullifiers)
   - `https://github.com/noir-lang/poseidon` ✅
   - Used in Anon-Aadhaar for nullifiers

3. **hardhat-noir**
   - `https://github.com/olehmisar/hardhat-noir` ✅
   - Auto-generates Solidity verifier
   - Integrates Noir into Hardhat workflow

### Nice-to-Have

4. **zkEmail Patterns** (if we want to upgrade later)
   - `https://github.com/zkemail/zkemail.nr`
   - Could verify actual email contents (vs just OTP)

5. **Merkle Trees** (for issuer allowlist)
   - `https://github.com/noir-lang/merkle`
   - Instead of hardcoded issuer keys, use Merkle proof

---

## Simplified Circuit (Inspired by Anon-Aadhaar)

```noir
// Much simpler than Anon-Aadhaar because EdDSA << RSA

use dep::std;
use dep::eddsa;

fn main(
    // Public inputs (visible on-chain)
    issuer_pubkey_x: Field,
    issuer_pubkey_y: Field,
    nullifier: Field,
    wallet_address: Field,
    
    // Private inputs (hidden)
    signature_r: Field,
    signature_s: Field,
    nullifier_seed: Field,
) {
    // 1. Verify EdDSA signature on wallet_address
    let message = [wallet_address];
    let pubkey = [issuer_pubkey_x, issuer_pubkey_y];
    let signature = [signature_r, signature_s];
    
    let valid = eddsa::eddsa_poseidon_verify(pubkey, signature, message);
    assert(valid);
    
    // 2. Verify nullifier derivation
    let computed_nullifier = std::hash::poseidon::bn254::hash_1([nullifier_seed]);
    assert(nullifier == computed_nullifier);
}
```

**Circuit Complexity Estimate**:
- EdDSA verify: ~10K constraints
- Poseidon hash: ~200 constraints
- **Total: ~10-15K constraints** (vs Anon-Aadhaar's 237K!)

**Expected Performance**:
- Proving: <5 seconds
- Verification: <0.05 seconds

---

## Recommended Stack Adjustments

### Use hardhat-noir Plugin

Instead of manual Noir compilation, use hardhat-noir:

```bash
npm install --save-dev hardhat-noir
```

Benefits:
- Auto-compiles Noir on `npx hardhat compile`
- Auto-generates Solidity verifier
- Integrated workflow

---

## 4-Person Team Split (22.5 Hours)

### Team Structure

```
Person 1: Frontend Lead
Person 2: Backend + DevOps
Person 3: Circuits + Crypto
Person 4: Smart Contracts + Integration
```

---

## Hour-by-Hour Plan (22.5 Hours)

### Hours 0-2: Setup (Everyone Together)

**All**: 
- [ ] Clone repo structure
- [ ] Install dependencies
- [ ] Set up .env files
- [ ] Test basic compilation
- [ ] Git setup + first commit

---

### Hours 2-8: Parallel Development

#### Person 1: Frontend Foundation

**Hours 2-4**: Setup
- [ ] Initialize Next.js with RainbowKit
- [ ] Set up Tailwind + shadcn/ui
- [ ] Create basic layout and routing
- [ ] Wire up wallet connection

**Hours 4-6**: Email Verification UI
- [ ] Email input form
- [ ] OTP input component
- [ ] Loading states
- [ ] Error handling UI

**Hours 6-8**: Marketplace UI
- [ ] Create offer cards (4 total)
- [ ] Locked/unlocked states
- [ ] Grid layout
- [ ] Basic animations

**Deliverable**: Beautiful UI, no backend integration yet

---

#### Person 2: Backend + Infrastructure

**Hours 2-4**: Backend Setup
- [ ] Initialize Express server
- [ ] Set up Redis for OTPs
- [ ] Configure email service (Resend)
- [ ] Domain allowlist config

**Hours 4-6**: API Endpoints
- [ ] `/verify-email` endpoint (send OTP)
- [ ] `/verify-otp` endpoint (verify + sign)
- [ ] Generate EdDSA keypair
- [ ] Sign credentials with `@noble/curves`

**Hours 6-8**: Deployment Prep
- [ ] Deploy backend to Railway/Render
- [ ] Set up environment variables
- [ ] CORS configuration
- [ ] Health check endpoint

**Deliverable**: Working API deployed and accessible

---

#### Person 3: Circuits + Crypto

**Hours 2-3**: Circuit Setup
- [ ] Initialize Noir project
- [ ] Add eddsa dependency
- [ ] Study Anon-Aadhaar circuit patterns

**Hours 3-5**: Write Circuit
- [ ] Define inputs/outputs
- [ ] Implement signature verification
- [ ] Implement nullifier logic
- [ ] Add assertions

**Hours 5-7**: Test & Compile
- [ ] Write test inputs (Prover.toml)
- [ ] Test with `nargo prove`
- [ ] Debug any circuit errors
- [ ] Compile circuit

**Hours 7-8**: Generate Verifier
- [ ] Generate vk with barretenberg
- [ ] Generate Solidity verifier
- [ ] Document circuit inputs/outputs

**Deliverable**: Working Noir circuit + Solidity verifier

---

#### Person 4: Smart Contracts

**Hours 2-4**: Contract Setup
- [ ] Initialize Hardhat project
- [ ] Install hardhat-noir plugin
- [ ] Set up Holesky network config
- [ ] Get testnet ETH from faucet

**Hours 4-6**: Write Contracts
- [ ] Create ZeroKlueStudentPass contract
- [ ] Import generated verifier
- [ ] Implement verifyAndMint function
- [ ] Make NFT soulbound
- [ ] Write tests

**Hours 6-8**: Deploy & Verify
- [ ] Deploy to Holesky testnet
- [ ] Verify on Etherscan
- [ ] Test contract functions
- [ ] Document contract addresses

**Deliverable**: Deployed & verified contracts

---

### Hours 8-12: Integration (Pairs)

#### Person 1 + Person 3: Frontend ↔ Circuits

**Hours 8-10**: NoirJS Integration
- [ ] Copy circuit artifacts to `/public`
- [ ] Create proof generation module
- [ ] Test proof generation in browser
- [ ] Handle WASM loading

**Hours 10-12**: Proof Modal
- [ ] Create proof generation UI
- [ ] Show progress steps
- [ ] Handle errors
- [ ] Test with mock credentials

**Deliverable**: Working proof generation in browser

---

#### Person 2 + Person 4: Backend ↔ Contracts

**Hours 8-10**: Credential Signing
- [ ] Test EdDSA signing with circuit inputs
- [ ] Ensure signature format matches circuit
- [ ] Debug signature verification
- [ ] Create test credentials

**Hours 10-12**: Contract Integration
- [ ] Test proof submission to contract
- [ ] Handle transaction signing
- [ ] Parse events
- [ ] Error handling

**Deliverable**: Backend credentials verify in circuit → mint NFT

---

### Hours 12-16: End-to-End Integration

**All Together**:

**Hours 12-14**: Connect All Pieces
- [ ] Frontend calls backend API
- [ ] Backend returns credential
- [ ] Frontend generates proof
- [ ] Frontend submits to contract
- [ ] NFT mints successfully

**Hours 14-16**: Bug Fixes
- [ ] Test full flow 5 times
- [ ] Fix edge cases
- [ ] Handle wallet switching
- [ ] Handle transaction failures

**Deliverable**: Working E2E flow

---

### Hours 16-20: Merchant Demo + Polish

#### Person 1 + Person 2: Merchant Demo

**Hours 16-18**: Create TechMart Site
- [ ] New Next.js app (or subdirectory)
- [ ] Product page design
- [ ] Wallet connection
- [ ] NFT check logic

**Hours 18-20**: Polish
- [ ] Student/non-student states
- [ ] Price toggle
- [ ] Pretty design
- [ ] Deploy separately

**Deliverable**: Beautiful merchant demo

---

#### Person 3 + Person 4: Main App Polish

**Hours 16-18**: UI/UX Polish
- [ ] Smooth animations
- [ ] Loading states
- [ ] Success celebrations
- [ ] Error messages
- [ ] Mobile responsive

**Hours 18-20**: Performance
- [ ] Optimize proof generation
- [ ] Add progress tracking
- [ ] Test on multiple browsers
- [ ] Fix any slowness

**Deliverable**: Polished main app

---

### Hours 20-22.5: Final Testing + Demo Prep

**All Together**:

**Hours 20-21**: Final Testing
- [ ] Fresh wallet test
- [ ] Different email domains
- [ ] Transaction failures
- [ ] Reverification attempt (should fail)
- [ ] Merchant demo with/without NFT

**Hours 21-22**: Documentation
- [ ] README with screenshots
- [ ] Demo script
- [ ] Record backup video
- [ ] Test demo flow 3 times

**Hours 22-22.5**: Buffer
- [ ] Fix last minute bugs
- [ ] Deploy final versions
- [ ] REST!

---

## Tech Stack Finalized

```json
{
  "circuits": {
    "language": "Noir 0.38.0",
    "backend": "Barretenberg 0.61.0",
    "dependencies": ["eddsa", "poseidon"]
  },
  "contracts": {
    "framework": "Hardhat",
    "plugin": "hardhat-noir",
    "network": "Holesky",
    "solidity": "0.8.20"
  },
  "backend": {
    "runtime": "Node.js + Express",
    "signing": "@noble/curves (EdDSA)",
    "email": "Resend",
    "storage": "Redis (OTP only)",
    "deploy": "Railway"
  },
  "frontend": {
    "framework": "Next.js 14",
    "wallet": "RainbowKit + wagmi",
    "styling": "Tailwind + shadcn/ui",
    "zk": "@noir-lang/noir_js",
    "deploy": "Vercel"
  }
}
```

---

## Repository Structure

```
zeroklue/
├── packages/
│   ├── contracts/              # Person 4
│   │   ├── circuits/           # Person 3's verifier goes here
│   │   ├── contracts/
│   │   │   └── ZeroKlue.sol
│   │   ├── test/
│   │   └── hardhat.config.ts
│   │
│   ├── circuits/               # Person 3
│   │   ├── src/
│   │   │   └── main.nr
│   │   ├── Nargo.toml
│   │   └── Prover.toml
│   │
│   ├── backend/                # Person 2
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── routes/
│   │   │   └── services/
│   │   └── package.json
│   │
│   ├── frontend/               # Person 1
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   └── package.json
│   │
│   └── merchant-demo/          # Person 1 + 2
│       └── app/
│
├── docs/
│   ├── PITCH.md
│   ├── HACKATHON_QA.md
│   └── PRD.md
│
└── README.md
```

---

## What Each Person Needs RIGHT NOW

### Person 1 (Frontend)
```bash
cd zeroklue
npx create-next-app@latest packages/frontend
cd packages/frontend
npm install @rainbow-me/rainbowkit wagmi viem
npm install @radix-ui/react-dialog
npm install tailwindcss
```

### Person 2 (Backend)
```bash
cd zeroklue/packages
mkdir backend && cd backend
npm init -y
npm install express cors redis resend @noble/curves dotenv
npm install -D typescript @types/express @types/node
```

### Person 3 (Circuits)
```bash
cd zeroklue/packages
mkdir circuits && cd circuits
nargo new .
# Add eddsa to Nargo.toml
```

### Person 4 (Contracts)
```bash
cd zeroklue/packages
mkdir contracts && cd contracts
npx hardhat init
npm install --save-dev hardhat-noir
npm install @openzeppelin/contracts
```

---

## Critical Decisions Made

1. **Using EdDSA not ECDSA**: Inspired by Anon-Aadhaar, but simpler
2. **Using hardhat-noir**: Better DX than manual workflow
3. **Monorepo structure**: Easier to share types
4. **Railway for backend**: Faster than AWS
5. **Holesky only**: No need for mainnet

---

## Success Metrics

By Hour 12: ✅ All pieces work independently
By Hour 16: ✅ E2E flow works once
By Hour 20: ✅ E2E flow works reliably + polished
By Hour 22: ✅ Demo-ready with backup video

---

## Emergency Fallbacks

If something breaks:

1. **Circuit too slow?** → Use mock verification for demo, show circuit code
2. **Proof generation fails?** → Pre-generate proof, show it in demo
3. **Contract deployment fails?** → Use pre-deployed contract on testnet
4. **Email service fails?** → Hardcode OTP for demo

**Don't let one piece block everything!**

---

Ready to start? Let me scaffold the initial structure! 🚀
