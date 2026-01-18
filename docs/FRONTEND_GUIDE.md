# Frontend Guide

## Verification Flow
1.  **Connect Wallet**: Uses RainbowKit/Wagmi. Connects to local Anvil chain or testnet.
2.  **Google Sign-In**: Uses GSI (Google Identity Services). Returns `id_token`.
3.  **Proof Generation**:
    *   Runs in a Web Worker (to avoid freezing UI).
    *   Uses `noir_wast` and `bb.js`.
    *   Takes ~2-3 seconds on modern hardware.
4.  **Verification & Minting**:
    *   Verifies proof locally.
    *   Calls `ZeroKlue.registerStudent()`.
    *   Waits for transaction receipt.

## Components
- **`VerificationCard.tsx`**: The main wizard. Handles state machine (Idle -> OAuth -> Proof -> Mint -> Success).
- **`OfferStack.tsx`**: Marketplace UI. Checks `useStudentNFT()` hook to unlock cards.
- **`ProofModal.tsx`**: Legacy component (kept for reference, but verify logic moved to hooks).

## Hooks
- **`useStudentVerification.ts`**: Orchestrates the entire flow.
- **`useStudentNFT.ts`**: Read hook. Returns `{ hasNFT, verifiedAt }`.
