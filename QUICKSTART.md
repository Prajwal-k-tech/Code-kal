# 🚀 ZeroKlue Quick Start (22.5 Hours Remaining)

> **Current Status**: Scaffold-ETH installed at `/zeroklue-app`
> **Time**: Hour 0
> **Goal**: Everyone productive in 30 minutes

---

## 🎯 Team Assignments

### Person 1: Frontend Lead
**Where**: `zeroklue-app/packages/nextjs/`  
**First Task**: Remove example UI, create 3 pages

### Person 2: Backend + DevOps
**Where**: `backend/` (separate project)  
**First Task**: Set up Redis + Resend account

### Person 3: Circuits + Crypto
**Where**: `backend/lib/noir/` or separate `circuits/`  
**First Task**: Study Anon-Aadhaar circuit, design ours

### Person 4: Smart Contracts
**Where**: `zeroklue-app/packages/foundry/contracts/`  
**First Task**: Study Scaffold-ETH examples, design ZeroKlue.sol

---

## ⚡ Setup Instructions (Next 30 Minutes)

### Everyone: Prerequisites

```bash
# 1. Node.js 18+
node --version  # Should be v18+

# 2. Yarn (Scaffold-ETH uses it)
npm install -g yarn

# 3. Git
git --version
```

### Person 1: Frontend Setup

```bash
# Navigate to Next.js package
cd zeroklue-app/packages/nextjs

# Install dependencies (already done by scaffold)
yarn install

# Start dev server
yarn start

# Should open http://localhost:3000
# You'll see Scaffold-ETH example UI

# Next steps:
# 1. Remove example components
# 2. Create app/verify/page.tsx
# 3. Create app/marketplace/page.tsx
# 4. Create app/merchant-demo/page.tsx
```

**Resources**:
- Scaffold-ETH docs: https://docs.scaffoldeth.io
- Components: `zeroklue-app/packages/nextjs/components/`
- Existing examples to learn from

### Person 2: Backend Setup

```bash
# Create backend directory (separate from Scaffold)
cd /home/prajwal-k/VS\ Code/codekal
mkdir -p backend/src/{routes,services,utils,middleware}
cd backend

# Initialize
npm init -y

# Install dependencies
npm install express cors dotenv redis resend zod @noble/curves

# Dev dependencies
npm install -D typescript tsx @types/express @types/cors @types/node

# Initialize TypeScript
npx tsc --init

# Set up Redis (Ubuntu)
sudo apt update
sudo apt install redis-server
sudo systemctl start redis
redis-cli ping  # Should return PONG

# Alternative: Docker Redis
docker run -d -p 6379:6379 redis:alpine

# Get Resend API key
# 1. Go to https://resend.com
# 2. Sign up (free tier: 3000 emails/month)
# 3. Get API key
# 4. Add to .env

# Create .env
cat > .env << 'EOF'
PORT=4000
REDIS_URL=redis://localhost:6379
RESEND_API_KEY=re_...  # Your key here
ISSUER_PRIVATE_KEY=  # Generate later
ALLOWED_DOMAINS=iiitkottayam.ac.in,iitb.ac.in,iisc.ac.in
NODE_ENV=development
EOF

# Copy starter files from packages/backend (we created earlier)
# Or build from scratch following ENGINEERING_PLAN.md
```

**First Endpoint to Build**:
```typescript
// src/index.ts
import express from 'express';

const app = express();
app.use(express.json());

app.post('/api/verify/email', (req, res) => {
  const { email } = req.body;
  // TODO: Send OTP
  res.json({ success: true, message: 'OTP sent!' });
});

app.listen(4000, () => console.log('Backend on :4000'));
```

### Person 3: Circuits Setup

```bash
# Install Noir (if not already)
curl -L https://raw.githubusercontent.com/noir-lang/noirup/main/install | bash
source ~/.bashrc  # or ~/.zshrc
noirup

# Verify installation
nargo --version  # Should show 0.38.0 or higher

# Create circuits directory
cd /home/prajwal-k/VS\ Code/codekal
mkdir circuits
cd circuits

# Initialize Noir project
nargo new .

# Install dependencies
# Edit Nargo.toml, add:
# [dependencies]
# eddsa = { git = "https://github.com/noir-lang/eddsa", tag = "v0.1.0" }

# Study reference implementation
cd ~
git clone https://github.com/anon-aadhaar/anon-aadhaar-noir
cd anon-aadhaar-noir
# Study circuits/ directory to understand structure
```

**First Circuit to Write**:
```noir
// src/main.nr
fn main(
    issuer_pubkey_x: Field,
    issuer_pubkey_y: Field,
    nullifier: pub Field,
    wallet_address: pub Field,
    signature_r: Field,
    signature_s: Field,
    email_hash: Field,
) {
    // TODO: Verify EdDSA signature
    // TODO: Verify nullifier = hash(email_hash)
}
```

### Person 4: Contracts Setup

```bash
# Navigate to Foundry contracts
cd zeroklue-app/packages/foundry

# Foundry is already installed by Scaffold-ETH
forge --version

# Study example contract
cat contracts/YourContract.sol

# Run example tests
forge test

# Get testnet ETH
# 1. Create wallet if needed
# 2. Get Holesky ETH: https://faucet.holesky.io
# 3. Or https://cloud.google.com/application/web3/faucet/ethereum/holesky

# Set up .env for deployment
cp .env.example .env
# Add your private key (NEVER commit this!)
```

**First Contract to Write**:
```solidity
// contracts/ZeroKlue.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ZeroKlue {
    struct StudentVerification {
        uint256 verifiedAt;
        uint256 nullifier;
    }
    
    mapping(address => StudentVerification) public verifications;
    
    // TODO: Add verifyAndMint function
    // TODO: Add isRecentlyVerified function
}
```

---

## 🔥 First 2-Hour Sprint Goals

### Person 1 (Frontend)
- [ ] Remove Scaffold-ETH example UI
- [ ] Create basic page structure (3 routes)
- [ ] Add email input form
- [ ] Test wallet connection works

**Deliverable**: Can type email, connect wallet

### Person 2 (Backend)
- [ ] Express server running on :4000
- [ ] Redis connection working
- [ ] Resend account configured
- [ ] Can send test email

**Deliverable**: `curl localhost:4000/health` returns OK

### Person 3 (Circuits)
- [ ] Noir installed and working
- [ ] Anon-Aadhaar circuit studied
- [ ] Basic circuit compiles
- [ ] Understand EdDSA verification flow

**Deliverable**: `nargo compile` succeeds

### Person 4 (Contracts)
- [ ] Foundry tests run successfully
- [ ] ZeroKlue.sol created (stub)
- [ ] Understand verifier integration
- [ ] Testnet wallet has ETH

**Deliverable**: `forge test` passes

---

## 📞 Communication Protocol

### Slack/Discord Channels
```
#general - Team coordination
#frontend - Person 1 updates
#backend - Person 2 updates
#circuits - Person 3 updates
#contracts - Person 4 updates
#blockers - Any issues blocking progress
```

### Check-ins
- **Hour 2**: Quick sync (5 min) - show progress
- **Hour 6**: Integration planning (15 min)
- **Hour 12**: Full team sync (30 min) - start integration
- **Hour 16**: Demo readiness check (30 min)
- **Hour 20**: Final testing (all hands)

### Critical Handoffs
1. **Hour 7**: Person 2 gives test signature to Person 3
2. **Hour 15**: Person 3 gives Solidity verifier to Person 4
3. **Hour 15**: Person 4 gives deployed contract address to Person 1
4. **Hour 16**: Everyone integrates for E2E test

---

## 🆘 Emergency Contacts

### If You're Stuck

**Person 1 (Frontend)**:
- Scaffold-ETH Discord: https://discord.gg/scaffoldeth
- Next.js docs: https://nextjs.org/docs
- RainbowKit docs: https://www.rainbowkit.com/docs

**Person 2 (Backend)**:
- Noble Curves docs: https://github.com/paulmillr/noble-curves
- Resend docs: https://resend.com/docs
- Redis docs: https://redis.io/docs

**Person 3 (Circuits)**:
- Noir Discord: https://discord.gg/noir-lang  
- Noir docs: https://noir-lang.org/docs
- Anon-Aadhaar: https://github.com/anon-aadhaar/anon-aadhaar-noir

**Person 4 (Contracts)**:
- Foundry Book: https://book.getfoundry.sh
- OpenZeppelin: https://docs.openzeppelin.com
- Holesky Faucet: https://faucet.holesky.io

### If Something Breaks

1. **Don't panic** - 22.5 hours is tight but doable
2. **Ask team** - Someone might have solved it
3. **Check ENGINEERING_PLAN.md** - Has fallback plans
4. **Google error** - Someone else hit this
5. **Simplify** - Can you achieve 80% with simpler approach?

---

## 📖 Key Documents

Must-read before starting:
1. **ENGINEERING_PLAN.md** - Full technical plan
2. **TEAM_PLAN.md** - Hour-by-hour breakdown
3. **PRD.md** - Product requirements
4. **PITCH.md** - What we're building (the "why")

Nice-to-read:
- **HACKATHON_QA.md** - Answers to judge questions
- **README.md** - Project overview

---

## ✅ Pre-Flight Checklist

Before you start coding:

### Everyone
- [ ] Read ENGINEERING_PLAN.md
- [ ] Understand your role
- [ ] Know who you're dependent on
- [ ] Environment set up (Node, Redis, etc.)
- [ ] Can access repo
- [ ] Joined team communication

### Person 1
- [ ] Scaffold-ETH running on localhost:3000
- [ ] Wallet extension installed (MetaMask/Rainbow)
- [ ] Know basics of Next.js App Router
- [ ] Know how to use RainbowKit

### Person 2
- [ ] Express server runs
- [ ] Redis responds to ping
- [ ] Resend API key works
- [ ] Can send test email
- [ ] Know basics of EdDSA/BabyJubJub

### Person 3
- [ ] Noir installed (`nargo --version`)
- [ ] Can compile example circuit
- [ ] Studied Anon-Aadhaar circuit
- [ ] Understand signature verification

### Person 4
- [ ] Foundry installed (`forge --version`)
- [ ] Can run tests (`forge test`)
- [ ] Has testnet ETH
- [ ] Understand verifier pattern

---

## 🎯 Success = Working Demo by Hour 22

**Not** perfect code.  
**Not** production-ready.  
**Not** fully decentralized.

Just **a working demo** that shows:
1. ✅ Email verification
2. ✅ ZK proof generation
3. ✅ On-chain verification
4. ✅ Merchant can check student status + timestamp

Everything else is bonus. **Ship the core, polish if time.**

---

## 🚀 Let's Build!

**Current Time**: Hour 0  
**Deadline**: Hour 22.5  
**Next Check-in**: Hour 2

Start your timers. Good luck! 💪

---

## Quick Commands Reference

```bash
# Frontend (Person 1)
cd zeroklue-app/packages/nextjs && yarn start

# Backend (Person 2)  
cd backend && npm run dev

# Circuits (Person 3)
cd circuits && nargo compile && nargo prove

# Contracts (Person 4)
cd zeroklue-app/packages/foundry && forge test

# Full build (after Hour 12)
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Foundry
cd zeroklue-app/packages/foundry && yarn chain

# Terminal 3: Frontend
cd zeroklue-app/packages/nextjs && yarn start

# Terminal 4: Deploy contracts
cd zeroklue-app/packages/foundry && yarn deploy
```

**Now go build something amazing!** 🎉
