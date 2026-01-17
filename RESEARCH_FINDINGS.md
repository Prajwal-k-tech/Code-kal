# Research Findings: How ZK Identity Projects Actually Work

> **TL;DR**: StealthNote doesn't use OTP. They use **OAuth/OIDC JWT tokens** from Google/Microsoft and verify the JWT signature inside the ZK circuit. This is MUCH more elegant but also MUCH more complex.

> **UPDATE**: StealthNote is **MIT licensed** - we CAN fork and use it! But complexity remains a concern for 24h hackathon.

---

## 🛠️ VS Code Extensions for Noir Development

Install these extensions for Noir development:

```vscode-extensions
noir-lang.vscode-noir
```

This official extension provides:
- Syntax highlighting for `.nr` files
- LSP integration
- Debugger support
- Code snippets
- Keybindings

---

## 🔍 The Three Projects Compared

| Project | Identity Source | Verification Method | Complexity | Our Feasibility |
|---------|----------------|---------------------|------------|-----------------|
| **StealthNote** | Google/Microsoft Workspace | JWT RSA signature verification in ZK | 🔴 Very High | ❌ Too complex for 24h |
| **noir-semaphore** | Pre-registered identity | Merkle tree membership proof | 🟢 Low | ✅ Could adapt |
| **anon-aadhaar** | Indian Aadhaar QR code | RSA signature on QR data | 🔴 Very High | ❌ Too complex for 24h |

---

## 📖 StealthNote Deep Dive: NO OTP NEEDED

### How It Works (The Genius Part)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  StealthNote Flow - NO BACKEND EMAIL VERIFICATION                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. User clicks "Sign in with Google"                                       │
│     └─> Google OAuth popup appears                                          │
│     └─> User authenticates with their @company.com account                  │
│     └─> Google returns a signed JWT (id_token)                              │
│                                                                             │
│  2. The JWT contains:                                                       │
│     {                                                                       │
│       "email": "alice@company.com",                                         │
│       "email_verified": true,                                               │
│       "hd": "company.com",  // <-- Hosted Domain (the key field!)           │
│       "nonce": "12345..."   // <-- User's ephemeral pubkey hash             │
│     }                                                                       │
│     + RSA signature from Google                                             │
│                                                                             │
│  3. The ZK circuit verifies (IN BROWSER, ALL CLIENT-SIDE):                  │
│     ├─ RSA signature is valid (from Google's public key)                    │
│     ├─ email_verified == true                                               │
│     ├─ hd (domain) matches what user claims                                 │
│     └─ nonce matches hash(ephemeral_pubkey, salt, expiry)                   │
│                                                                             │
│  4. Output: ZK proof that says                                              │
│     "I have a valid Google-signed JWT from @company.com"                    │
│     WITHOUT revealing: email, name, or any other JWT claims                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Why This Is Brilliant

1. **No backend needed for email verification** - Google already verified the email
2. **No OTP emails to send** - No Resend, no email infrastructure
3. **Cryptographic proof** - Can't fake a Google-signed JWT
4. **Works for any org** - If they use Google Workspace or Microsoft 365

### Why We CAN'T Use This Approach (For Hackathon)

1. **RSA verification in ZK is EXPENSIVE** - ~500K gates vs our ~10K
2. **JWT parsing in ZK is complex** - They built an entire [noir-jwt](https://github.com/saleel/noir-jwt) library
3. **Partial SHA256 optimization** - They pre-compute hashes outside the circuit
4. **Proving time** - 20-30 seconds even with optimizations
5. **Google Workspace requirement** - Only works for orgs using Google/Microsoft, not all universities

### StealthNote's Key Dependencies

```toml
# Their Nargo.toml
[dependencies]
jwt = { tag = "v0.4.4", git = "https://github.com/saleel/noir-jwt" }
```

The `noir-jwt` library alone is ~1000 lines of Noir code for JWT parsing + RSA verification.

---

## 📖 noir-semaphore Deep Dive: Simple But Different Model

### How It Works

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Semaphore Flow - PRE-REGISTERED MEMBERSHIP                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. SETUP (off-chain, by admin):                                            │
│     ├─ Each member generates: identity = hash(pubkey_x, pubkey_y)           │
│     ├─ Admin collects all identities                                        │
│     └─ Admin builds Merkle tree of all identities                           │
│                                                                             │
│  2. PROVE (by member):                                                      │
│     ├─ Member provides their secret (private key)                           │
│     ├─ Member provides Merkle proof (path to their leaf)                    │
│     └─ Circuit verifies:                                                    │
│         ├─ identity = hash(pubkey) derived from secret                      │
│         ├─ Merkle proof is valid → identity is in tree                      │
│         └─ nullifier = hash(scope, secret) → prevents double-signaling      │
│                                                                             │
│  3. OUTPUT:                                                                 │
│     ├─ merkle_root (public) - which group this is                           │
│     └─ nullifier (public) - prevents same person acting twice               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Why This Doesn't Fit Our Use Case

1. **Requires pre-registration** - Someone needs to manually add students to the Merkle tree
2. **No email verification** - Just proves membership, not student status
3. **Good for voting/signaling** - Not for "prove you're a student"

---

## 📖 anon-aadhaar Deep Dive: Government ID Verification

### How It Works

- User scans their Aadhaar card QR code
- QR contains RSA-signed data from Indian government
- Circuit verifies RSA signature on QR data
- Extracts: age > 18, gender, state, etc.
- Outputs: nullifier (from photo hash)

### Why This Is Relevant To Us

They verify a **government-issued credential** in ZK. But:
- No equivalent for university emails
- Much more complex than our approach

---

## 🎯 What This Means For ZeroKlue

### Option A: Keep OTP Approach (RECOMMENDED FOR HACKATHON)

```
Our Current Approach:
1. User enters email → We verify domain (Hipo API)
2. We send OTP → User enters it
3. We sign credential with EdDSA → User gets signature
4. User generates ZK proof of signature
5. Smart contract verifies proof → Mints NFT

Pros:
✅ Simple circuit (~10K gates)
✅ Fast proving (~15s)
✅ Works for ANY email domain
✅ Achievable in 24 hours

Cons:
❌ Requires backend infrastructure
❌ Need to send emails (Resend free tier)
❌ "Weaker" trust model (we're the issuer, not Google)
```

### Option B: Google OAuth + JWT (FUTURE VERSION)

```
StealthNote Approach:
1. User signs in with Google
2. Google returns signed JWT
3. User generates ZK proof of JWT validity
4. Contract verifies → No NFT even needed, just the proof

Pros:
✅ No backend email infrastructure
✅ Google is the trusted issuer
✅ More "pure" ZK approach

Cons:
❌ Only works for Google Workspace orgs
❌ ~500K gates circuit
❌ 20-30s proving time
❌ Weeks of development needed
```

### Option C: Hybrid (BEST FUTURE PATH)

```
Future ZeroKlue:
- Support BOTH Google OAuth (for Workspace orgs)
- AND OTP fallback (for other universities)
- Same NFT output, different proof circuits
```

---

## 🚀 Recommendation for Hackathon

**KEEP THE OTP APPROACH.**

Here's why:

| Factor | OTP (Ours) | JWT (StealthNote) |
|--------|-----------|-------------------|
| Circuit complexity | ~10K gates | ~500K gates |
| Proving time | ~15s | ~20-30s |
| Development time | 8-12h | 40+ hours |
| Works for any university | ✅ Yes | ❌ Only Google/Microsoft orgs |
| Backend needed | Yes | No |
| Trust model | We sign | Google signs |

**Your university (IIIT Kottayam) might not even use Google Workspace!**

---

## 📚 Key Code References

### StealthNote's Google OAuth Flow
```typescript
// app/lib/providers/google-oauth.ts
const idToken = await signInWithGoogle({
  nonce: ephemeralKey.ephemeralPubkeyHash.toString(),
});

// The nonce binds the JWT to the user's ephemeral key
// This prevents replay attacks
```

### StealthNote's JWT Circuit
```noir
// circuit/src/main.nr
fn main(
    partial_data: BoundedVec<u8, MAX_PARTIAL_DATA_LENGTH>,
    partial_hash: [u32; 8],  // Pre-computed SHA256
    jwt_pubkey_modulus_limbs: pub [u128; 18],  // Google's RSA pubkey
    jwt_signature_limbs: [u128; 18],
    domain: pub BoundedVec<u8, MAX_DOMAIN_LENGTH>,
    ephemeral_pubkey: pub Field,
    // ...
) {
    let jwt = JWT::init_with_partial_hash(...);
    jwt.verify();  // RSA signature check
    
    // Verify nonce matches ephemeral key hash
    assert(nonce_field == ephemeral_pubkey_hash, "invalid nonce");
    
    // Verify domain from email
    // ...
}
```

### noir-semaphore's Simple Circuit
```noir
// packages/circuits/src/main.nr
fn main(
    secret: Field,
    indices: Field,
    paths: [Field; MAX_DEPTH],
    message: pub Field,
    scope: pub Field,
) -> pub (Field, Field) {
    let pk = eddsa_to_pub(secret);
    let identity = hash_2([pk.0, pk.1]);
    let root = calculate_root(identity, indices, paths);
    let nullifier = hash_2([scope, secret]);
    
    (root, nullifier)
}
```

---

## 🏠 Local Development Setup

Since you mentioned Foundry + localhost:

```bash
# Our setup (already done)
zeroklue-app/
├── packages/
│   ├── foundry/          # Local Anvil chain
│   │   └── contracts/
│   │       └── ZeroKlue.sol
│   └── nextjs/           # Frontend
│       └── ...

# To run locally:
cd zeroklue-app
yarn chain        # Starts Anvil on localhost:8545
yarn deploy       # Deploys contracts
yarn start        # Starts Next.js
```

**No CI/CD or hosting needed for demo.** Just:
1. Spin up local Anvil chain
2. Deploy contracts
3. Run frontend
4. Demo on localhost

---

## � NoirJS + Browser Integration (How We'll Generate Proofs)

From the official Noir docs, here's how browser proof generation works:

```typescript
// 1. Install dependencies
// yarn add @noir-lang/noir_js @aztec/bb.js

// 2. Import and setup
import { UltraHonkBackend } from '@aztec/bb.js';
import { Noir } from '@noir-lang/noir_js';
import circuit from './circuit/target/circuit.json';

// 3. Instantiate
const noir = new Noir(circuit);
const backend = new UltraHonkBackend(circuit.bytecode);

// 4. Execute the circuit (compute witness)
const input = { 
  domain_hash: "0x...", 
  signature: [...], 
  public_key: [...],
  nullifier_seed: "0x..."
};
const { witness } = await noir.execute(input);

// 5. Generate proof
const proof = await backend.generateProof(witness);

// 6. Verify proof (optional, usually done on-chain)
const isValid = await backend.verifyProof(proof);
```

---

## 📜 Solidity Verifier Generation

From Noir docs - how to generate the on-chain verifier:

```bash
# 1. Compile the circuit
nargo compile

# 2. Generate verification key (use keccak for Solidity optimization)
bb write_vk -b ./target/circuit.json -o ./target --oracle_hash keccak

# 3. Generate Solidity verifier contract
bb write_solidity_verifier -k ./target/vk -o ./target/Verifier.sol
```

Then in your ZeroKlue.sol:
```solidity
import "./Verifier.sol";

contract ZeroKlue {
    Verifier public verifier;
    
    function mintWithProof(bytes calldata proof, bytes32[] calldata publicInputs) external {
        require(verifier.verify(proof, publicInputs), "Invalid proof");
        // Mint NFT...
    }
}
```

---

## 🦊 MetaMask + Scaffold-ETH Integration

Scaffold-ETH 2 uses wagmi hooks for wallet interaction:

```typescript
import { useAccount, useWriteContract } from "wagmi";
import DeployedContracts from "~~/contracts/deployedContracts";

export const MintStudentNFT = () => {
  const { address } = useAccount(); // Connected MetaMask address
  const { writeContractAsync, isPending } = useWriteContract();

  const handleMint = async (proof: Uint8Array, publicInputs: string[]) => {
    await writeContractAsync({
      address: DeployedContracts[31337].ZeroKlue.address, // localhost chainId
      abi: DeployedContracts[31337].ZeroKlue.abi,
      functionName: "mintWithProof",
      args: [proof, publicInputs],
    });
  };

  return (
    <button onClick={() => handleMint(proof, inputs)} disabled={isPending}>
      {isPending ? "Minting..." : "Mint Student NFT"}
    </button>
  );
};
```

---

## ⚠️ Confidence Assessment: Can We Build This?

### What I'm 100% Confident About:
1. ✅ Noir circuit syntax and structure
2. ✅ NoirJS browser integration pattern
3. ✅ Solidity verifier generation workflow
4. ✅ Scaffold-ETH + MetaMask integration
5. ✅ Local Foundry/Anvil development

### What Needs More Research:
1. ⚠️ **EdDSA library availability** - Need to verify `noir-eddsa` package exists/works
2. ⚠️ **Exact proving time** - Need to benchmark on actual hardware
3. ⚠️ **Circuit input/output format** - Need to test serialization

### What Could Be Risky:
1. 🔴 **OTP → Credential signing** - Our custom backend flow (not proven by others)
2. 🔴 **Version compatibility** - Noir is in beta, APIs change frequently

### Honest Assessment:

**Am I 100% confident?** No, about **80%**.

The pattern is proven (signature verification in ZK is well-documented). What's custom is our OTP → EdDSA flow. That's the part without direct reference implementations.

**Mitigation**: We could simplify to just use a hash commitment instead of EdDSA:
- User gets OTP
- Backend stores `hash(email, OTP, timestamp)` 
- Circuit proves knowledge of preimage that hashes to committed value
- Much simpler, fewer dependencies

---

## 🔗 Reference Implementations Found

| Repo | Stars | What It Does | Useful For |
|------|-------|--------------|------------|
| [noir-lang/noir-examples](https://github.com/noir-lang/noir-examples) | Official | Example circuits | Recursion, basic proofs |
| [socathie/hello-noir](https://github.com/socathie/hello-noir) | ~100 | Noir + Hardhat + Foundry | Solidity verifier integration |
| [porco-rosso-j/safe-recovery-noir](https://github.com/porco-rosso-j/safe-recovery-noir) | - | Safe wallet recovery with Noir | Frontend proof generation |
| [Slokh/anoncast](https://github.com/Slokh/anoncast) | - | Anonymous posting with ZK | Credential verification pattern |
| [gustavovalverde/zentity](https://github.com/gustavovalverde/zentity) | - | Privacy-first KYC | ZK identity verification |

---

## 📋 Summary

| Question | Answer |
|----------|--------|
| Do we need OTP? | **Yes, for hackathon.** StealthNote's approach is too complex. |
| Is StealthNote better? | For their use case, yes. For ours, no - we need to support all universities. |
| What should we steal from them? | Lazy loading pattern, proof generation UX, general architecture. |
| What about noir-semaphore? | Different use case (group membership), but good EdDSA + nullifier reference. |
| Local dev setup? | Already done with Scaffold-ETH. Use Anvil + localhost. |
| Can we build it in 24h? | **80% confident.** Circuit is straightforward, integration is proven. |
| Biggest risk? | EdDSA library compatibility + our custom OTP→credential flow. |

---

## 🎯 Recommended Simplified Approach (Lower Risk)

If EdDSA proves problematic, here's a simpler alternative:

```noir
// Simple commitment-based verification
fn main(
    email_bytes: [u8; 64],       // private: the email
    otp: Field,                   // private: the OTP received
    timestamp: Field,             // private: when OTP was issued
    commitment: pub Field,        // public: hash stored by backend
    nullifier_seed: Field,        // private: random value
    domain_hash: pub Field        // public: university domain hash
) -> pub Field {
    // 1. Verify commitment
    let computed = poseidon2::hash([
        ...email_to_field(email_bytes),
        otp,
        timestamp
    ]);
    assert(computed == commitment);
    
    // 2. Verify email domain matches
    let email_domain = extract_domain(email_bytes);
    assert(hash_domain(email_domain) == domain_hash);
    
    // 3. Generate nullifier
    let nullifier = poseidon2::hash([commitment, nullifier_seed]);
    
    nullifier // Return for on-chain storage
}
```

This removes EdDSA dependency entirely, relies only on Poseidon2 hash (built into Noir stdlib).
