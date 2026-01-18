# Product Requirements Document (PRD)

**Status: ✅ COMPLETE**

## 1. Product Overview
**ZeroKlue**: A privacy-preserving student verification platform.
**Goal**: Allow students to claim discounts without exposing their PII (Personally Identifiable Information).

## 2. Core Features (MVP)
- [x] **Wallet Connection**: Burner wallet (auto-generated) or Metamask.
- [x] **Identity Provider**: Google Workspace (University/Corporate emails).
- [x] **Privacy Engine**: Noir ZK Circuit (Client-side proving).
- [x] **Credential**: Soulbound Token (SBT) on-chain.
- [x] **Marketplace Demo**: UI showing locked vs. unlocked offers.

## 3. User Flow
1.  Land on Homepage.
2.  Click "Get Verified".
3.  Sign in with Google.
4.  "Generating Proof..." (Loading state).
5.  "Verification Complete".
6.  Redirect to Marketplace -> Offers Unlocked.

## 4. Technical Constraints
- **Chain**: EVM Compatible (Anvil/Base).
- **ZK Stack**: Noir + Barretenberg.
- **Browser Compatibility**: Chrome/Brave/Firefox (WASM support required).

## 5. Future Scope (Post-MVP)
- Mobile App Support.
- Multi-Chain credentials.
- APAAR ID Integration (India Stack).
