# ZeroKlue: Product Requirements Document (PRD)

**Version**: 1.0 (Hackathon MVP)  
**Date**: January 17, 2026  
**Timeline**: 24 Hours  
**Status**: Ready to Build

---

## Executive Summary

**Product**: On-chain student identity verification using zero-knowledge proofs

**Problem**: Student verification today requires collecting unnecessary PII, creating data breach liability for merchants and requiring students to reverify for each platform.

**Solution**: Students verify once with university email, receive cryptographic credential, generate ZK proofs to claim discounts without revealing identity.

**Success Metrics for Hackathon**:
- ✅ Working end-to-end flow (email verification → proof generation → NFT mint → discount claim)
- ✅ Provable zero-knowledge (email never exposed after verification)
- ✅ Demo-ready in 24 hours
- ✅ Judges can test the flow themselves

**Realistic Expectations**:
- Proof generation: 15-40 seconds (browser-dependent)
- First load: May need to download ~8MB WASM bundle
- Reference: Similar to [StealthNote](https://github.com/saleel/stealthnote) architecture

---

## What We're Building (24-Hour Scope)

### Core Components

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   1. ZEROKLUE WEB APP          2. BACKEND API              │
│   (app.zeroklue.xyz)           (api.zeroklue.xyz)          │
│   • Email verification UI      • OTP sending/verification  │
│   • Wallet connection          • Credential signing        │
│   • Proof generation           • Domain allowlist          │
│   • Offers marketplace         •                           │
│                                                             │
│   3. NOIR CIRCUIT              4. SMART CONTRACTS          │
│   (circuits/)                  (contracts/)                │
│   • Signature verification     • UltraHonk Verifier        │
│   • Nullifier generation       • ZeroKlue NFT Contract     │
│   • ZK proof creation          • Soulbound ERC-721         │
│                                                             │
│   5. MERCHANT DEMO                                          │
│   (shop.zeroklue.xyz)                                       │
│   • Product page with student discount                      │
│   • NFT verification check                                  │
│   • Price toggle demo                                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Detailed Feature Specifications

### Feature 1: Email Verification Flow

**User Story**: As a student, I want to prove I own a university email to get a credential.

**Acceptance Criteria**:
- [ ] User enters email address
- [ ] System validates email domain against allowlist
- [ ] OTP sent to email (6-digit code)
- [ ] User enters OTP within 10 minutes
- [ ] System validates OTP
- [ ] User connects wallet (MetaMask/RainbowKit)
- [ ] Backend signs credential bound to wallet address
- [ ] Credential stored in browser localStorage

**UI/UX Requirements**:
```
Screen 1: Email Entry
──────────────────────
[ZeroKlue Logo]

"Verify Your Student Email"

Email: [________________@_________]
        
[Send Verification Code]

Supported domains: .ac.in, .edu, .ac.uk


Screen 2: OTP Entry  
──────────────────
"Check your email"

We sent a code to prajwal@iiitkottayam.ac.in

Code: [_] [_] [_] [_] [_] [_]

[Verify Code]

Didn't receive? [Resend Code]


Screen 3: Wallet Connection
───────────────────────────
✓ Email verified!

Now connect your wallet to create your credential.

[Connect Wallet]


Screen 4: Success
─────────────────
✅ Credential Created!

Your student credential is securely stored in your browser.

[Go to Marketplace]
```

**API Endpoints**:
```typescript
POST /api/verify-email
Body: { email: string }
Response: { success: boolean, error?: string }

POST /api/verify-otp  
Body: { email: string, otp: string, wallet: string }
Response: { 
  success: boolean, 
  credential: {
    signature: string,
    nullifier_seed: string,
    issuer_pubkey: string,
    domain: string,
    wallet: string
  }
}
```

**Edge Cases**:
- Invalid domain → Show error: "Domain not recognized. Only university emails accepted."
- OTP expired → Show error: "Code expired. Request a new one."
- OTP incorrect → Show error: "Invalid code. Try again. (2 attempts remaining)"
- Wallet mismatch → If user changes wallet, regenerate credential

---

### Feature 2: Offers Marketplace

**User Story**: As a student, I want to see available offers and unlock them with my credential.

**Acceptance Criteria**:
- [ ] Grid of offer cards (Spotify, Uber, Adobe, TechMart)
- [ ] Cards in "locked" state initially (grayscale + blur)
- [ ] "Unlock All Offers" button prominently displayed
- [ ] Click button → Modal explaining proof generation
- [ ] Generate proof (show progress)
- [ ] Submit proof to smart contract
- [ ] Cards animate to "unlocked" state
- [ ] TechMart card shows "Claim Offer" button
- [ ] Clicking TechMart opens merchant demo

**UI/UX Requirements**:
```
Marketplace Screen (Locked State)
──────────────────────────────────
[ZeroKlue Logo]              [Wallet: 0x1234...5678]

Your Student Offers

┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ [Grayscale] │ │ [Grayscale] │ │ [Grayscale] │
│   SPOTIFY   │ │    UBER     │ │    ADOBE    │
│   Premium   │ │    Rides    │ │  Creative   │
│   50% OFF   │ │   $5 OFF    │ │   60% OFF   │
│             │ │             │ │             │
│   🔒 LOCKED │ │   🔒 LOCKED │ │   🔒 LOCKED │
└─────────────┘ └─────────────┘ └─────────────┘

┌─────────────┐
│ [Grayscale] │
│  TECHMART   │
│ Electronics │
│  $200 OFF   │
│             │
│   🔒 LOCKED │
└─────────────┘

          [🔓 Unlock All Offers]


Proof Generation Modal
──────────────────────
Generate Your Student Proof

This creates a zero-knowledge proof that you're 
a student without revealing your identity.

✓ Your email is never exposed
✓ Merchants only see "verified student"
✓ Reusable across all platforms

Progress:
[████████░░░░░░░░░░░░] 40%

○ Loading circuit...
✓ Computing witness...  
→ Generating proof...
○ Submitting to blockchain...

This takes about 15 seconds.


Marketplace Screen (Unlocked State)
───────────────────────────────────
[ZeroKlue Logo]              [Wallet: 0x1234...5678]

Your Student Offers

┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ [Full Color]│ │ [Full Color]│ │ [Full Color]│
│   SPOTIFY   │ │    UBER     │ │    ADOBE    │
│   Premium   │ │    Rides    │ │  Creative   │
│   50% OFF   │ │   $5 OFF    │ │   60% OFF   │
│             │ │             │ │             │
│ [Visit Site]│ │ [Visit Site]│ │ [Visit Site]│
└─────────────┘ └─────────────┘ └─────────────┘

┌─────────────┐
│ [Full Color]│
│  TECHMART   │
│ Electronics │
│  $200 OFF   │
│             │
│ [CLAIM OFFER]│ ← Clickable
└─────────────┘
```

**Technical Requirements**:
- Cards stored as JSON config (easy to add more)
- Lottie animations for unlock transitions
- LocalStorage check for existing NFT (skip proof gen if already minted)
- Error handling for transaction failures

---

### Feature 3: ZK Proof Generation

**User Story**: As a student, I want to generate a privacy-preserving proof of my credential.

**Acceptance Criteria**:
- [ ] Load Noir circuit artifacts (`.json`)
- [ ] Load Barretenberg WASM prover
- [ ] Construct circuit inputs from credential
- [ ] Generate witness
- [ ] Generate proof (UltraPlonk)
- [ ] Extract public inputs (nullifier, wallet, issuer_pubkey)
- [ ] Return proof bytes + public inputs

**Technical Specifications**:

**Circuit Inputs**:
```noir
// Public Inputs
issuer_public_key: [u8; 32]  // ZeroKlue's public key
nullifier: Field              // poseidon_hash(nullifier_seed)
wallet_address: Field         // User's wallet (from msg.sender)

// Private Inputs  
signature: [u8; 64]          // EdDSA signature from backend
nullifier_seed: Field        // Random value from backend
```

**Circuit Logic**:
```noir
use dep::eddsa;

fn main(
    // Public
    pub issuer_public_key: [u8; 32],
    pub nullifier: Field,
    pub wallet_address: Field,
    // Private
    signature: [u8; 64],
    nullifier_seed: Field
) {
    // 1. Compute message = hash(wallet_address)
    let message = std::hash::poseidon::bn254::hash_1([wallet_address]);
    
    // 2. Verify EdDSA signature
    let valid = eddsa::eddsa_verify(
        issuer_public_key,
        signature,
        message
    );
    assert(valid, "Invalid signature");
    
    // 3. Verify nullifier derivation
    let computed_nullifier = std::hash::poseidon::bn254::hash_1([nullifier_seed]);
    assert(nullifier == computed_nullifier, "Invalid nullifier");
}
```

**NoirJS Integration**:
```typescript
import { Noir } from '@noir-lang/noir_js';
import { BarretenbergBackend } from '@noir-lang/backend_barretenberg';

async function generateProof(credential: Credential, wallet: string) {
  // Load circuit
  const circuit = await fetch('/circuits/zeroklue.json').then(r => r.json());
  const noir = new Noir(circuit);
  
  // Prepare inputs
  const inputs = {
    issuer_public_key: hexToBytes(credential.issuer_pubkey),
    nullifier: computeNullifier(credential.nullifier_seed),
    wallet_address: addressToField(wallet),
    signature: hexToBytes(credential.signature),
    nullifier_seed: credential.nullifier_seed
  };
  
  // Generate proof
  const backend = new BarretenbergBackend(circuit);
  const { witness } = await noir.execute(inputs);
  const proof = await backend.generateProof(witness);
  
  return {
    proof: proof.proof,
    publicInputs: proof.publicInputs
  };
}
```

**Performance Targets**:
- Circuit compilation: <5 seconds (one-time)
- Witness generation: <2 seconds
- Proof generation: <15 seconds
- Total: <20 seconds

---

### Feature 4: Smart Contract Verification

**User Story**: As a merchant, I want to verify student status on-chain without learning student identity.

**Contract Architecture**:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./UltraVerifier.sol"; // Generated by Noir

contract ZeroKlueStudentPass is ERC721 {
    // The Noir-generated verifier
    UltraVerifier public verifier;
    
    // Approved issuer public keys
    mapping(bytes32 => bool) public approvedIssuers;
    
    // Used nullifiers (prevent double-minting)
    mapping(bytes32 => bool) public usedNullifiers;
    
    // Token ID counter
    uint256 private _nextTokenId;
    
    // Events
    event StudentVerified(address indexed student, bytes32 nullifier);
    
    constructor(address _verifier, bytes32 _issuerPubkey) 
        ERC721("ZeroKlue Student Pass", "ZKSP") 
    {
        verifier = UltraVerifier(_verifier);
        approvedIssuers[_issuerPubkey] = true;
    }
    
    /**
     * @notice Verify ZK proof and mint student NFT
     * @param proof The ZK proof bytes
     * @param publicInputs [issuer_pubkey, nullifier, wallet_address]
     */
    function verifyAndMint(
        bytes calldata proof,
        bytes32[] calldata publicInputs
    ) external {
        require(publicInputs.length == 3, "Invalid public inputs");
        
        bytes32 issuerPubkey = publicInputs[0];
        bytes32 nullifier = publicInputs[1];
        address wallet = address(uint160(uint256(publicInputs[2])));
        
        // Check 1: Is issuer approved?
        require(approvedIssuers[issuerPubkey], "Issuer not approved");
        
        // Check 2: Is nullifier unused?
        require(!usedNullifiers[nullifier], "Nullifier already used");
        
        // Check 3: Is wallet the caller?
        require(wallet == msg.sender, "Wallet mismatch");
        
        // Check 4: Is proof valid?
        require(verifier.verify(proof, publicInputs), "Invalid proof");
        
        // Mark nullifier as used
        usedNullifiers[nullifier] = true;
        
        // Mint NFT (soulbound - override transfer functions)
        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        
        emit StudentVerified(msg.sender, nullifier);
    }
    
    /**
     * @notice Check if address has student pass
     */
    function isStudent(address account) external view returns (bool) {
        return balanceOf(account) > 0;
    }
    
    /**
     * @notice Override transfer to make soulbound
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal virtual override {
        require(from == address(0), "Token is soulbound");
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }
}
```

**Deployment Steps**:
1. Compile Noir circuit → Generate `UltraVerifier.sol`
2. Deploy UltraVerifier contract
3. Deploy ZeroKlueStudentPass contract with verifier address
4. Add issuer public key to approved list

---

### Feature 5: Merchant Demo

**User Story**: As a merchant, I want to check if a wallet has a student NFT and apply discounts.

**UI/UX Requirements**:
```
TechMart Product Page
─────────────────────

[TechMart Logo]                     [Connect Wallet]

┌────────────────────────────────────────────────┐
│                                                │
│          [MacBook Pro M3 Image]                │
│                                                │
└────────────────────────────────────────────────┘

MacBook Pro M3 14"
━━━━━━━━━━━━━━━━━━

Original Price: $999
Student Price: $799

┌────────────────────────────────────────────────┐
│  🎓 Student Discount Applied                   │
│                                                │
│  Verified via ZeroKlue                         │
│  We don't know who you are.                    │
│  We just know you're a student.                │
└────────────────────────────────────────────────┘

[Add to Cart - $799]


If NOT a student:
─────────────────

MacBook Pro M3 14"  
━━━━━━━━━━━━━━━━━━

Price: $999

┌────────────────────────────────────────────────┐
│  💡 Students save $200                         │
│                                                │
│  Verify with ZeroKlue to unlock discount       │
│                                                │
│  [Verify Student Status] → (links to app)     │
└────────────────────────────────────────────────┘

[Add to Cart - $999]
```

**Technical Implementation**:
```typescript
// Check student status on page load
async function checkStudentStatus(wallet: string) {
  const contract = new ethers.Contract(
    ZEROKLUE_CONTRACT_ADDRESS,
    ['function isStudent(address) view returns (bool)'],
    provider
  );
  
  const isStudent = await contract.isStudent(wallet);
  
  if (isStudent) {
    showStudentPrice();
  } else {
    showRegularPrice();
  }
}
```

---

## Technical Stack

### Frontend (Next.js 14)

```json
{
  "framework": "Next.js 14 (App Router)",
  "styling": "Tailwind CSS + shadcn/ui",
  "wallet": "RainbowKit + wagmi + viem",
  "zk": "@noir-lang/noir_js + @noir-lang/backend_barretenberg",
  "state": "Zustand (for credential storage)",
  "animations": "Framer Motion + Lottie"
}
```

**Key Dependencies**:
```bash
npm install next@14 react react-dom
npm install @rainbow-me/rainbowkit wagmi viem
npm install @noir-lang/noir_js @noir-lang/backend_barretenberg
npm install @radix-ui/react-dialog @radix-ui/react-toast
npm install tailwindcss autoprefixer
npm install zustand
npm install framer-motion lottie-react
```

---

### Backend (Express.js)

```json
{
  "framework": "Express.js",
  "auth": "None (stateless)",
  "email": "Resend or SendGrid",
  "storage": "Redis (OTP storage)",
  "crypto": "@noble/curves (EdDSA signing)"
}
```

**Key Dependencies**:
```bash
npm install express cors
npm install redis
npm install resend  # or @sendgrid/mail
npm install @noble/curves  # EdDSA signing
npm install dotenv
```

**Environment Variables**:
```bash
# .env
RESEND_API_KEY=re_xxx
REDIS_URL=redis://localhost:6379
ISSUER_PRIVATE_KEY=0x...  # EdDSA private key
PORT=3001
```

---

### Smart Contracts (Solidity + Hardhat)

```json
{
  "framework": "Hardhat",
  "solidity": "0.8.20",
  "testing": "Hardhat + Chai",
  "deployment": "Hardhat Ignition",
  "network": "Holesky testnet"
}
```

**Key Dependencies**:
```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npm install @openzeppelin/contracts
```

---

### Circuits (Noir)

```json
{
  "language": "Noir 0.36.0",
  "backend": "Barretenberg (UltraPlonk)",
  "libraries": ["noir-lang/eddsa"]
}
```

**Dependencies** (Nargo.toml):
```toml
[dependencies]
eddsa = { tag = "v0.1.3", git = "https://github.com/noir-lang/eddsa" }
```

---

## Project Structure

```
zeroklue/
├── frontend/                    # Next.js app
│   ├── app/
│   │   ├── page.tsx            # Landing page
│   │   ├── verify/
│   │   │   └── page.tsx        # Email verification flow
│   │   ├── marketplace/
│   │   │   └── page.tsx        # Offers grid
│   │   └── api/                # API routes (if using Next.js API)
│   ├── components/
│   │   ├── VerifyEmail.tsx
│   │   ├── OfferCard.tsx
│   │   ├── ProofModal.tsx
│   │   └── WalletConnect.tsx
│   ├── lib/
│   │   ├── noir.ts             # Proof generation
│   │   ├── contracts.ts        # Contract interactions
│   │   └── store.ts            # Zustand state
│   ├── public/
│   │   └── circuits/           # Compiled Noir artifacts
│   └── package.json
│
├── backend/                     # Express API
│   ├── src/
│   │   ├── index.ts
│   │   ├── routes/
│   │   │   ├── verify.ts       # Email/OTP endpoints
│   │   │   └── credential.ts   # Credential signing
│   │   ├── services/
│   │   │   ├── email.ts        # Resend/SendGrid
│   │   │   ├── redis.ts        # OTP storage
│   │   │   └── crypto.ts       # EdDSA signing
│   │   └── config.ts           # Domain allowlist
│   └── package.json
│
├── circuits/                    # Noir circuits
│   ├── src/
│   │   └── main.nr             # Main verification circuit
│   ├── Nargo.toml
│   └── Verifier.sol            # Generated verifier
│
├── contracts/                   # Solidity contracts
│   ├── ZeroKlueStudentPass.sol
│   ├── test/
│   │   └── ZeroKlue.test.ts
│   └── hardhat.config.ts
│
├── merchant-demo/               # TechMart demo site
│   ├── app/
│   │   └── page.tsx
│   └── package.json
│
└── docs/
    ├── PITCH.md
    ├── HACKATHON_QA.md
    └── PRD.md                   # This file
```

---

## 24-Hour Development Roadmap

### Hour 0-2: Setup & Architecture

**Team**: Everyone together

**Tasks**:
- [ ] Create monorepo structure
- [ ] Initialize Next.js frontend (`npx create-next-app@latest`)
- [ ] Initialize Express backend
- [ ] Initialize Hardhat project (`npx hardhat init`)
- [ ] Initialize Noir project (`nargo new circuits`)
- [ ] Install all dependencies
- [ ] Set up environment variables
- [ ] Create shared types (TypeScript interfaces)
- [ ] Set up Git repo + first commit

**Deliverable**: All projects scaffolded and building

---

### Hour 2-6: Backend + Circuit (Parallel)

#### Team Member 1: Backend API

**Tasks**:
- [ ] Implement domain allowlist config
- [ ] Implement `/verify-email` endpoint
  - Validate domain
  - Generate OTP
  - Store in Redis (10 min expiry)
  - Send email via Resend
- [ ] Implement `/verify-otp` endpoint
  - Check OTP matches
  - Generate EdDSA keypair (or load from env)
  - Sign credential: `sign(hash(wallet_address))`
  - Return credential JSON
- [ ] Test endpoints with Postman/curl
- [ ] Add CORS configuration
- [ ] Add error handling

**Deliverable**: Working API that sends OTPs and signs credentials

#### Team Member 2: Noir Circuit

**Tasks**:
- [ ] Write main.nr circuit
  - Import eddsa library
  - Define public/private inputs
  - Implement signature verification
  - Implement nullifier check
- [ ] Test circuit with mock inputs
  ```bash
  nargo prove
  nargo verify
  ```
- [ ] Generate Solidity verifier
  ```bash
  nargo codegen-verifier
  ```
- [ ] Copy verifier to contracts folder
- [ ] Document circuit logic

**Deliverable**: Working Noir circuit + Solidity verifier

---

### Hour 6-10: Frontend Foundation + Contracts (Parallel)

#### Team Member 1: Frontend (Email Verification)

**Tasks**:
- [ ] Set up RainbowKit + wagmi
- [ ] Create VerifyEmail component
  - Email input form
  - Domain validation (client-side)
  - OTP input (6 digits)
  - Wallet connection button
- [ ] Integrate with backend API
  - Call `/verify-email`
  - Call `/verify-otp`
- [ ] Store credential in localStorage
- [ ] Add loading states
- [ ] Add error handling
- [ ] Style with Tailwind + shadcn/ui

**Deliverable**: Working email verification flow

#### Team Member 2: Smart Contracts

**Tasks**:
- [ ] Write ZeroKlueStudentPass.sol
  - Import UltraVerifier
  - Implement verifyAndMint function
  - Make NFT soulbound (override transfers)
  - Add isStudent view function
- [ ] Write deployment script
- [ ] Write tests
  ```typescript
  describe("ZeroKlue", () => {
    it("should verify valid proof and mint NFT");
    it("should reject used nullifier");
    it("should reject invalid proof");
  });
  ```
- [ ] Deploy to Holesky testnet
- [ ] Verify on Etherscan
- [ ] Document contract address

**Deliverable**: Deployed & verified contracts on Holesky

---

### Hour 10-14: Proof Generation + Marketplace (Parallel)

#### Team Member 1: ZK Proof Generation

**Tasks**:
- [ ] Copy compiled Noir artifacts to `public/circuits/`
- [ ] Create `lib/noir.ts` proof generator
  - Load circuit
  - Initialize Barretenberg backend
  - Construct inputs from credential
  - Generate witness
  - Generate proof
  - Extract public inputs
- [ ] Create ProofModal component
  - Progress bar
  - Step-by-step UI
  - Error handling
- [ ] Test proof generation in browser
- [ ] Optimize bundle size (lazy load WASM)

**Deliverable**: Working browser-based proof generation

#### Team Member 2: Marketplace UI

**Tasks**:
- [ ] Create offer cards config
  ```typescript
  const offers = [
    { id: 'spotify', name: 'Spotify', discount: '50%', logo: '...' },
    { id: 'uber', name: 'Uber', discount: '$5 OFF', logo: '...' },
    { id: 'adobe', name: 'Adobe', discount: '60%', logo: '...' },
    { id: 'techmart', name: 'TechMart', discount: '$200 OFF', clickable: true }
  ];
  ```
- [ ] Create OfferCard component
  - Locked state (grayscale + blur)
  - Unlocked state (full color)
  - Transition animation
- [ ] Create Marketplace page
  - Grid layout
  - "Unlock All" button
- [ ] Wire up proof modal
- [ ] Add NFT check (skip if already minted)

**Deliverable**: Beautiful marketplace UI

---

### Hour 14-18: Integration + Merchant Demo (Parallel)

#### Team Member 1 & 2: Integration

**Tasks**:
- [ ] Connect proof generation to smart contract
  ```typescript
  const tx = await contract.verifyAndMint(proof, publicInputs);
  await tx.wait();
  ```
- [ ] Add transaction confirmation UI
- [ ] Update marketplace to "unlocked" state after mint
- [ ] Add block explorer links
- [ ] Test full flow end-to-end
- [ ] Fix bugs

**Deliverable**: Working E2E flow

#### Team Member 3: Merchant Demo

**Tasks**:
- [ ] Create merchant-demo Next.js app
- [ ] Create product page
  - MacBook Pro listing
  - Two price states (student/regular)
- [ ] Integrate wallet connection
- [ ] Call `isStudent(wallet)` on contract
- [ ] Toggle price display based on NFT
- [ ] Style to look like real e-commerce
- [ ] Add "Verify with ZeroKlue" CTA for non-students

**Deliverable**: Polished merchant demo

---

### Hour 18-20: Polish & Testing

**Team**: Everyone

**Tasks**:
- [ ] End-to-end testing
  - Fresh wallet test
  - Reverification test (should fail with "nullifier used")
  - Non-student wallet test on merchant
- [ ] UI polish
  - Consistent styling
  - Loading states
  - Error messages
  - Success celebrations (confetti?)
- [ ] Mobile responsiveness
- [ ] Add demo instructions
- [ ] Create test accounts for judges
- [ ] Document any limitations/bugs

**Deliverable**: Polished, tested application

---

### Hour 20-22: Documentation & Demo Prep

**Team**: Everyone

**Tasks**:
- [ ] Write README.md
  - How to run locally
  - Architecture diagram
  - Contract addresses
  - Demo flow
- [ ] Create demo script
  - What to say at each step
  - Answers to common questions
- [ ] Record backup video (in case live demo fails)
- [ ] Prepare pitch deck (optional)
- [ ] Test demo flow 3 times
- [ ] Prepare for judge questions (review HACKATHON_QA.md)

**Deliverable**: Ready to demo

---

### Hour 22-24: Buffer & Sleep

**Team**: Everyone

**Tasks**:
- [ ] Fix any last-minute bugs
- [ ] Deploy any updates
- [ ] Get 2 hours of sleep (seriously)
- [ ] Review pitch one more time
- [ ] Relax and be confident

**Deliverable**: Rested team ready to present

---

## API Documentation

### Backend API Endpoints

#### POST `/api/verify-email`

**Request**:
```json
{
  "email": "prajwal@iiitkottayam.ac.in"
}
```

**Response (Success)**:
```json
{
  "success": true,
  "message": "OTP sent to email"
}
```

**Response (Error)**:
```json
{
  "success": false,
  "error": "Domain not recognized"
}
```

**Status Codes**:
- 200: OTP sent
- 400: Invalid domain
- 429: Too many requests
- 500: Server error

---

#### POST `/api/verify-otp`

**Request**:
```json
{
  "email": "prajwal@iiitkottayam.ac.in",
  "otp": "123456",
  "wallet": "0x1234567890abcdef1234567890abcdef12345678"
}
```

**Response (Success)**:
```json
{
  "success": true,
  "credential": {
    "signature": "0xabcd...",
    "nullifier_seed": "0x1234...",
    "issuer_pubkey": "0x5678...",
    "domain": "iiitkottayam.ac.in",
    "wallet": "0x1234...",
    "issued_at": 1737100000
  }
}
```

**Response (Error)**:
```json
{
  "success": false,
  "error": "Invalid OTP"
}
```

**Status Codes**:
- 200: OTP verified, credential issued
- 400: Invalid OTP or expired
- 404: Email not found (OTP not sent)
- 500: Server error

---

### Smart Contract ABI

```typescript
interface ZeroKlueStudentPass {
  // Verify proof and mint NFT
  verifyAndMint(
    proof: bytes,
    publicInputs: bytes32[]
  ): Promise<TransactionResponse>;
  
  // Check if address has student NFT
  isStudent(account: address): Promise<boolean>;
  
  // Check if nullifier is used
  usedNullifiers(nullifier: bytes32): Promise<boolean>;
  
  // Events
  event StudentVerified(address indexed student, bytes32 nullifier);
}
```

---

## Configuration Files

### Domain Allowlist (`backend/src/config.ts`)

```typescript
export const APPROVED_DOMAINS = [
  // Indian IIITs
  'iiitkottayam.ac.in',
  'iiitb.ac.in',
  'iiitd.ac.in',
  
  // Indian IITs
  'iitb.ac.in',
  'iitd.ac.in',
  'iitm.ac.in',
  'iitk.ac.in',
  
  // International (for judges to test)
  'stanford.edu',
  'mit.edu',
  
  // Demo/Testing
  'student.demo',
];
```

---

### Environment Variables

#### Frontend (`.env.local`)
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_CHAIN_ID=17000  # Holesky
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=...
```

#### Backend (`.env`)
```bash
PORT=3001
REDIS_URL=redis://localhost:6379
RESEND_API_KEY=re_...
ISSUER_PRIVATE_KEY=0x...  # EdDSA private key
NODE_ENV=development
```

#### Contracts (`.env`)
```bash
HOLESKY_RPC_URL=https://...
PRIVATE_KEY=0x...  # For deployment
ETHERSCAN_API_KEY=...  # For verification
```

---

## Deployment Checklist

### Before Hackathon Demo

- [ ] **Backend**: Deployed to Railway/Render/Fly.io
- [ ] **Frontend**: Deployed to Vercel
- [ ] **Merchant Demo**: Deployed to Vercel (separate deployment)
- [ ] **Contracts**: Deployed to Holesky, verified on Etherscan
- [ ] **Domain**: (Optional) Buy domain, set up DNS
- [ ] **SSL**: HTTPS enabled on all deployments
- [ ] **CORS**: Backend allows frontend domain
- [ ] **Environment**: All env vars set in production
- [ ] **Testing**: Full E2E test on production URLs

---

## Success Criteria

### Must Have (Demo-Critical)

- [ ] ✅ Student can verify email and get credential
- [ ] ✅ Student can generate ZK proof in browser
- [ ] ✅ Smart contract successfully verifies proof
- [ ] ✅ Student NFT is minted on-chain
- [ ] ✅ Merchant demo checks NFT and shows discount
- [ ] ✅ Full flow works end-to-end with live demo

### Should Have (Polish)

- [ ] 🎨 Beautiful UI with smooth animations
- [ ] ⚡ Proof generation <20 seconds
- [ ] 📱 Mobile responsive design
- [ ] 🔗 Block explorer links for transactions
- [ ] 🎉 Success celebrations (confetti, etc.)
- [ ] 📊 Show "Try to claim twice" demo (fails with nullifier error)

### Nice to Have (If Time)

- [ ] 🌐 Custom domain (zeroklue.xyz)
- [ ] 📹 Video explainer on landing page
- [ ] 🎨 Multiple merchant examples
- [ ] 📊 Admin dashboard showing total verifications
- [ ] 🔔 Email confirmation after successful verification

---

## Risk Management

### Critical Risks

| Risk | Mitigation |
|------|------------|
| **Proof generation fails in browser** | Test on multiple browsers early. Have backup delegated prover. |
| **Smart contract reverts on demo** | Thoroughly test on Holesky. Have backup wallet with pre-minted NFT. |
| **Email service rate limits** | Use reliable provider (Resend). Test rate limits beforehand. |
| **Circuit compilation issues** | Lock Noir version. Test compilation in CI/CD. |
| **Wallet connection bugs** | Use battle-tested RainbowKit. Test with multiple wallets. |

### Technical Debt (Post-Hackathon)

| Item | Why It's OK for Hackathon |
|------|---------------------------|
| Hardcoded issuer key | Fine for demo. Production needs HSM/multi-sig. |
| No key rotation | Fine for demo. Production needs upgrade mechanism. |
| Browser proving only | Fine for demo. Production needs delegated proving. |
| No credential expiration | Fine for demo. Production needs time-based expiration. |
| Basic domain allowlist | Fine for demo. Production needs governance. |

---

## Post-Hackathon Roadmap

### Week 1-2: Bug Fixes & User Feedback

- Fix bugs found during hackathon
- Get feedback from judges/attendees
- Improve UX based on feedback

### Week 3-4: University Partnership

- Reach out to IIIT Kottayam admins
- Pitch ZeroKlue as student service
- Get 50+ students to test

### Month 2: First Merchant Integration

- Find crypto-native merchant (NFT marketplace?)
- Integrate ZeroKlue verification
- Launch publicly

### Month 3: Fundraise

- If we have 500+ students + 2+ merchants
- Raise $100-200K seed round
- Hire 1-2 engineers

### Month 6: Production Launch

- Delegated proving infrastructure
- 10+ university partnerships
- 10+ merchant integrations
- Revenue: $5K MRR

---

## Team Responsibilities

### During Hackathon

| Person | Primary | Secondary | Backup |
|--------|---------|-----------|--------|
| **Person 1** | Frontend (UI/UX) | Integration | Testing |
| **Person 2** | Backend (API) | Circuits | Documentation |
| **Person 3** | Smart Contracts | Merchant Demo | Deployment |

### Communication

- Slack/Discord for real-time chat
- Google Doc for shared notes
- GitHub for code
- Stand-ups every 4 hours (8am, 12pm, 4pm, 8pm)

---

## Resources & References

### Documentation

- **Noir**: https://noir-lang.org/docs
- **Barretenberg**: https://github.com/AztecProtocol/barretenberg
- **RainbowKit**: https://rainbowkit.com/docs
- **Hardhat**: https://hardhat.org/docs
- **shadcn/ui**: https://ui.shadcn.com

### Example Projects

- **zk-hangman-noir**: https://github.com/Turupawn/zk-hangman-noir
- **hardhat-noir-starter**: https://github.com/olehmisar/hardhat-noir-starter
- **StealthNote**: https://github.com/saleel/stealthnote
- **GitClaim**: https://github.com/saleel/gitclaim

### Tools

- **Holesky Faucet**: https://holesky-faucet.pk910.de/
- **Holesky Explorer**: https://holesky.etherscan.io/
- **Resend**: https://resend.com/
- **Vercel**: https://vercel.com/
- **Railway**: https://railway.app/

---

## Appendix: Key Technical Decisions

### Why EdDSA over ECDSA?

**Decision**: Use EdDSA (BabyJubJub) for credential signatures.

**Reasoning**:
- ✅ Much faster to verify in ZK circuits
- ✅ Well-supported in Noir ecosystem
- ✅ Lower constraint count

**Tradeoff**: 
- ❌ Can't use MetaMask signatures directly
- ❌ Need backend signing

**Conclusion**: Worth it for performance. Backend signing is fine for MVP.

---

### Why UltraPlonk over Groth16?

**Decision**: Use UltraPlonk (via Barretenberg).

**Reasoning**:
- ✅ No trusted setup ceremony (for hackathon speed)
- ✅ Universal setup
- ✅ Noir's default backend

**Tradeoff**:
- ❌ Slightly larger proof size than Groth16
- ❌ Slightly slower verification

**Conclusion**: Universal setup is worth the minor perf hit.

---

### Why Soulbound NFT?

**Decision**: Make student NFT non-transferable.

**Reasoning**:
- ✅ Prevents selling credentials
- ✅ Prevents borrowing credentials
- ✅ Maintains integrity

**Tradeoff**:
- ❌ If wallet is lost, credential is lost

**Conclusion**: Integrity > convenience for identity.

---

## Final Checklist Before Demo

### Day Before

- [ ] All services deployed and accessible
- [ ] Test full flow 5 times
- [ ] Prepare 2-3 test wallets with Holesky ETH
- [ ] Record backup video demo
- [ ] Print/prepare pitch deck
- [ ] Review HACKATHON_QA.md
- [ ] Get 6+ hours of sleep

### Demo Day

- [ ] Laptop fully charged
- [ ] Backup laptop ready
- [ ] Phone hotspot ready (backup internet)
- [ ] Demo script printed
- [ ] Business cards ready
- [ ] Comfortable clothes
- [ ] Water + snacks
- [ ] Positive attitude 😊

---

**Remember**: The goal isn't to build a perfect product. The goal is to prove the concept works and get people excited about the vision.

You got this! 🚀

---

**Last Updated**: January 17, 2026  
**Status**: Ready to Build  
**Let's ship it!** ⚡
