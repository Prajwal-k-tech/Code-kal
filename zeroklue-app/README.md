# 🔐 ZeroKlue

**Privacy-preserving student/professional verification using Zero-Knowledge Proofs.**

Prove you belong to an organization (university, company) WITHOUT revealing your email address. Only your domain is verified on-chain.

---

## 🎯 The Problem

- Students constantly reshare sensitive info (IDs, emails) to claim discounts
- Companies sell student data; privacy is compromised
- Verification is siloed - prove once per merchant
- Identity fraud is easy (screenshot fake IDs)

## 💡 The Solution

**"Prove once, use everywhere, reveal nothing."**

1. **Zero-Knowledge**: Proves you belong to an organization without revealing WHO you are
2. **Soulbound NFT**: One verification = permanent, portable credential
3. **Privacy by Design**: Only domain is verified, never your email
4. **Trustless**: Blockchain verification - merchants don't need to trust you

---

## 🚀 Quick Start

```bash
./start-demo.sh
```

This will:
1. Start local Anvil blockchain
2. Deploy ZeroKlue contract
3. Fund test accounts
4. Start Next.js frontend at http://localhost:3000

---

## 📦 How It Works

```
┌──────────────────────────────────────────────────────────────────┐
│  1. Connect Wallet (burner wallet, stored in localStorage)       │
│  2. Sign in with Google Workspace account                        │
│  3. ZK proof generated in browser (Noir circuit)                 │
│  4. Proof verified client-side                                   │
│  5. registerStudent(ephemeralPubkey) stores attestation on-chain │
│  6. Merchants query isVerified(address) for instant verification │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Key Features

| Feature | Description |
|---------|-------------|
| **Any Organization** | Works with ANY Google Workspace domain |
| **Client-Side Proving** | All ZK cryptography in browser |
| **Sybil Resistance** | Ephemeral keys prevent double-verification |
| **Gas Efficient** | ~50k gas for attestation |
| **Portable Credential** | Verify once, use across all merchants |

---

## 🏗️ Architecture

- **Frontend**: Next.js + RainbowKit + Wagmi
- **Smart Contract**: Solidity (Foundry)
- **ZK Circuit**: Noir (noir-jwt)
- **Proving**: Barretenberg (client-side)

---

## 📁 Project Structure

```
zeroklue-app/
├── packages/
│   ├── foundry/
│   │   ├── contracts/ZeroKlue.sol  # Main contract
│   │   └── script/                 # Deploy scripts
│   └── nextjs/
│       ├── app/                    # Pages (verify, marketplace, merchant)
│       ├── components/             # React components
│       ├── hooks/                  # useStudentVerification, useStudentNFT
│       └── lib/circuits/           # ZK proof generation
└── packages/circuits/              # Noir circuit source
```

---

## 🔒 Security Model

- ZK proof verifies JWT signature without exposing email
- Ephemeral keys bind proof to wallet (prevents replay)
- Soulbound token (cannot transfer)
- Client-side verification + on-chain attestation

---

## 🧪 Testing

```bash
cd zeroklue-app/packages/foundry
forge test
```

---

## 📄 License

MIT

---

Built with ❤️ using [Scaffold-ETH 2](https://scaffoldeth.io) + [Noir](https://noir-lang.org)