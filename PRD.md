# ZeroKlue: Product Requirements Document (PRD)

**Version**: 2.0 (StealthNote Fork Approach)  
**Date**: January 17, 2026  
**Timeline**: 24 Hours  
**Status**: Ready to Build

---

## Executive Summary

**Product**: On-chain student & professional identity verification using zero-knowledge proofs

**Problem**: Student/professional verification today requires collecting unnecessary PII, creating data breach liability for merchants and requiring users to re-verify for each platform.

**Solution**: Users verify once with Google Workspace (university or company), generate a ZK proof that their JWT is from an authorized domain, mint a soulbound NFT—all without revealing their email address.

**Key Innovation**: We're adapting [StealthNote's](https://github.com/saleel/stealthnote) proven JWT verification circuit for a new use case: private credential NFTs for discounts and gated content.

**Success Metrics for Hackathon**:
- ✅ Working end-to-end flow (Google OAuth → proof generation → NFT mint → discount claim)
- ✅ True zero-knowledge (Google is the only trusted party, not us)
- ✅ Demo-ready in 24 hours
- ✅ Judges can test the flow themselves

---

## Why This Approach is Better (Version 2.0 Changes)

| Aspect | Old Approach (OTP) | New Approach (JWT) |
|--------|-------------------|-------------------|
| **Trust Model** | Trust ZeroKlue backend | Trust Google (already trusted) |
| **Trustlessness** | ❌ We're the signer | ✅ Google is the signer |
| **Backend Needed** | ❌ Yes (OTP, email, Redis) | ✅ No backend! |
| **Complexity** | Medium | Higher (but proven circuit exists) |
| **UX** | Email → OTP → Wait | Click → OAuth → Done |
| **Market** | Any university email | Google Workspace only (most universities) |

**The honest pitch changed from**:
> "We verify you're a student" (trusted issuer)

**To**:
> "Google already verified you—we just make it private and portable" (trustless)

---

## What We're Building (24-Hour Scope)

### Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ZEROKLUE ARCHITECTURE                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   USER FLOW                                                                 │
│   ────────                                                                  │
│   1. Connect Wallet (MetaMask via RainbowKit)                               │
│   2. Click "Verify with Google"                                             │
│   3. Google OAuth popup → Authenticate with @university.edu                 │
│   4. Get signed JWT (contains domain, email_verified, nonce)                │
│   5. Client generates ZK proof (proves JWT is valid, domain matches)        │
│   6. Submit proof to smart contract                                         │
│   7. Contract verifies → Mints soulbound NFT                                │
│   8. User unlocks discounts                                                 │
│                                                                             │
│   COMPONENTS                                                                │
│   ──────────                                                                │
│   ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐     │
│   │  Next.js App     │    │  Noir Circuit    │    │  Smart Contracts │     │
│   │  (Scaffold-ETH)  │    │  (From Stealth)  │    │  (Foundry)       │     │
│   ├──────────────────┤    ├──────────────────┤    ├──────────────────┤     │
│   │ • RainbowKit     │    │ • JWT Verify     │    │ • Verifier.sol   │     │
│   │ • Google OAuth   │    │ • RSA Sig Check  │    │ • ZeroKlue.sol   │     │
│   │ • Proof Gen UI   │    │ • Domain Extract │    │ • Nullifier Reg  │     │
│   │ • Marketplace    │    │ • Nullifier Gen  │    │ • NFT Mint       │     │
│   └──────────────────┘    └──────────────────┘    └──────────────────┘     │
│                                                                             │
│   NO BACKEND NEEDED! 🎉                                                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## User Stories

### Primary: Student Verification

**As a student**, I want to prove I'm enrolled at a university without revealing my email, so I can access student discounts privately.

**Acceptance Criteria**:
- [ ] I can connect my MetaMask wallet
- [ ] I can sign in with my university Google Workspace account
- [ ] The system generates a ZK proof (20-40 seconds)
- [ ] I receive a soulbound NFT proving my student status
- [ ] My email is NEVER stored anywhere (not on-chain, not on any server)
- [ ] I can use this NFT to claim discounts

### Secondary: Professional Verification

**As a professional**, I want to prove I work at a company (e.g., @google.com) to access B2B offers privately.

**Acceptance Criteria**:
- Same flow as above, just with company Google Workspace
- NFT proves "verified @google.com domain" (not which employee)

### Tertiary: Merchant Integration

**As a merchant**, I want to verify customers have valid student NFTs to offer discounts.

**Acceptance Criteria**:
- [ ] I can check if a wallet holds a ZeroKlue NFTa
- [ ] I can verify the NFT's domain hash matches my allowlist
- [ ] I can check when the verification happened (freshness)

---

## Technical Specifications

### From StealthNote (MIT Licensed - Porting)

| Component | Source | Destination |
|-----------|--------|-------------|
| JWT Circuit | `stealthnote/circuit/src/main.nr` | `packages/circuits/src/main.nr` |
| noir-jwt dep | `Nargo.toml` | `packages/circuits/Nargo.toml` |
| OAuth Helper | `app/lib/providers/google-oauth.ts` | `packages/nextjs/lib/google-oauth.ts` |
| Proof Gen | `app/lib/circuits/jwt.ts` | `packages/nextjs/lib/circuits/jwt.ts` |
| Ephemeral Keys | `app/lib/circuits/ephemeral-key.ts` | `packages/nextjs/lib/circuits/ephemeral-key.ts` |

### New (Building Fresh)

| Component | Purpose |
|-----------|---------|
| `ZeroKlue.sol` | ERC-721 soulbound NFT with nullifier registry |
| `Verifier.sol` | Generated from Noir circuit via `bb write_solidity_verifier` |
| `VerifyStudent.tsx` | Main UI component for verification flow |
| `DiscountMarketplace.tsx` | Grid of student/professional offers |
| `useStudentVerification.ts` | React hook for the full flow |

---

## UI Mockups

### Screen 1: Landing Page

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  [Logo]  ZeroKlue                              [Connect Wallet] │
│                                                                 │
│  ═══════════════════════════════════════════════════════════   │
│                                                                 │
│          🎓 Prove You're a Student. Privately.                  │
│                                                                 │
│     Get exclusive discounts without revealing your identity.    │
│     Powered by zero-knowledge proofs.                           │
│                                                                 │
│              ┌─────────────────────────────┐                    │
│              │  🔐 Verify with Google      │                    │
│              └─────────────────────────────┘                    │
│                                                                 │
│     Works with any Google Workspace university or company.      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Screen 2: Verification In Progress

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│          🔐 Generating Your Proof                               │
│                                                                 │
│     ████████████████████░░░░░░░░░░░░░░  60%                    │
│                                                                 │
│     This takes 20-40 seconds. Don't close this tab!             │
│                                                                 │
│     ✅ Google sign-in complete                                  │
│     ✅ JWT retrieved                                            │
│     ⏳ Generating ZK proof...                                   │
│     ⬜ Submitting to blockchain                                 │
│     ⬜ Minting your NFT                                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Screen 3: Success + Marketplace

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  🎉 You're Verified!                    [View on OpenSea]       │
│                                                                 │
│  ┌────────────────────┐                                         │
│  │  🎓                │  Student Pass #1234                     │
│  │  STUDENT           │  Verified: Jan 17, 2026                 │
│  │  VERIFIED          │  Domain: ***.edu (hidden)               │
│  │                    │                                         │
│  └────────────────────┘                                         │
│                                                                 │
│  ═══════════════════════════════════════════════════════════   │
│                                                                 │
│  YOUR EXCLUSIVE OFFERS                                          │
│  ─────────────────────                                          │
│                                                                 │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐               │
│  │ Spotify │ │ GitHub  │ │ Notion  │ │ Figma   │               │
│  │ 50% OFF │ │ FREE    │ │ FREE    │ │ FREE    │               │
│  │         │ │ Pro     │ │ Plus    │ │ Edu     │               │
│  │ [Claim] │ │ [Claim] │ │ [Claim] │ │ [Claim] │               │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Pivot Opportunity

The same circuit works for ANY Google Workspace domain:

| Market | Example Domains | Offers |
|--------|-----------------|--------|
| Students | @university.edu, @*.ac.in | Student discounts |
| Enterprises | @google.com, @meta.com | B2B tools, conferences |
| Startups | @ycombinator.com, @techstars.com | Founder perks |

**One product, multiple markets.** The pitch becomes:
> "Private professional verification for Web3"

---

## References

- [StealthNote](https://github.com/saleel/stealthnote) - MIT licensed, our circuit source
- [noir-jwt](https://github.com/saleel/noir-jwt) - JWT verification library
- [Scaffold-ETH 2](https://scaffoldeth.io/) - Our frontend/contract base
