# 🎨 Frontend Developer Guide

> **Your mission**: Build the UI for Google OAuth → ZK proof → soulbound NFT  
> **No backend. Everything runs in the browser and on-chain.**

---

## 📍 Where You Work

\`\`\`
zeroklue-app/packages/nextjs/
├── app/                           # Next.js App Router
│   ├── page.tsx                   # Main landing page
│   └── oauth-callback/page.tsx    # Handles Google redirect
├── components/                    # React components
├── hooks/
│   └── useStudentVerification.ts  # 🔥 Main hook - handles everything
├── lib/
│   ├── providers/google-oauth.ts  # Google OAuth helper
│   ├── circuits/jwt.ts            # ZK proof generation
│   ├── ephemeral-key.ts           # Session key management
│   └── types.ts                   # TypeScript types
├── public/circuits/               # Pre-compiled circuit artifacts
│   ├── circuit.json               # Noir circuit (1.3MB)
│   └── circuit-vkey.json          # Verification key
└── contracts/
    └── deployedContracts.ts       # Auto-populated after yarn deploy
\`\`\`

---

## 🚀 Setup Steps

### 1. Install Dependencies

\`\`\`bash
cd zeroklue-app/packages/nextjs
yarn add @aztec/bb.js @noir-lang/noir_js noir-jwt @noble/ed25519 @noble/hashes
\`\`\`

### 2. Create Environment File

\`\`\`bash
# zeroklue-app/packages/nextjs/.env.local
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
\`\`\`

**How to get Google Client ID:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create project (or select existing)
3. Create OAuth 2.0 Client ID → Web application
4. Authorized JavaScript origins: \`http://localhost:3000\`
5. Authorized redirect URIs: \`http://localhost:3000/oauth-callback\`

### 3. Deploy Contracts

\`\`\`bash
cd zeroklue-app
yarn chain    # Terminal 1
yarn deploy   # Terminal 2
\`\`\`

### 4. Start Dev Server

\`\`\`bash
cd zeroklue-app/packages/nextjs
yarn dev
\`\`\`

---

## 🎯 The Core Hook

The \`useStudentVerification\` hook handles the entire flow:

\`\`\`tsx
import { useStudentVerification } from "~~/hooks/useStudentVerification";

function VerifySection() {
  const {
    verify,     // Start verification
    reset,      // Reset to idle state
    status,     // Current step
    progress,   // 0-100 percentage
    error,      // Error message if failed
    domain,     // Detected email domain
    txHash,     // Transaction hash on success
  } = useStudentVerification();

  return (
    <div>
      {status === "idle" && (
        <button onClick={verify}>Verify with Google</button>
      )}
      
      {status === "generating_proof" && (
        <p>Generating ZK proof... ({progress}%)</p>
      )}
      
      {status === "success" && (
        <p>✅ Verified! Domain: {domain}</p>
      )}
      
      {status === "error" && (
        <div>
          <p>❌ {error}</p>
          <button onClick={reset}>Try Again</button>
        </div>
      )}
    </div>
  );
}
\`\`\`

### Status Values

| Status | What's Happening |
|--------|------------------|
| \`idle\` | Ready to start |
| \`connecting_wallet\` | Checking wallet is connected |
| \`authenticating\` | Google OAuth popup open |
| \`generating_proof\` | NoirJS computing proof (~30s) |
| \`submitting_tx\` | Waiting for contract transaction |
| \`success\` | NFT minted! |
| \`error\` | Something failed |

---

## 🛍️ Merchant Demo Page

Create a simple page that checks if wallet has ZeroKlue NFT:

\`\`\`tsx
// app/merchant/page.tsx
"use client";

import { useAccount, useReadContract } from "wagmi";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";

export default function MerchantPage() {
  const { address, isConnected } = useAccount();
  const { data: zeroKlue } = useDeployedContractInfo("ZeroKlue");

  const { data: isVerified } = useReadContract({
    address: zeroKlue?.address,
    abi: zeroKlue?.abi,
    functionName: "isVerified",
    args: [address],
    enabled: !!address && !!zeroKlue,
  });

  return (
    <main>
      <h1>TechMart - Student Store</h1>
      <p>MacBook Pro: <s>$999</s> Student: $799</p>
      
      {isVerified ? (
        <p>✅ Student discount applied!</p>
      ) : (
        <p>❌ Verify at ZeroKlue first</p>
      )}
    </main>
  );
}
\`\`\`

---

## 📦 What's Pre-Built vs What You Build

### ✅ Already Done (Don't Touch)

| File | Purpose |
|------|---------|
| \`lib/providers/google-oauth.ts\` | Google OAuth + JWT extraction |
| \`lib/circuits/jwt.ts\` | ZK proof generation |
| \`hooks/useStudentVerification.ts\` | Main verification hook |
| \`public/circuits/*\` | Circuit artifacts |

### 🔨 Your Job (Build These)

| Component | Priority |
|-----------|----------|
| Landing page with hero | P0 |-done
| VerificationCard with progress | P0 |
| Success state with NFT badge | P0 |
| Merchant demo page | P1 |
| Offers grid | P2 |-shiv is building

---

## 🔗 Reference: StealthNote

The proof generation code is from [StealthNote](https://github.com/nicholashc/stealthnote):

| Our File | StealthNote |
|----------|-------------|
| \`lib/providers/google-oauth.ts\` | \`app/lib/providers/google-oauth.ts\` |
| \`lib/circuits/jwt.ts\` | \`app/lib/circuits/jwt.ts\` |

---

## ⚠️ Important Notes

- **Proof takes ~30 seconds** - show progress indicator!
- **Keep tab open** during proof generation
- **Mobile may struggle** - warn users
- First proof is slower (WASM cold start)

---

## 🧪 Testing

1. Import Anvil test account into MetaMask
2. Test with real Google account (OAuth requires it)
3. Check browser console for \`[ZeroKlue]\` logs

---

## 📚 More Docs

- [QUICKSTART.md](QUICKSTART.md)
- [ROADMAP.md](ROADMAP.md)
- [ENGINEERING_PLAN.md](ENGINEERING_PLAN.md)

**Build an amazing UI! 🚀**
