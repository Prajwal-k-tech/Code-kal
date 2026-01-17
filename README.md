# ZeroKlue: Privacy-Preserving Student Verification on Ethereum

> **Verify once. Use everywhere. Stay private.**

ZeroKlue enables students to prove their university status without sharing personal data. Built with zero-knowledge proofs using Noir and deployed on Ethereum.

## 🎯 What is ZeroKlue?

Students verify their university email → receive a cryptographic credential → generate zero-knowledge proofs → access student discounts across Web3 without revealing identity.

**The Problem**: Current solutions (SheerID, UNiDAYS) collect unnecessary personal data for every verification.

**Our Solution**: Verify once, prove forever—without exposing your identity.

## 🏗️ Architecture

```
Student → Email Verification → EdDSA Credential → Noir Circuit → ZK Proof → Smart Contract → NFT
```

### 3-Layer System

1. **Issuance Layer**: Verify email domain, issue EdDSA-signed credential
2. **Proof Layer**: Generate ZK proof of credential ownership
3. **Verification Layer**: On-chain verification + soulbound NFT minting

## 📦 Monorepo Structure

```
zeroklue/
├── packages/
│   ├── frontend/         # Next.js + RainbowKit UI
│   ├── backend/          # Express API for email verification
│   ├── circuits/         # Noir ZK circuits
│   ├── contracts/        # Solidity smart contracts
│   └── merchant-demo/    # Example merchant integration
├── docs/
│   ├── PITCH.md          # Hackathon pitch
│   ├── HACKATHON_QA.md   # Q&A prep
│   ├── PRD.md            # Product requirements
│   └── TEAM_PLAN.md      # Development roadmap
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Rust & Cargo (for Noir)
- [Nargo](https://noir-lang.org/docs/getting_started/installation/) (Noir CLI)

### Installation

```bash
# Clone the repo
git clone <your-repo-url>
cd zeroklue

# Install root dependencies
npm install

# Install all package dependencies
npm run install:all
```

### Development

```bash
# Start all services (frontend, backend, local blockchain)
npm run dev

# Or start individually:
npm run dev:frontend   # Next.js on :3000
npm run dev:backend    # Express on :4000
npm run dev:contracts  # Hardhat node on :8545
```

### Build

```bash
# Compile circuits
cd packages/circuits
nargo compile

# Generate Solidity verifier
cd ../contracts
npx hardhat compile

# Build frontend
cd ../frontend
npm run build
```

## 🧪 Testing

```bash
# Test backend API
cd packages/backend
npm test

# Test smart contracts
cd packages/contracts
npx hardhat test

# Test Noir circuit
cd packages/circuits
nargo test
```

## 🌐 Deployment

### Backend (Railway)

```bash
cd packages/backend
railway init
railway up
```

### Frontend (Vercel)

```bash
cd packages/frontend
vercel --prod
```

### Contracts (Holesky Testnet)

```bash
cd packages/contracts
npx hardhat run scripts/deploy.ts --network holesky
npx hardhat verify --network holesky <CONTRACT_ADDRESS>
```

## 📚 Key Technologies

| Layer | Technology | Purpose |
|-------|-----------|---------|
| ZK Circuits | Noir 0.38.0 | Signature verification + nullifier |
| Proving Backend | Barretenberg | UltraPlonk prover |
| Smart Contracts | Solidity 0.8.20 | On-chain verification + NFT |
| Frontend | Next.js 14 | User interface |
| Wallet | RainbowKit + wagmi | Ethereum wallet connection |
| Backend | Express + Redis | Email OTP + credential signing |
| Crypto | @noble/curves | EdDSA signing (BabyJubJub) |

## 🔑 Environment Variables

### Backend (`packages/backend/.env`)

```env
PORT=4000
REDIS_URL=redis://localhost:6379
RESEND_API_KEY=your_resend_key
ISSUER_PRIVATE_KEY=your_eddsa_private_key
ALLOWED_DOMAINS=iiitkottayam.ac.in,iitb.ac.in,iisc.ac.in
```

### Frontend (`packages/frontend/.env.local`)

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_CHAIN_ID=17000
```

### Contracts (`packages/contracts/.env`)

```env
HOLESKY_RPC_URL=https://rpc.holesky.io
PRIVATE_KEY=your_deployer_private_key
ETHERSCAN_API_KEY=your_etherscan_key
```

## 👥 Team Allocation (22.5 Hours)

See [TEAM_PLAN.md](docs/TEAM_PLAN.md) for detailed hour-by-hour breakdown.

- **Person 1**: Frontend (UI/UX, wallet integration, proof generation)
- **Person 2**: Backend (API, email verification, credential signing, deployment)
- **Person 3**: Circuits (Noir code, signature verification, nullifier logic)
- **Person 4**: Contracts (Solidity, deployment, integration testing)

## 🎓 How It Works

### For Students

1. **Verify Email**: Enter your university email (e.g., `user@iiitkottayam.ac.in`)
2. **Enter OTP**: Receive and enter 6-digit OTP
3. **Get Credential**: Backend signs your wallet address with EdDSA
4. **Generate Proof**: Click "Unlock Student Pass" → browser generates ZK proof (~5s)
5. **Mint NFT**: Submit proof to smart contract → receive soulbound student NFT
6. **Use Everywhere**: Any merchant can check your NFT for student verification

### For Merchants

```solidity
// Check if address is verified student
bool isStudent = ZeroKlueStudentPass.balanceOf(userAddress) > 0;

if (isStudent) {
    price = studentPrice; // 50% off
} else {
    price = regularPrice;
}
```

## 🔒 Privacy Guarantees

- **Zero-Knowledge**: Merchants never see your email, university, or name
- **Sybil Resistant**: Nullifier prevents verifying multiple wallets with same email
- **Soulbound**: NFT cannot be transferred (tied to your wallet forever)
- **Minimal Data**: Backend only stores OTP for 10 minutes, then deletes

## 📊 Performance

- **Circuit Size**: ~10-15K constraints (vs Anon-Aadhaar's 237K)
- **Proving Time**: <5 seconds on modern laptop
- **Verification Time**: <0.05 seconds on-chain
- **Gas Cost**: ~$0.01 on Ethereum L2s

## 🎤 Pitch & Documentation

- [PITCH.md](docs/PITCH.md) - 2-minute pitch, elevator pitch, technical pitch
- [HACKATHON_QA.md](docs/HACKATHON_QA.md) - Competitor analysis, Q&A prep
- [PRD.md](docs/PRD.md) - Complete product requirements
- [TEAM_PLAN.md](docs/TEAM_PLAN.md) - 4-person, 22.5-hour development plan

## 🤝 Contributing

We're a hackathon project, but contributions welcome!

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/amazing`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing`
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details

## 🙏 Acknowledgments

- [Anon-Aadhaar](https://github.com/anon-aadhaar/anon-aadhaar-noir) - Inspired our ZK architecture
- [Noir Language](https://noir-lang.org/) - Incredible ZK DSL
- [Privacy & Scaling Explorations](https://pse.dev/) - ZK research and tools

## 🚨 Hackathon Notes

This is a hackathon MVP built in 22.5 hours. Known limitations:

- Email verification is domain-based (not integrated with university registrars)
- EdDSA circuit is NOT audited (educational purposes only)
- Backend is centralized (issuer should be decentralized)
- Testnet only (Holesky)

## 📞 Contact

Built for [Hackathon Name] by Team ZeroKlue

- Demo: https://zeroklue.vercel.app
- Pitch Deck: [Link]
- Video Demo: [Link]

---

**Verify once. Use everywhere. Stay private.** 🚀
