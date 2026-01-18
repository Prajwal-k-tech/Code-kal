# Engineering Plan & Status

**Status: ✅ COMPLETE**
**Last Updated: Jan 2026**

## 🎯 Objective
Build a privacy-preserving student verification system using Zero-Knowledge Proofs (Noir) and Ethereum (Next.js + Foundry).

## 🏗️ Architecture (Final)

### 1. Identity Source (Google)
- Users sign in via Google OAuth.
- We extract the JWT (ID Token).
- **Critical:** We rely on the `hd` (Hosted Domain) claim for organization verification.

### 2. Client-Side Proving (The "Hybrid" Model)
*Decision: We moved from full on-chain verification to a hybrid model for gas efficiency and speed.*

- **Browser**: Generates ZK proof using `noir_wast` / `bb.js`.
- **Circuit**: Verifies JWT signature and extracts domain hash *privately*.
- **Output**: A valid ZK proof + Ephemeral Public Key.

### 3. On-Chain Attestation (The "Soulbound" Token)
- **Contract**: `ZeroKlue.sol`
- **Action**: `registerStudent(ephemeralPubkey)`
- **Mechanism**:
    1. Frontend verifies proof (fast, free).
    2. Frontend calls contract to "attest" validation.
    3. Contract stores `verifiedAt` timestamp and `ephemeralPubkey`.
    4. Token is **Soulbound** (non-transferable).

### 4. Marketplace / Merchant
- Checks `useStudentNFT()` hook.
- If `hasNFT` is true, unlocks exclusive offers.
- No backend required for merchants - just read the blockchain.

## 🛠️ Tech Stack
- **ZK**: Noir, Barretenberg (Aztec)
- **Frontend**: Next.js 14, Tailwind, RainbowKit
- **Blockchain**: Foundry (Anvil for local dev), Wagmi
- **Auth**: Google OAuth (GSI)

## 📝 Change Log / Pivot
- **Initial Plan**: Full On-Chain Verifier (`HonkVerifier.sol`).
- **Pivot**: Too expensive/complex for demo. Moved to Client-Side verification + On-Chain Registry.
- **Result**: Working end-to-end demo with <2s verification time and minimal gas.

## ✅ Completed Tasks
- [x] Noir Circuit (JWT verification)
- [x] Next.js Frontend (Verify & Marketplace pages)
- [x] Ephemeral Key Generation
- [x] Google OAuth Integration
- [x] Smart Contract Registry
- [x] End-to-End Integration
- [x] "Available on Marketplace" Redirect Logic
- [x] Auto-funding for persistent burner wallets
