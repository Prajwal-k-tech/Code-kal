# ZeroKlue: Trustless Student Verification on Ethereum

> **Verify once. Prove forever. Stay private.**

ZeroKlue enables students to cryptographically prove their university status without revealing personal data. Built with Noir ZK circuits (adapted from [StealthNote](https://github.com/saleel/stealthnote)) and verified on-chain via Scaffold-ETH 2.

## 🎯 What is ZeroKlue?

Sign in with Google → ZK proof generated in browser → Submit to smart contract → Student status recorded → Access discounts across Web3.

**The Problem**: Current solutions (SheerID, UNiDAYS) collect unnecessary personal data and require trusting centralized services.

**Our Solution**: Trustless verification using Google's JWT signatures + zero-knowledge proofs. **No backend. No database. No data collection.**

## 🚀 The Demo Flow

```
┌───────────────────────────────────────────────────────────┐
│  ZEROKLUE APP                                             │
├───────────────────────────────────────────────────────────┤
│  1. Connect MetaMask wallet                               │
│  2. Click "Verify with Google"                            │
│  3. Sign in with @iiitkottayam.ac.in                      │
│  4. Wait ~30 seconds for ZK proof generation              │
│  5. Proof submitted → Student status recorded on-chain    │
└───────────────────────────────────────────────────────────┘
                           │
                           ▼
┌───────────────────────────────────────────────────────────┐
│  MERCHANT DEMO                                            │
├───────────────────────────────────────────────────────────┤
│  1. Visit merchant page                                   │
│  2. Connect same wallet                                   │
│  3. Contract checks: isVerified(wallet)?                  │
│  4. ✅ YES → Discount applied                             │
│  5. Merchant NEVER sees your email                        │
└───────────────────────────────────────────────────────────┘
```

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      BROWSER (CLIENT-SIDE)                       │
├─────────────────────────────────────────────────────────────────┤
│  [Wallet]  →  [Google OAuth]  →  [ZK Proof Gen]  →  [Submit TX] │
│  RainbowKit     Returns JWT       NoirJS (40s)      wagmi/viem  │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ETHEREUM (ANVIL/SEPOLIA)                      │
├─────────────────────────────────────────────────────────────────┤
│  Verifier.sol (generated)  ←→  ZeroKlue.sol (soulbound NFT)     │
│  • Verifies ZK proof             • Checks ephemeral key         │
│  • ~300K gas                     • Mints NFT on success         │
└─────────────────────────────────────────────────────────────────┘
```

### Why This Approach?
- **Trustless**: Google signs the JWT, we verify cryptographically. We never see your email.
- **Private**: ZK proof reveals only that you're from a valid domain, not which one.
- **Sybil-resistant**: Ephemeral public key prevents same key being used twice. Users can re-verify with new keys for privacy rotation.

## 📦 Repository Structure

```
codekal/
├── zeroklue-app/              # 🎯 Main app (Scaffold-ETH 2)
│   └── packages/
│       ├── foundry/           # Smart contracts
│       │   └── contracts/
│       │       ├── HonkVerifier.sol  # ZK proof verifier (generated)
│       │       └── ZeroKlue.sol      # Student registry + soulbound NFT
│       └── nextjs/            # Frontend
│           ├── app/           # Next.js pages
│           ├── components/    # UI components
│           ├── lib/
│           │   ├── providers/google-oauth.ts
│           │   └── circuits/jwt.ts
│           ├── hooks/
│           │   └── useStudentVerification.ts
│           └── public/circuits/circuit.json  # Compiled Noir circuit
│
├── docs/                      # 📚 All documentation
│   ├── QUICKSTART.md          # 👈 Start here
│   ├── FRONTEND_GUIDE.md      # Frontend dev guide
│   ├── FRONTEND_COMMENTS.md   # Code review feedback
│   ├── ROADMAP.md             # What's left to build
│   ├── ENGINEERING_PLAN.md    # Technical architecture
│   └── ...                    # More docs
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- [Foundry](https://book.getfoundry.sh/getting-started/installation)

### Installation

```bash
# Clone the repo
git clone https://github.com/Prajwal-k-tech/Code-kal.git
cd Code-kal

# 🚀 Easiest Way (Automated)
chmod +x start-demo.sh
./start-demo.sh

# 🛠️ Manual Setup (If automation fails)
# Install dependencies
cd zeroklue-app
yarn install

# Start local chain (Terminal 1)
yarn chain

# Deploy contracts (Terminal 2)
yarn deploy

# Start frontend (Terminal 3)
cd packages/nextjs
yarn dev
```

### Demo Flow

1. Open http://localhost:3000
2. Connect wallet (MetaMask)
3. Click "Verify with Google"
4. Sign in with @university.edu
5. Wait for ZK proof generation (~30 seconds)
6. Confirm transaction
7. 🎉 Soulbound NFT minted!

## 🧪 Testing

```bash
# Test smart contracts
cd zeroklue-app/packages/foundry
forge test -vvv
```

## 📋 Documentation

All docs are in the [`docs/`](docs/) folder:

| Document | Description |
|----------|-------------|
| [QUICKSTART.md](docs/QUICKSTART.md) | 👈 **Start here** - 5-minute setup |
| [TECHNICAL_DEEP_DIVE.md](docs/TECHNICAL_DEEP_DIVE.md) | 🔬 **Under the hood** - All technologies & flow explained |
| [FRONTEND_GUIDE.md](docs/FRONTEND_GUIDE.md) | Frontend dev guide with code examples |
| [BACKEND_READY.md](docs/BACKEND_READY.md) | Contract API + what's ready |
| [ROADMAP.md](docs/ROADMAP.md) | What's left to build |
| [ENGINEERING_PLAN.md](docs/ENGINEERING_PLAN.md) | Technical architecture |
| [PITCH.md](docs/PITCH.md) | Project pitch for judges |
| [HACKATHON_QA.md](docs/HACKATHON_QA.md) | Judge Q&A prep |

### Reference Code
Our ZK proof generation is adapted from **[StealthNote](https://github.com/nicholashc/stealthnote)** - an MIT-licensed project that verifies Google JWTs in zero-knowledge. Key files to study:
- [`app/lib/providers/google-oauth.ts`](https://github.com/nicholashc/stealthnote/blob/main/app/lib/providers/google-oauth.ts)
- [`app/lib/circuits/jwt.ts`](https://github.com/nicholashc/stealthnote/blob/main/app/lib/circuits/jwt.ts)

## 📚 Key Technologies

| Layer | Technology | Purpose |
|-------|-----------|---------|
| ZK Circuits | Noir 1.0.0-beta | JWT signature verification |
| JWT Library | noir-jwt | RSA-SHA256 in ZK circuit |
| Proving Backend | Barretenberg (UltraHonk) | Fast verification on-chain |
| Smart Contracts | Solidity 0.8.21 (Foundry) | On-chain verification + NFT |
| Frontend | Next.js 15 (Scaffold-ETH 2) | User interface |
| Wallet | RainbowKit + wagmi + viem | Ethereum wallet connection |
| OAuth | Google OAuth 2.0 | JWT token acquisition |

## 🔑 Environment Variables

### Frontend (`zeroklue-app/packages/nextjs/.env.local`)

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

> **No backend needed!** Fully client-side architecture.

## 🎓 How It Works

### For Students

1. **Connect Wallet**: Connect MetaMask or any EVM wallet
2. **Google Sign-In**: Click "Verify with Google" → Sign in with @university.edu
3. **Proof Generation**: Browser generates ZK proof (~30s) proving valid Google JWT
4. **Submit Proof**: Send proof to smart contract
5. **Receive NFT**: Soulbound student pass minted to your wallet

### For Merchants

```tsx
// Check if wallet has ZeroKlue NFT
const isStudent = await zeroKlue.isVerified(walletAddress);
if (isStudent) applyDiscount();
```

## 🔒 Privacy Guarantees

- **Trustless**: Google signs JWT, we never see credentials
- **Zero-Knowledge**: Merchants never see email/name/university
- **Sybil Resistant**: Nullifier prevents multiple NFTs per account
- **Soulbound**: NFT cannot be transferred

## 🙏 Acknowledgments

- [StealthNote](https://github.com/nicholashc/stealthnote) - Circuit architecture & code
- [noir-jwt](https://github.com/saleel/noir-jwt) - JWT verification in Noir
- [Scaffold-ETH 2](https://scaffoldeth.io) - Frontend framework

---

**Verify once. Prove forever. Stay private.** 🚀
