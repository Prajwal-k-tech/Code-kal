#  ZeroKlue

> **Verify once. Prove forever. Stay private.**

ZeroKlue enables students to cryptographically prove their university status without revealing personal data. Built with Noir ZK circuits and verified on-chain.

---

##  Quick Start

### Prerequisites

> **Windows Users:** This project requires a Unix environment. Use [WSL 2](https://learn.microsoft.com/en-us/windows/wsl/install) (Windows Subsystem for Linux).
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
1.  Local Anvil blockchain
2.  Deploys ZeroKlue contracts
3.  Funds test wallets
4.  Opens http://localhost:3000

---

##  What is ZeroKlue?

**The Problem**: SheerID/UNiDAYS collect your personal data just to verify you're a student.

**Our Solution**: ZK proofs + Google OAuth. **No backend. No database. No data collection.**

```
Sign in with Google → ZK proof generated in browser → Submit to contract → Done
```

---

##  Project Structure

```
codekal/
├── zeroklue-app/              # Main app (Scaffold-ETH 2)
│   └── packages/
│       ├── foundry/           # Smart contracts
│       └── nextjs/            # Frontend
├── docs/                      # All documentation
│   ├── PITCH.md               # 🎤 Hackathon pitch
│   ├── HACKATHON_QA.md        #  Judge Q&A prep
│   └── QUICKSTART.md          # Detailed setup
└── start-demo.sh              #  One-click demo
```

---

## Testing

```bash
cd zeroklue-app/packages/foundry
forge test -vvv
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [PITCH.md](docs/PITCH.md) |  **Hackathon pitch** |
| [HACKATHON_QA.md](docs/HACKATHON_QA.md) |  Judge Q&A prep |
| [QUICKSTART.md](docs/QUICKSTART.md) |  Detailed setup guide |
| [TECHNICAL_DEEP_DIVE.md](docs/TECHNICAL_DEEP_DIVE.md) | Architecture explained |

---

##  How It Works

### For Students
1. Connect wallet (MetaMask)
2. Click "Verify with Google"
3. Sign in with @university.edu
4. Wait ~30s for ZK proof generation
5. Soulbound NFT minted!

### For Merchants
```solidity
// Check if wallet is verified
bool isStudent = zeroKlue.isVerified(walletAddress);
if (isStudent) applyDiscount();
```

---

##  Privacy Guarantees

- **Trustless**: Google signs JWT, we verify cryptographically
-  **Zero-Knowledge**: Merchants never see email/name
-  **Soulbound**: NFT cannot be transferred
- **Sybil Resistant**: Ephemeral keys prevent replay

---

##  Acknowledgments

- [StealthNote](https://github.com/saleel/stealthnote) - ZK circuit architecture
- [noir-jwt](https://github.com/saleel/noir-jwt) - JWT verification in Noir
- [Scaffold-ETH 2](https://scaffoldeth.io) - Frontend framework

---

**Verify once. Prove forever. Stay private.** 
