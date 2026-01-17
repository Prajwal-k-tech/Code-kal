# 🚀 ZeroKlue Quick Start

> **Architecture**: Google OAuth → ZK Proof (browser) → Smart Contract → NFT  
> **No backend needed. Everything runs client-side.**

---

## ⚡ 5-Minute Setup

### Prerequisites

```bash
# Check versions
node --version    # Need v18+
yarn --version    # Need 1.22+
forge --version   # Foundry CLI
```

### Step 1: Install Dependencies

```bash
# From project root
cd zeroklue-app
yarn install
```

### Step 2: Start Local Blockchain

```bash
# Terminal 1: Start Anvil
yarn chain

# This runs Anvil on http://localhost:8545
# You'll see test accounts with 10000 ETH each
```

### Step 3: Deploy Contracts

```bash
# Terminal 2: Deploy
yarn deploy

# This deploys:
#   - HonkVerifier.sol (ZK proof verifier)
#   - ZeroKlue.sol (NFT + verification registry)
#
# Contract addresses are auto-saved to deployedContracts.ts
```

### Step 4: Start Frontend

```bash
# Terminal 3: Start Next.js
cd packages/nextjs
yarn dev

# Opens http://localhost:3000
```

### Step 5: Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create OAuth 2.0 Client ID (Web application)
3. Add authorized origins: `http://localhost:3000`
4. Add redirect URI: `http://localhost:3000/oauth-callback`
5. Create `.env.local`:

```bash
# zeroklue-app/packages/nextjs/.env.local
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
```

---

## 🎯 What to Build (Frontend Dev)

### The Flow

```
User lands on page
       ↓
[Connect Wallet] ─→ RainbowKit handles this
       ↓
[Verify with Google] ─→ Opens popup
       ↓
User signs in with @university.edu
       ↓
Progress: "Generating ZK proof..." (~30 seconds)
       ↓
Progress: "Submitting to blockchain..."
       ↓
🎉 SUCCESS! NFT minted to wallet
```

### Files Already Set Up

| File | What It Does |
|------|--------------|
| `hooks/useStudentVerification.ts` | Main hook - handles entire flow |
| `lib/providers/google-oauth.ts` | Google OAuth + domain extraction |
| `lib/circuits/jwt.ts` | ZK proof generation with NoirJS |
| `lib/ephemeral-key.ts` | Session key for proof binding |
| `public/circuits/circuit.json` | Pre-compiled Noir circuit (1.3MB) |

### Using the Hook

```tsx
import { useStudentVerification } from "~~/hooks/useStudentVerification";

function VerifyButton() {
  const { 
    verify,           // Call this to start flow
    status,           // 'idle' | 'authenticating' | 'generating_proof' | etc.
    progress,         // 0-100
    error,            // Error message if failed
    domain,           // Detected email domain
    txHash,           // Transaction hash on success
  } = useStudentVerification();

  return (
    <button onClick={verify} disabled={status !== 'idle'}>
      {status === 'idle' ? 'Verify with Google' : status}
    </button>
  );
}
```

### Status Values

```typescript
type VerificationStatus = 
  | 'idle'              // Ready to start
  | 'connecting_wallet' // Checking wallet
  | 'authenticating'    // Google OAuth in progress
  | 'generating_proof'  // NoirJS working (~30s)
  | 'submitting_tx'     // Contract call in progress
  | 'success'           // Done!
  | 'error';            // Something failed
```

---

## 📁 Project Structure

```
codekal/
├── zeroklue-app/                    # 👈 THE APP
│   └── packages/
│       ├── foundry/                 # Smart contracts
│       │   └── contracts/
│       │       ├── HonkVerifier.sol # Generated - verifies proofs
│       │       └── ZeroKlue.sol     # NFT + verification logic
│       │
│       └── nextjs/                  # Frontend
│           ├── app/
│           │   ├── page.tsx         # Main page
│           │   └── oauth-callback/  # Google redirect handler
│           ├── hooks/
│           │   └── useStudentVerification.ts
│           ├── lib/
│           │   ├── providers/google-oauth.ts
│           │   ├── circuits/jwt.ts
│           │   └── ephemeral-key.ts
│           └── public/circuits/     # Circuit artifacts
│               ├── circuit.json
│               └── circuit-vkey.json
│
├── packages/                        # ⚠️ DEPRECATED
│   ├── backend/                     # NOT USED (old OTP approach)
│   └── circuits/                    # NOT USED (artifacts in nextjs/public)
│
├── FRONTEND_GUIDE.md               # Detailed frontend guide
├── ROADMAP.md                      # What's left to do
└── ENGINEERING_PLAN.md             # Technical architecture
```

**Important**: The `packages/backend/` and `packages/circuits/` folders are **DEPRECATED**. All real code is in `zeroklue-app/`.

---

## 🔨 Smart Contract API

### ZeroKlue.sol

```solidity
// Called by frontend after proof generation
function verifyAndMint(bytes proof, bytes32[] publicInputs) external

// Called by merchants to check verification
function isVerified(address wallet) external view returns (bool)

// Get verification details
function getVerification(address wallet) external view returns (
    uint256 verifiedAt,
    bytes32 nullifier,
    bool exists
)
```

### Merchant Integration

```tsx
// Merchant site checks if wallet has ZeroKlue NFT
import { useReadContract } from "wagmi";

function MerchantCheck({ wallet }) {
  const { data: isStudent } = useReadContract({
    address: ZEROKLUE_ADDRESS,
    abi: ZeroKlueABI,
    functionName: "isVerified",
    args: [wallet],
  });

  return isStudent 
    ? <p>✅ Student discount applies!</p>
    : <p>❌ Verify at ZeroKlue first</p>;
}
```

---

## 🧪 Testing the Flow

### Manual Test

1. Start all 3 terminals (chain, deploy, dev)
2. Open http://localhost:3000
3. Connect MetaMask (import Anvil test account)
4. Click "Verify with Google"
5. Sign in with university email
6. Wait ~30 seconds for proof
7. Confirm transaction in MetaMask
8. See success message

### Test Accounts

Anvil provides 10 test accounts with 10000 ETH each. First account:
```
Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

Import this into MetaMask for testing.

---

## 🆘 Troubleshooting

### "Google sign-in was cancelled"
- User closed the popup - just try again

### "ZeroKlue contract not found"
- Make sure `yarn deploy` ran successfully
- Check `deployedContracts.ts` has the address

### Proof takes too long (>60s)
- Normal on first load (WASM initialization)
- Subsequent proofs are faster (~30s)
- Mobile devices may struggle - warn users

### "Invalid proof"
- Circuit mismatch - check HonkVerifier.sol matches circuit.json
- This shouldn't happen with the current setup

### "Credential already used"
- Same Google account can only verify once per wallet
- Use a different account or different wallet

---

## 📚 Key Documents

| Document | Purpose |
|----------|---------|
| [FRONTEND_GUIDE.md](FRONTEND_GUIDE.md) | Detailed frontend instructions |
| [ROADMAP.md](ROADMAP.md) | What's left to build |
| [ENGINEERING_PLAN.md](ENGINEERING_PLAN.md) | Technical architecture |
| [HACKATHON_QA.md](HACKATHON_QA.md) | Judge Q&A prep |

---

## 🚀 Quick Commands

```bash
# Start everything (3 terminals)
cd zeroklue-app && yarn chain      # Terminal 1
cd zeroklue-app && yarn deploy     # Terminal 2 (once)
cd zeroklue-app/packages/nextjs && yarn dev  # Terminal 3

# Run tests
cd zeroklue-app/packages/foundry && forge test

# Check for TypeScript errors
cd zeroklue-app/packages/nextjs && yarn typecheck
```

**Now go build! 🎉**
