# Backend Ready for Demo - Session Summary

**Date**: January 17, 2025  
**Status**: ✅ All contracts and tests passing

---

## What Was Fixed

### 1. Critical Bug: Nullifier → Ephemeral Public Key

The ZeroKlue.sol contract was using "nullifier" terminology, but **StealthNote's circuit doesn't have a nullifier**. It uses `ephemeral_pubkey` for sybil resistance instead.

**Files Changed:**
- [ZeroKlue.sol](../zeroklue-app/packages/foundry/contracts/ZeroKlue.sol) - Complete rewrite of sybil resistance logic
- [jwt.ts](../zeroklue-app/packages/nextjs/lib/circuits/jwt.ts) - Updated interface and index

**Key Insight from StealthNote Blog:**
> The circuit uses an ephemeral public key that the user generates locally. This key is committed to in the proof and can only be used once on-chain. Unlike nullifiers, users CAN re-verify with a new ephemeral key for privacy rotation.

### 2. Contract Tests Created

Created comprehensive test suite at [ZeroKlue.t.sol](../zeroklue-app/packages/foundry/test/ZeroKlue.t.sol):

```
✅ 19 tests passing
- testFuzz_EphemeralKeyUniqueness
- test_BalanceOf
- test_GetVerification_NotVerified
- test_IsExpiringSoon
- test_IsRecentlyVerified_*
- test_MultipleUsers
- test_Reverification_UpdatesTimestamp
- test_RevokeVerification_*
- test_TransferFrom_Reverts (soulbound)
- test_VerifyAndMint_*
```

### 3. Foundry Config Updated

Added `code_size_limit = 50000` to [foundry.toml](../zeroklue-app/packages/foundry/foundry.toml) because HonkVerifier is ~30KB (above the standard 24KB limit). This is normal for ZK verifier contracts.

### 4. Documentation Updated

Replaced all "nullifier" references with "ephemeral_pubkey" in:
- [README.md](../README.md)
- [PITCH.md](./PITCH.md)
- [TECHNICAL_DECISIONS.md](./TECHNICAL_DECISIONS.md)
- [QUICKSTART.md](./QUICKSTART.md)
- [FRONTEND_COMMENTS.md](./FRONTEND_COMMENTS.md)

---

## Public Inputs Layout (IMPORTANT)

The StealthNote circuit has **85 public inputs**:

| Index | Field | Count | Description |
|-------|-------|-------|-------------|
| 0-17 | `jwt_pubkey_modulus_limbs` | 18 | Google's RSA public key |
| 18-81 | `domain.storage` | 64 | Verified domain bytes |
| 82 | `domain.len` | 1 | Domain string length |
| **83** | **`ephemeral_pubkey`** | 1 | User's ephemeral key (sybil resistance) |
| 84 | `ephemeral_pubkey_expiry` | 1 | When the key expires |

**Key Constants in ZeroKlue.sol:**
```solidity
uint256 public constant NUM_PUBLIC_INPUTS = 85;
uint256 private constant IDX_EPHEMERAL_PUBKEY = 83;
uint256 private constant IDX_EPHEMERAL_EXPIRY = 84;
```

---

## Local Demo Commands

```bash
# Terminal 1: Start Anvil (with large contract support)
cd zeroklue-app/packages/foundry
anvil --code-size-limit 50000

# Terminal 2: Deploy contracts
cd zeroklue-app/packages/foundry
forge script script/DeployZeroKlue.s.sol --rpc-url http://localhost:8545 --broadcast \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# Terminal 3: Start frontend
cd zeroklue-app/packages/nextjs
yarn dev
```

Contract addresses (local):
- HonkVerifier: `0x5FbDB2315678afecb367f032d93F642f64180aa3`
- ZeroKlue: `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512`

---

## For Frontend Team

The contract API is now:

```typescript
// Proof result from jwt.ts
interface ContractProof {
  proofHex: `0x${string}`;          // Proof bytes
  publicInputs: `0x${string}`[];    // 85 bytes32 values
  ephemeralPubkey: `0x${string}`;   // For logging/debugging
}

// Contract call
await zeroKlue.verifyAndMint(proof.proofHex, proof.publicInputs);
```

**Merchant API:**
```solidity
// Basic check
zeroKlue.isVerified(wallet) → bool

// Time-based check (recommended)
zeroKlue.isRecentlyVerified(wallet, 365 days) → bool

// Full details
zeroKlue.getVerification(wallet) → (verifiedAt, ephemeralPubkey, age)
```

---

## Still Pending (Frontend)

1. Create `/verify` route using VerificationCard
2. Fix ProofModal imports (see FRONTEND_COMMENTS.md)
3. Fix useStudentNFT hook to use deployed contract
4. Test full flow: Landing → Verify → Proof → Mint → Marketplace

---

## Circuit Files Location

```
zeroklue-app/packages/nextjs/public/circuits/
├── circuit.json        # Compiled Noir circuit (1.3MB)
├── circuit-vkey.json   # Verification key
├── vk                  # Raw vkey file
└── vk_binary/          # Binary vkey components
```

These are loaded by `lib/circuits/jwt.ts` at runtime.

---

**Everything but frontend is ready for live demo! 🚀**
