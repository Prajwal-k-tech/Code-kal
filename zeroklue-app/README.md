# 🔐 ZeroKlue App

> Privacy-preserving student verification using Zero-Knowledge Proofs.

---

## 🚀 Prerequisites & Quick Start

### Requirements

| Requirement | Install |
|-------------|---------|
| **Node.js 18+** | [nodejs.org](https://nodejs.org) |
| **Foundry** | `curl -L https://foundry.paradigm.xyz \| bash && foundryup` |
| **Yarn** | `npm install -g yarn` |

### One-Command Start

```bash
# From project root (not this folder)
cd ..
./start-demo.sh
```

Or manually:

```bash
# Install dependencies
yarn install

# Terminal 1: Start local chain
yarn chain

# Terminal 2: Deploy contracts
yarn deploy

# Terminal 3: Start frontend
yarn start
```

Open http://localhost:3000

---

## 📁 Project Structure

```
zeroklue-app/
├── packages/
│   ├── foundry/                    # Smart contracts
│   │   ├── contracts/
│   │   │   ├── ZeroKlue.sol        # Main contract
│   │   │   └── HonkVerifier.sol    # ZK verifier
│   │   └── script/                 # Deploy scripts
│   └── nextjs/                     # Frontend
│       ├── app/                    # Pages
│       ├── components/             # UI components
│       ├── hooks/                  # React hooks
│       └── lib/circuits/           # ZK proof generation
```

---

## 🧪 Testing

```bash
cd packages/foundry
forge test -vvv
```

---

## 🔧 Key Features

| Feature | Description |
|---------|-------------|
| **Any Google Workspace** | Works with any @org.edu domain |
| **Client-Side Proving** | ZK proofs generated in browser |
| **Sybil Resistance** | Ephemeral keys prevent replay |
| **~50k Gas** | Cheap attestation tx |

---

## 📄 License

MIT

---

Built with ❤️ using [Scaffold-ETH 2](https://scaffoldeth.io) + [Noir](https://noir-lang.org)