# 🎨 Frontend Developer Guide

> **Your mission**: Build the student verification UI that connects wallet → Google OAuth → shows ZK proof status → submits to contract

---

## Quick Overview

**What ZeroKlue does**: Students prove they're from a university without revealing their email.

**Your job**: Build the frontend that orchestrates:
1. Wallet connection (already done via Scaffold-ETH)
2. "Verify Student Status" button → Google OAuth popup
3. Show proof generation progress (takes 20-40 seconds)
4. Submit proof to smart contract
5. Show success/NFT minted state

---

## Project Structure

```
zeroklue-app/packages/nextjs/
├── app/
│   ├── page.tsx                    # ← EDIT THIS (main page)
│   └── oauth-callback/
│       └── page.tsx                # ✅ DONE - OAuth redirect handler
├── components/
│   ├── VerifyStudent.tsx           # ← CREATE THIS (main component)
│   ├── VerificationProgress.tsx    # ← CREATE THIS (progress UI)
│   └── StudentNFT.tsx              # ← CREATE THIS (NFT display)
├── hooks/
│   └── useStudentVerification.ts   # ✅ DONE - Main verification hook
├── lib/
│   ├── providers/
│   │   └── google-oauth.ts         # ✅ DONE - Google OAuth + proof
│   ├── circuits/
│   │   └── jwt.ts                  # ✅ DONE - ZK circuit helpers
│   ├── ephemeral-key.ts            # ✅ DONE - Ephemeral key generation
│   ├── types.ts                    # ✅ DONE - TypeScript types
│   ├── utils.ts                    # ✅ DONE - Helper functions
│   └── lazy-modules.ts             # ✅ DONE - ZK module loading
└── public/
    └── circuits/
        ├── circuit.json            # ✅ Pre-compiled ZK circuit (1.3MB)
        └── vk                      # ✅ Verification key (binary)
```

---

## Step 1: Install Dependencies

```bash
cd zeroklue-app/packages/nextjs
yarn add @aztec/bb.js @noir-lang/noir_js noir-jwt @noble/ed25519 @noble/hashes
```

---

## Step 2: Set Up Environment

Create `.env.local`:

```env
# Get from Google Cloud Console (OAuth 2.0 credentials)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com

# Chain ID (31337 for local, 11155111 for Sepolia)
NEXT_PUBLIC_TARGET_CHAIN=31337
```

**Google OAuth Setup**:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Go to APIs & Services → Credentials
4. Create OAuth 2.0 Client ID (Web application)
5. Add authorized JavaScript origins: `http://localhost:3000`
6. Add authorized redirect URIs: `http://localhost:3000/oauth-callback`
7. Copy the Client ID

---

## Step 3: Use the Hook

The `useStudentVerification` hook is already created. Here's how to use it:

```typescript
"use client";

import { useStudentVerification } from "~~/hooks/useStudentVerification";

export function VerifyStudent() {
  const { 
    status,      // "idle" | "authenticating" | "generating_proof" | "submitting_tx" | "success" | "error"
    error,       // Error message or null
    domain,      // Verified domain (e.g., "stanford.edu")
    txHash,      // Transaction hash after success
    progress,    // 0-100 progress percentage
    verify,      // Function to start verification
    reset,       // Function to reset state
    isLoading,   // Boolean: true while any step is in progress
  } = useStudentVerification();

  return (
    <div className="card bg-base-100 shadow-xl p-6">
      {status === "idle" && (
        <button 
          className="btn btn-primary btn-lg"
          onClick={verify}
        >
          🎓 Verify with Google
        </button>
      )}

      {isLoading && (
        <div className="text-center">
          <div className="radial-progress" style={{ "--value": progress }}>
            {progress}%
          </div>
          <p className="mt-4">
            {status === "authenticating" && "Signing in with Google..."}
            {status === "generating_proof" && "Generating ZK proof (20-40s)..."}
            {status === "submitting_tx" && "Submitting to blockchain..."}
          </p>
        </div>
      )}

      {status === "success" && (
        <div className="text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold">You're Verified!</h2>
          <p className="text-sm opacity-70">Domain: {domain}</p>
          {txHash && (
            <a 
              href={`https://sepolia.etherscan.io/tx/${txHash}`}
              target="_blank"
              className="link link-primary"
            >
              View Transaction
            </a>
          )}
        </div>
      )}

      {status === "error" && (
        <div className="alert alert-error">
          <span>{error}</span>
          <button className="btn btn-sm" onClick={reset}>Try Again</button>
        </div>
      )}
    </div>
  );
}
```

---

## Step 4: Update Main Page

Edit `app/page.tsx`:

```typescript
import { VerifyStudent } from "~~/components/VerifyStudent";

export default function Home() {
  return (
    <div className="flex flex-col items-center min-h-screen py-8">
      {/* Hero Section */}
      <div className="text-center max-w-2xl px-4">
        <h1 className="text-4xl font-bold mb-4">
          🎓 ZeroKlue
        </h1>
        <p className="text-xl text-base-content/70 mb-8">
          Prove you're a student without revealing your identity.
          Powered by zero-knowledge proofs.
        </p>
      </div>

      {/* Verification Component */}
      <VerifyStudent />

      {/* Info Section */}
      <div className="mt-12 max-w-xl text-center px-4">
        <h3 className="font-semibold mb-2">How it works:</h3>
        <ol className="text-left text-sm space-y-2">
          <li>1. Connect your wallet</li>
          <li>2. Sign in with your university Google account</li>
          <li>3. A ZK proof is generated (your email stays private!)</li>
          <li>4. Receive a soulbound NFT proving your student status</li>
        </ol>
      </div>
    </div>
  );
}
```

---

## Understanding the Flow

```
┌────────────────────────────────────────────────────────────────┐
│                    USER VERIFICATION FLOW                       │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. User clicks "Verify with Google"                           │
│     └─> useStudentVerification.verify() is called              │
│                                                                 │
│  2. Ephemeral key is generated                                 │
│     └─> lib/ephemeral-key.ts                                   │
│     └─> Binds the proof to this browser session                │
│                                                                 │
│  3. Google OAuth popup opens                                   │
│     └─> lib/providers/google-oauth.ts                          │
│     └─> User signs in with @university.edu account             │
│     └─> Google returns signed JWT                              │
│                                                                 │
│  4. ZK Proof is generated (20-40 seconds)                      │
│     └─> lib/circuits/jwt.ts                                    │
│     └─> Proves JWT is valid WITHOUT revealing email            │
│     └─> Uses pre-compiled circuit from /public/circuits/       │
│                                                                 │
│  5. Proof is submitted to ZeroKlue contract                    │
│     └─> verifyAndMint(proofBytes, publicInputs)                │
│     └─> Contract verifies proof via HonkVerifier               │
│     └─> Soulbound NFT is minted to user's wallet               │
│                                                                 │
│  6. Success! User is now verified                              │
│     └─> Other apps can check: zeroKlue.isVerified(userAddress) │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

---

## Smart Contract Integration

After running `yarn deploy`, Scaffold-ETH automatically generates TypeScript bindings.

**Reading verification status**:
```typescript
import { useReadContract } from "wagmi";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";

function useIsVerified(address: string) {
  const { data: contract } = useDeployedContractInfo("ZeroKlue");
  
  return useReadContract({
    address: contract?.address,
    abi: contract?.abi,
    functionName: "isVerified",
    args: [address],
  });
}
```

**Checking recent verification**:
```typescript
// Check if verified within the last year
const { data: isRecent } = useReadContract({
  address: contract?.address,
  abi: contract?.abi,
  functionName: "isRecentlyVerified",
  args: [address, 365 * 24 * 60 * 60], // 365 days in seconds
});
```

---

## Styling Notes

This project uses:
- **TailwindCSS** - Utility classes
- **DaisyUI** - Component library (already configured)

Common classes:
- `btn btn-primary` - Primary button
- `card bg-base-100 shadow-xl` - Card container
- `alert alert-error` - Error message
- `loading loading-spinner` - Loading spinner
- `radial-progress` - Circular progress (set `--value` CSS variable)

---

## Testing Locally

1. **Start local chain**:
   ```bash
   yarn chain
   ```

2. **Deploy contracts** (in another terminal):
   ```bash
   yarn deploy
   ```

3. **Start frontend** (in another terminal):
   ```bash
   yarn start
   ```

4. **Test with Google OAuth**:
   - You need a Google Workspace account (university email)
   - Personal Gmail accounts won't work (no domain)
   - For testing, you can use any Google Workspace domain

---

## Files You Need to Create

### 1. `components/VerifyStudent.tsx`
The main verification button and flow UI (see example above).

### 2. `components/VerificationProgress.tsx` (optional)
A more detailed progress display with step indicators.

### 3. `components/StudentNFT.tsx` (optional)
Display the minted NFT with verification details.

### 4. `components/DiscountMarketplace.tsx` (optional)
A grid of available student discounts.

---

## Need Help?

- **Types**: Check `lib/types.ts` for all TypeScript interfaces
- **Utils**: Check `lib/utils.ts` for helper functions
- **Scaffold-ETH hooks**: See `hooks/scaffold-eth/` folder
- **DaisyUI components**: https://daisyui.com/components/

---

## What's Already Done

✅ OAuth callback page (`/oauth-callback`)  
✅ useStudentVerification hook  
✅ Google OAuth integration  
✅ ZK proof generation  
✅ Circuit compilation & Verifier.sol  
✅ ZeroKlue.sol smart contract  
✅ Deployment script  

**Your focus**: Build the UI components!
