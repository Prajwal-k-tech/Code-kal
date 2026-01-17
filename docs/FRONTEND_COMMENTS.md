# Frontend Review - January 17, 2026

## 🎉 Great Work!

The landing page looks amazing! Love the mesh gradient shader and the DecryptedText animation. Really polished look.

---

## ❌ Critical Issues to Fix

### 1. Missing `/verify` Route (BLOCKER)

The "GET VERIFIED" button in `HeroSection` links to `/verify` but **that route doesn't exist**.

**Fix:** Create `app/verify/page.tsx` that uses the `VerificationCard` component.

```tsx
// app/verify/page.tsx
import { VerificationCard } from "~~/components/VerificationCard";
import { Navbar } from "~~/components/Landing/Navbar";

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0b2e] via-[#2a1b3d] to-[#1a0b2e]">
      <Navbar />
      <main className="container mx-auto px-4 pt-32 pb-12">
        <div className="max-w-2xl mx-auto">
          <VerificationCard />
        </div>
      </main>
    </div>
  );
}
```

---

### 2. ProofModal Uses Wrong Imports

**File:** `components/offers/ProofModal.tsx` line 4

```tsx
// ❌ WRONG - these exports don't exist
import { generateProof, formatProofForContract, type ProofProgress } from "~~/lib/noir";

// ✅ CORRECT - use the JWT circuit helper
import { JWTCircuitHelper, type ContractProof } from "~~/lib/circuits/jwt";
```

The `lib/noir/index.ts` just re-exports from `lib/circuits/jwt.ts`, but those old function names don't exist there. The new API is:

```typescript
const proof = await JWTCircuitHelper.generateProof({
  idToken: "...",
  jwtPubkey: {...},
  ephemeralKey: {...},
  domain: "university.edu",
});

// proof.proofHex - the proof bytes
// proof.publicInputs - the 85 public inputs
// proof.nullifier - for duplicate checking
```

Look at `hooks/useStudentVerification.ts` for the correct implementation.

---

### 3. useStudentNFT Hook Has Wrong ABI

**File:** `hooks/scaffold-eth/useStudentNFT.ts`

You're using a hardcoded ABI with `verifications` function, but the ZeroKlue contract uses `students` mapping.

**Fix:** Use `useDeployedContractInfo` to get the actual ABI:

```typescript
import { useDeployedContractInfo } from "./useDeployedContractInfo";

const { data: contractInfo } = useDeployedContractInfo("ZeroKlue");

const { data: balance } = useReadContract({
  address: contractInfo?.address,
  abi: contractInfo?.abi,
  functionName: "balanceOf",
  args: [address],
});
```

---

## ⚠️ Minor Issues

### 4. Features Component Not Used

`components/Landing/Features.tsx` and `components/Landing/Hero.tsx` are created but not used in the main page. The page only uses `HeroSection` from `ui/hero-section-with-smooth-bg-shader.tsx`.

Either:
- Use them (add Features below HeroSection)
- Or delete the unused files

### 5. Navbar Links Go Nowhere

All the navbar links (Product, How It Works, Students, Partners, Docs) point to `#`.

For hackathon demo, at minimum:
- "Docs" should link to the GitHub README
- Consider making other links anchor to sections on the page

---

## ✅ What's Working Well

| Component | Status | Notes |
|-----------|--------|-------|
| `HeroSection` | ✅ | Beautiful shader, great animations |
| `Navbar` | ✅ | Clean, responsive |
| `VerificationCard` | ✅ | Full flow implemented |
| `oauth-callback` | ✅ | Token handling is correct |
| `OfferCard` | ✅ | Locked/unlocked states |
| `offers-data.ts` | ✅ | Good sample data |
| `marketplace/page.tsx` | ✅ | Grid layout works |

---

## 📋 Priority Order

1. **Create `/verify` route** - This is the main flow, must work
2. **Fix ProofModal imports** - Currently won't compile
3. **Fix useStudentNFT hook** - Marketplace won't work without it
4. Test full flow: Landing → Verify → Proof → Mint → Marketplace unlocked

---

## 🔗 Reference Code

Look at these files for how JWT proof generation works:

- `lib/providers/google-oauth.ts` - Gets the JWT from Google
- `lib/circuits/jwt.ts` - Generates the ZK proof
- `hooks/useStudentVerification.ts` - Orchestrates the full flow

All of this is adapted from **[StealthNote](https://github.com/nicholashc/stealthnote)** - MIT licensed.

---

Good luck! The UI is 🔥, just need to wire up the core flow.
