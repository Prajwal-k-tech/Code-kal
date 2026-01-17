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
│  • Verifies ZK proof             • Checks nullifier             │
│  • ~300K gas                     • Mints NFT on success         │
└─────────────────────────────────────────────────────────────────┘
```

### Why This Approach?
- **Trustless**: Google signs the JWT, we verify cryptographically. We never see your email.
- **Private**: ZK proof reveals only that you're from a valid domain, not which one.
- **Sybil-resistant**: Nullifier prevents one account minting multiple NFTs.

## 📦 Repository Structure

```
codekal/
├── packages/
│   └── circuits/              # Noir ZK circuits (ported from StealthNote)
│       ├── Nargo.toml         # noir-jwt dependency
│       └── src/main.nr        # JWT verification circuit
│
├── zeroklue-app/              # Scaffold-ETH 2 app
│   └── packages/
│       ├── foundry/           # Smart contracts
│       │   └── contracts/
│       │       ├── Verifier.sol      # Auto-generated
│       │       └── ZeroKlue.sol      # NFT + verification
│       └── nextjs/            # Frontend
│           ├── lib/
│           │   ├── google-oauth.ts
│           │   └── circuits/jwt.ts
│           └── components/
│               ├── VerifyStudent.tsx
│               └── DiscountMarketplace.tsx
│
├── PRD.md                     # Product requirements
├── TEAM_PLAN.md               # Task division
├── ENGINEERING_PLAN.md        # Technical implementation
└── TECHNICAL_DECISIONS.md     # Architecture decisions
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- [Nargo 1.0.0-beta](https://noir-lang.org/docs/getting_started/installation/) 
- [Foundry](https://book.getfoundry.sh/getting-started/installation)
- [Barretenberg](https://github.com/AztecProtocol/aztec-packages/tree/master/barretenberg)

### Installation

```bash
# Clone the repo
git clone https://github.com/Prajwal-k-tech/Code-kal.git
cd Code-kal

# Install dependencies
yarn install

# Compile the circuit
cd packages/circuits
nargo compile

# Start local chain (Terminal 1)
cd zeroklue-app
yarn chain

# Deploy contracts (Terminal 2)
yarn deploy

# Start frontend (Terminal 3)
yarn start
```

### Demo Flow

1. Open http://localhost:3000
2. Connect wallet (MetaMask)
3. Click "Verify Student Status"
4. Sign in with Google (@university.edu)
5. Wait for ZK proof generation (~30 seconds)
6. Confirm transaction
7. 🎉 Soulbound NFT minted!

## 🧪 Testing

```bash
# Test Noir circuit
cd packages/circuits
nargo test

# Test smart contracts
cd zeroklue-app/packages/foundry
forge test -vvv
```

## 📋 Documentation

| Document | Description |
|----------|-------------|
| [PRD.md](PRD.md) | Product requirements & user stories |
| [TEAM_PLAN.md](TEAM_PLAN.md) | Task division & timeline |
| [ENGINEERING_PLAN.md](ENGINEERING_PLAN.md) | Technical implementation details |
| [TECHNICAL_DECISIONS.md](TECHNICAL_DECISIONS.md) | Architecture decisions & rationale |
| [RESEARCH_FINDINGS.md](RESEARCH_FINDINGS.md) | StealthNote analysis |

## 📚 Key Technologies

| Layer | Technology | Purpose |
|-------|-----------|---------|
| ZK Circuits | Noir 1.0.0-beta | JWT signature verification |
| JWT Library | noir-jwt v0.4.4 | RSA-SHA256 in ZK circuit |
| Proving Backend | Barretenberg (UltraHonk) | Fast verification on-chain |
| Smart Contracts | Solidity 0.8.20 (Foundry) | On-chain verification + NFT |
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
2. **Google Sign-In**: Click "Verify Student Status" → Sign in with @university.edu
3. **Proof Generation**: Browser generates ZK proof (~30s) proving valid Google JWT
4. **Submit Proof**: Send proof to smart contract
5. **Receive NFT**: Soulbound student pass minted to your wallet

### For Partners

```solidity
bool isStudent = ZeroKlue.balanceOf(userAddress) > 0;
bytes32 domainHash = ZeroKlue.getDomainHash(tokenId);
```

## 🔒 Privacy Guarantees

- **Trustless**: Google signs JWT, we never see credentials
- **Zero-Knowledge**: Partners never see email/name/university
- **Sybil Resistant**: Nullifier prevents multiple NFTs per account
- **Soulbound**: NFT cannot be transferred

## 🙏 Acknowledgments

- [StealthNote](https://github.com/saleel/stealthnote) - Circuit architecture
- [noir-jwt](https://github.com/saleel/noir-jwt) - JWT verification
- [Scaffold-ETH 2](https://scaffoldeth.io) - Frontend framework

---

**Verify once. Prove forever. Stay private.** 🚀
