# ZeroKlue Technical Decisions

**Version**: 2.0  
**Last Updated**: January 17, 2026

---

## Decision Log

This document captures the key technical decisions made during ZeroKlue development, the alternatives considered, and the rationale behind each choice.

---

## Decision 1: Fork StealthNote Instead of OTP-based Approach

### Context
Original plan was to verify students via:
1. User enters .edu email
2. Backend sends OTP
3. User enters OTP
4. Backend verifies → signs attestation
5. ZK proof generated from attestation

### Problem Identified
**We would be the trusted party.**

If users trust us to verify OTPs correctly, they might as well trust us to say "this person is a student." The ZK layer only adds:
- Privacy from blockchain observers
- Some tamper-resistance

But it doesn't provide **true trustlessness**.

### Alternative: StealthNote Approach
StealthNote uses Google OAuth:
1. User signs in with Google
2. Google returns signed JWT
3. JWT contains `email_verified: true`, `hd: "university.edu"`
4. ZK circuit verifies RSA signature from Google's public key
5. **Google is the trusted party, not us**

### Decision
**Fork StealthNote's circuit and proof generation.**

**Rationale:**
- Google is already trusted by universities for email
- Google's security is orders of magnitude better than ours
- JWT signatures are cryptographically verifiable
- StealthNote has proven this works (MIT licensed)

### Trade-offs
| Factor | OTP Approach | StealthNote Fork |
|--------|--------------|------------------|
| Trustlessness | ❌ We are trusted | ✅ Google is trusted |
| Backend needed | ✅ Yes (OTP service) | ❌ None |
| Complexity | Lower | Higher (JWT parsing) |
| Coverage | Any email | Google Workspace only |
| Time to build | 2-3 days | 1 day (porting) |

---

## Decision 2: Keep Scaffold-ETH 2 + Port StealthNote Circuit

### Context
After deciding to use StealthNote's approach, we had options:
1. Fork entire StealthNote repo, add wallet integration
2. Start fresh with StealthNote's circuit
3. **Hybrid**: Keep our Scaffold-ETH base, port StealthNote's circuit

### Decision
**Hybrid approach: Scaffold-ETH 2 base + StealthNote circuit**

### Rationale
StealthNote lacks:
- Wallet connection
- Smart contract interaction
- NFT minting
- On-chain verification

Scaffold-ETH already has:
- RainbowKit/wagmi wallet integration
- Foundry contract deployment
- Contract interaction hooks
- Responsive UI with TailwindCSS

By porting only what we need (circuit + OAuth helpers), we get the best of both.

### What We Port
| From StealthNote | To Our Project |
|------------------|----------------|
| `circuit/src/main.nr` | `packages/circuits/src/main.nr` |
| `circuit/Nargo.toml` | `packages/circuits/Nargo.toml` |
| `app/lib/providers/google-oauth.ts` | `packages/nextjs/lib/google-oauth.ts` |
| `app/lib/circuits/jwt.ts` | `packages/nextjs/lib/circuits/jwt.ts` |
| `app/lib/circuits/ephemeral-key.ts` | `packages/nextjs/lib/circuits/ephemeral-key.ts` |

### What We Keep (Scaffold-ETH)
- `packages/foundry/` - Contract deployment
- `packages/nextjs/` - Base frontend structure
- `wagmi` + `viem` - Contract interaction
- `RainbowKit` - Wallet connection

---

## Decision 3: Soulbound NFT vs. Simple Mapping

### Options
1. **Simple mapping**: `mapping(address => bool) public isStudent`
2. **ERC-721 NFT**: Full NFT with metadata, ownership, etc.
3. **Soulbound NFT**: ERC-721 that can't be transferred

### Decision
**Soulbound ERC-721 NFT**

### Rationale
| Feature | Mapping | Standard NFT | Soulbound NFT |
|---------|---------|--------------|---------------|
| Query verified status | ✅ | ✅ | ✅ |
| Store metadata | ❌ | ✅ | ✅ |
| Wallet displays it | ❌ | ✅ | ✅ |
| User can sell it | N/A | ✅ ❌ | ❌ ✅ |
| OpenSea/marketplaces | ❌ | ✅ | ✅ (view only) |
| Gas cost | Lower | Higher | Higher |

Soulbound prevents abuse (can't sell student status) while still appearing in wallets and being queryable by other contracts.

---

## Decision 4: Local Chain First (Anvil)

### Context
For a hackathon demo, we need to balance:
- Speed of iteration
- Realistic demo
- Gas costs

### Options
1. Mainnet - Real but expensive
2. Testnet (Sepolia) - Real network, free faucet
3. Local Anvil - Instant, free, controlled

### Decision
**Anvil for development and demo, Sepolia as stretch goal**

### Rationale
- Anvil is instant (no waiting for blocks)
- No faucet issues (unlimited ETH)
- Still validates entire flow
- Can switch to Sepolia with one config change

### Configuration
```typescript
// scaffold.config.ts
targetNetworks: [chains.anvil], // or chains.sepolia for testnet
```

---

## Decision 5: Domain Hash as Public Input

### Context
The ZK proof needs to prove "user has valid JWT from @university.edu" without revealing which university specifically to the contract.

### Options
1. Reveal full domain → No privacy
2. Reveal domain hash → Verifiable but private
3. Reveal nothing → No university-specific logic possible

### Decision
**Reveal domain hash as public input**

### Rationale
- Partners can verify proof came from their domain
- Users can't fake being from a different university
- Actual domain name stays private on-chain
- Off-chain, partners can check `keccak256("university.edu") == domainHash`

### Implementation
```solidity
// In ZeroKlue.sol
mapping(uint256 => bytes32) public tokenDomainHash;

// Partner verification (off-chain)
const expectedHash = keccak256(toUtf8Bytes("university.edu"));
const matches = expectedHash === tokenDomainHash;
```

---

## Decision 6: Ephemeral Public Key for Sybil Resistance

### Context
Users shouldn't be able to use the same proof multiple times, but we also want to allow privacy rotation (re-verification with new keys).

### Approach (StealthNote Design)
An **ephemeral public key** is generated per verification:
- User generates a random ed25519 keypair
- Public key is committed to in the proof
- Same ephemeral key cannot be used twice on-chain

This differs from traditional nullifiers because:
- Users CAN re-verify with a new ephemeral key (privacy rotation)
- We prevent the same proof from being replayed

### Implementation
```noir
// In StealthNote circuit (public outputs)
ephemeral_pubkey: Field,           // User's ephemeral public key
ephemeral_pubkey_expiry: Field,    // When the key expires (circuit enforces this)
```

```solidity
// In ZeroKlue contract
mapping(bytes32 => bool) public usedEphemeralKeys;

function verifyAndMint(bytes calldata proof, bytes32[] calldata publicInputs) external {
    bytes32 ephemeralPubkey = publicInputs[83]; // Index 83 in StealthNote layout
    require(!usedEphemeralKeys[ephemeralPubkey], "Ephemeral key already used");
    usedEphemeralKeys[ephemeralPubkey] = true;
    // ...
}
```

### Trade-off
A user can re-verify from the same Google account with a new ephemeral key. This updates their verification timestamp but doesn't increase totalVerified count (prevents gaming).

---

## Decision 7: Client-Side Proof Generation

### Context
ZK proof generation takes 20-40 seconds on modern hardware.

### Options
1. **Client-side**: User's browser generates proof
2. **Server-side**: Our server generates proof (needs user's JWT!)
3. **Proving service**: Third-party generates proof

### Decision
**Client-side only (browser)**

### Rationale
- **Privacy**: JWT never leaves user's browser
- **Trustless**: We never see user's credentials
- **Security**: No server to hack
- **Scalability**: Users' devices are distributed compute

### Trade-off
- 20-40 second wait for proof generation
- Bad on low-end devices
- WebAssembly support required

### Mitigation
- Show progress indicator with expected time
- Use web workers to not block UI
- Warn users on mobile (suggest desktop)

---

## Decision 8: noir-jwt Library for JWT Verification

### Context
Need to verify Google's JWT signature inside a ZK circuit.

### Options
1. Write RSA verification from scratch
2. Use noir-jwt library (by Saleel, StealthNote author)
3. Use circom-compat and port circom-jwt

### Decision
**Use noir-jwt v0.4.4**

### Rationale
- Written by StealthNote author
- Already integrated with Google OAuth
- Actively maintained
- Handles JWT parsing, RSA-SHA256, etc.
- MIT licensed

### Dependency
```toml
[dependencies]
jwt = { tag = "v0.4.4", git = "https://github.com/saleel/noir-jwt" }
```

---

## Decision 9: UltraHonk vs. UltraPlonk for Verification

### Context
Barretenberg supports multiple proof systems for Solidity verification.

### Options
1. **UltraPlonk**: Older, more tested
2. **UltraHonk**: Newer, faster verification on-chain

### Decision
**UltraHonk** (default in recent bb.js)

### Rationale
- Lower gas costs (~200-300K vs 400K+)
- Same security guarantees
- Default in current Barretenberg
- StealthNote examples use it

---

## Decision 10: Google Workspace Limitation

### Acknowledged Limitation
Our approach only works for:
- Universities using Google Workspace (most do)
- Companies using Google Workspace

**Does NOT work for:**
- Universities with custom email systems
- Outlook/Microsoft 365 domains

### Mitigation Ideas (Future)
1. Add Microsoft OAuth path (similar approach, different JWT format)
2. Fall back to OTP for non-Google domains
3. Partner with specific universities for custom integration

### For Hackathon
Scope to Google Workspace only. Covers 80%+ of universities.

---

## Summary Table

| Decision | Choice | Key Reason |
|----------|--------|------------|
| Core approach | Fork StealthNote | True trustlessness |
| Stack | Scaffold-ETH + StealthNote | Best of both |
| Token | Soulbound NFT | Prevents resale |
| Network | Anvil first | Speed, free |
| Domain privacy | Hash as public | Verifiable + private |
| Sybil resistance | Ephemeral pubkey | One proof per key, allows re-verification |
| Proof generation | Client-side | Privacy |
| JWT library | noir-jwt | Proven, maintained |
| Proof system | UltraHonk | Lower gas |
| OAuth scope | Google only | 80% coverage, complexity |

---

## Open Questions

1. **Re-verification**: If student graduates, can we invalidate their NFT?
   - Possible: Add expiration timestamp
   - Complex: Requires oracle for graduation status

2. **Multiple wallets**: What if student wants to verify on new wallet?
   - Supported: Student can re-verify with new ephemeral key on any wallet
   - Each wallet gets its own verification record

3. **Partner integration**: How do partners verify domain hash?
   - MVP: Off-chain, we provide lookup
   - Future: On-chain registry of domain hashes

---

*Last updated by team after StealthNote research phase.*
