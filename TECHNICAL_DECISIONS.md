# ZeroKlue Technical Decisions

> **Last Updated**: January 17, 2026  
> **Status**: Scaffold Ready for Development

---

## Quick Links for Team
- [PRD.md](./PRD.md) - Product Requirements
- [ENGINEERING_PLAN.md](./ENGINEERING_PLAN.md) - Implementation Plan
- [TEAM_PLAN.md](./TEAM_PLAN.md) - Role Assignments
- [HACKATHON_QA.md](./HACKATHON_QA.md) - Anticipated Questions

---

## Key Technical Decisions

### 1. Email Domain Verification ✅ DECIDED

**Approach**: Use [Hipo University Domains API](https://github.com/Hipo/university-domains-list)

```typescript
// Free hosted API - no setup needed!
const response = await fetch(
  `http://universities.hipolabs.com/search?domain=${emailDomain}`
);
const universities = await response.json();
const isValid = universities.length > 0;
```

**Fallback**: Local JSON with common domains including:
- `.iiitkottayam.ac.in` (our university)
- `.ac.in`, `.edu`, `.ac.uk` (general patterns)

**Why**: 
- 1.5K+ stars, actively maintained
- Free hosted API
- Contains 10,000+ universities worldwide
- No API key needed

---

### 2. UX Flow ✅ DECIDED

**Changed from PRD**: Show offers FIRST, then prompt verification

```
┌─────────────────────────────────────────────────────┐
│  NEW FLOW (Better UX)                               │
├─────────────────────────────────────────────────────┤
│                                                     │
│  1. Landing Page → Show locked offer cards          │
│     "See what discounts you could unlock!"          │
│                                                     │
│  2. Click "Unlock Offers" → Start verification      │
│     - Email entry                                   │
│     - OTP verification                              │
│     - Wallet connection                             │
│     - Proof generation                              │
│     - NFT mint                                      │
│                                                     │
│  3. Return to marketplace → All unlocked! 🎉        │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Why**: Users see value before asking for verification

---

### 3. Email/OTP Delivery ✅ DECIDED

**Primary**: [Resend](https://resend.com) - 100 emails/day FREE
- Perfect for hackathon demo
- 5-minute setup
- Clean React Email templates

**Fallback for Dev**: 
```typescript
if (process.env.NODE_ENV === 'development') {
  console.log(`🔐 OTP for ${email}: ${otp}`);
  return; // Skip email sending
}
```

**Alternative Free Options**:
- Mailazy (free tier)
- Nodemailer + Gmail (for testing)

---

### 4. ZK Proof Implementation ✅ DECIDED

**THIS IS REAL ZK - Our Core Value Prop!**

**Stack**:
- [Noir](https://noir-lang.org/) 0.38.0 - Circuit language
- [EdDSA Library](https://github.com/noir-lang/eddsa) - Signature verification
- [NoirJS](https://noir-lang.org/docs/tutorials/noirjs_app) - Browser proving
- [Barretenberg](https://github.com/AztecProtocol/barretenberg) - Proving backend (UltraHonk)

**Circuit Logic**:
```noir
// What we're proving:
// 1. I have a valid signature from ZeroKlue (issuer)
// 2. The signature is over my wallet address
// 3. I know a secret that derives to the public nullifier
// 4. Therefore: I'm a verified student, but you don't know my email
```

**Resources from awesome-noir**:
- [EdDSA](https://github.com/noir-lang/eddsa) - Signature verification
- [Poseidon](https://github.com/noir-lang/poseidon) - Hashing
- [NoirJS Tutorial](https://noir-lang.org/docs/tutorials/noirjs_app) - Browser integration
- [foundry-noir-helper](https://github.com/0xnonso/foundry-noir-helper) - Contract integration

---

### 5. Merchant Demo ✅ DECIDED

**Location**: `/merchant` route in same Next.js app

**Features**:
- Simple product page (TechMart)
- "Student Discount" toggle
- NFT ownership check via wagmi
- Price update animation

---

### 6. Frontend Architecture ✅ DECIDED

Following [Vercel React Best Practices](https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices):

- ✅ Suspense boundaries for proof generation
- ✅ Dynamic imports for NoirJS (heavy bundle)
- ✅ SWR for caching wallet/NFT status
- ✅ content-visibility for offer cards

---

## Folder Structure for Team

```
zeroklue-app/
├── packages/
│   ├── foundry/                    # 👤 CONTRACTS DEV
│   │   └── contracts/
│   │       ├── ZeroKlue.sol        # Main contract (exists)
│   │       └── UltraVerifier.sol   # Generated from Noir
│   │
│   └── nextjs/                     # 👤 FRONTEND DEVS
│       ├── app/
│       │   ├── page.tsx            # Landing + Locked offers
│       │   ├── verify/
│       │   │   └── page.tsx        # Verification flow
│       │   ├── marketplace/
│       │   │   └── page.tsx        # Unlocked offers
│       │   └── merchant/
│       │       └── page.tsx        # Demo merchant site
│       │
│       ├── components/
│       │   ├── offers/             # Offer card components
│       │   ├── verify/             # Email/OTP/Wallet components
│       │   ├── proof/              # Proof generation UI
│       │   └── shared/             # Shared UI components
│       │
│       └── lib/
│           ├── noir/               # NoirJS integration
│           ├── universities/       # Domain validation
│           └── api/                # Backend API calls
│
├── packages/
│   ├── backend/                    # 👤 BACKEND DEV
│   │   └── src/
│   │       ├── routes/
│   │       │   └── verify.ts       # OTP endpoints
│   │       └── services/
│   │           ├── otpService.ts   # OTP logic
│   │           └── cryptoService.ts # Credential signing
│   │
│   └── circuits/                   # 👤 ZK DEV
│       └── src/
│           └── main.nr             # Noir circuit
```

---

## Team Assignment

| Role | Person | Primary Files |
|------|--------|---------------|
| **Frontend 1** | - | `app/verify/`, `components/verify/` |
| **Frontend 2** | - | `app/marketplace/`, `components/offers/` |
| **Backend** | - | `packages/backend/` |
| **Contracts** | - | `packages/foundry/contracts/` |
| **ZK Circuit** | - | `packages/circuits/` |

---

## Git Workflow

1. **Main branch**: `main` - Protected, requires PR
2. **Feature branches**: `feature/<your-feature>`
3. **Naming**: `feature/email-verification`, `feature/offer-cards`

```bash
# Clone and start
git clone https://github.com/Prajwal-k-tech/Code-kal.git
cd Code-kal
git checkout -b feature/your-feature

# Work, commit, push
git add .
git commit -m "feat: your feature"
git push -u origin feature/your-feature

# Open PR on GitHub
```

---

## Environment Variables Needed

```bash
# .env.local (Frontend)
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_id
NEXT_PUBLIC_ALCHEMY_API_KEY=your_key

# .env (Backend)
RESEND_API_KEY=re_xxxxx
ISSUER_PRIVATE_KEY=0x... # EdDSA private key for signing credentials
REDIS_URL=redis://localhost:6379 # Optional, can use in-memory for demo
```

---

## Quick Start Commands

```bash
# Install all dependencies
pnpm install

# Frontend (zeroklue-app)
cd zeroklue-app && pnpm dev

# Backend
cd packages/backend && pnpm dev

# Circuits (compile)
cd packages/circuits && nargo compile

# Contracts (test)
cd zeroklue-app/packages/foundry && forge test
```
