# ZeroKlue

> **Verify once. Prove forever. Stay private.**

ZeroKlue enables students to cryptographically prove their university status without revealing personal data. Built with Noir ZK circuits and verified on-chain.

---

## Quick Start

### Prerequisites

> **Windows Users:** This project requires a Unix environment. Use [WSL 2](https://learn.microsoft.com/en-us/windows/wsl/install).
> 
> ```powershell
> # In PowerShell (Admin)
> wsl --install -d Ubuntu
> # Then open Ubuntu from Start Menu and continue below
> ```

| Requirement | Install Command |
|-------------|-----------------|
| **Node.js 18+** | [nodejs.org](https://nodejs.org) or `curl -fsSL https://deb.nodesource.com/setup_18.x \| sudo -E bash - && sudo apt install -y nodejs` |
| **Foundry** | `curl -L https://foundry.paradigm.xyz \| bash && foundryup` |
| **Yarn** | `npm install -g yarn` |

### Run the Demo

```bash
# Clone and enter
git clone https://github.com/Prajwal-k-tech/Code-kal.git
cd Code-kal

# One command to rule them all
chmod +x start-demo.sh
./start-demo.sh
```

This starts:
1. Local Anvil blockchain
2. Deploys ZeroKlue contracts
3. Funds test wallets
4. Opens http://localhost:3000

---

## What is ZeroKlue?

**The Problem**: Traditional verification services (SheerID, UNiDAYS) collect your personal data just to confirm you're a student. In Web3, this is even worse - associating your email with your wallet makes you a target.

**Our Solution**: ZK proofs + Google OAuth. **No backend. No database. No data collection.**

```
Sign in with Google → ZK proof generated in browser → Submit to contract → Done
```

---

## Why Web3 Needs This

1. **DAO Governance**: DAOs give away millions in grants. One person with 1,000 wallets can rig votes. ZeroKlue provides Sybil resistance without KYC.

2. **Sybil-Resistant Airdrops**: Projects want to airdrop to future builders (students), not bot farms.

3. **Token-Gated Communities**: University alumni groups, company channels - all verifiable without doxxing.

---

## Project Structure

```
codekal/
├── zeroklue-app/              # Main app (Scaffold-ETH 2)
│   └── packages/
│       ├── foundry/           # Smart contracts (ZeroKlue.sol)
│       └── nextjs/            # Frontend (React + RainbowKit)
├── packages/circuits/         # Noir ZK circuit source
└── start-demo.sh              # One-click demo
```

---

## How It Works

### For Students
1. Connect wallet (MetaMask)
2. Click "Verify with Google"
3. Sign in with @university.edu
4. Wait ~30s for ZK proof generation
5. Soulbound NFT minted!

### For Merchants/DAOs
```solidity
// Check if wallet is verified
bool isStudent = zeroKlue.isVerified(walletAddress);
if (isStudent) applyDiscount();
```

---

## Testing

```bash
cd zeroklue-app/packages/foundry
forge test -vvv
```

All 14 tests passing.

---

## Privacy Guarantees

- **Trustless**: Google signs JWT, we verify cryptographically
- **Zero-Knowledge**: Merchants never see email/name/institution
- **Soulbound**: NFT cannot be transferred
- **Sybil Resistant**: Nullifiers prevent reuse of same email

---

## Technical Stack

| Layer | Technology |
|-------|------------|
| ZK Circuits | Noir 1.0.0-beta |
| Proving Backend | Barretenberg (UltraHonk) |
| Smart Contracts | Solidity 0.8.21 (Foundry) |
| Frontend | Next.js 15 + RainbowKit + wagmi |

---

## Acknowledgments

- [StealthNote](https://github.com/saleel/stealthnote) - ZK circuit architecture (our circuit is adapted from their MIT-licensed JWT verification)
- [noir-jwt](https://github.com/saleel/noir-jwt) - JWT verification in Noir
- [Scaffold-ETH 2](https://scaffoldeth.io) - Frontend framework

---

**Verify once. Prove forever. Stay private.**
