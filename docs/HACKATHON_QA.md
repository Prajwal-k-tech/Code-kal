# Hackathon Q&A Guide

This document prepares you for every question mentors and judges might ask.

---

## Beginner-Friendly Q&A (For Non-Technical Judges)

### "What is a blockchain, and why do you need it?"

**Simple Answer**:
"A blockchain is like a public spreadsheet that everyone can read but no one can cheat on. Once something is written, it can't be erased or changed.

We need it because:
1. **Trust**: Merchants don't have to trust our company. They trust math.
2. **Permanence**: Your student verification can't be deleted if our company goes down.
3. **Openness**: Any app can check your student status without asking our permission."

---

### "What is a zero-knowledge proof? Explain like I'm 5."

**Simple Answer**:
"Imagine you want to prove you know a secret password, but you don't want to tell anyone the password. A zero-knowledge proof is like a magic trick that lets you prove 'I know the password' without ever saying what the password is.

For us: You prove 'I'm a student at a real university' without revealing which university or what your email is. The merchant learns you're a student, but nothing else."

---

### "Where exactly are these 'proofs'? Can I see one?"

**Simple Answer**:
"Yes! When you click 'Verify with Google', your browser does math for about 30 seconds. That math creates a small file - about 2 kilobytes - that's the proof.

That proof file gets sent to the blockchain. You can see it on the block explorer. It looks like a long string of numbers and letters. Even though it's public, it reveals nothing about your identity - that's the 'zero-knowledge' magic."

---

### "How do I know you're not secretly storing my email?"

**Simple Answer**:
"We literally can't. Here's why:

1. You sign in with Google directly - we never see your password
2. Your browser generates the proof - not our server
3. The proof only contains your 'ephemeral public key' and domain name (like 'mit.edu')
4. Your actual email (like 'alice@mit.edu') NEVER leaves your browser
5. The blockchain only records: 'This wallet verified with an ephemeral key from some .edu domain'

Even if we wanted to spy on you, the architecture prevents it. It's privacy by math, not privacy by policy."

---

### "What happens if I lose my wallet?"

**Simple Answer**:
"Same thing that happens if you lose your keys - you need a backup. In production, we'd add social recovery (trusted friends can help you recover). For this hackathon demo, the answer is: don't lose it, or re-verify with a new wallet."

---

### "Can I sell my student verification to someone else?"

**Simple Answer**:
"No. It's 'soulbound' - fancy word meaning it can't be transferred. The verification is permanently attached to YOUR wallet. You can't send it to another wallet, sell it on OpenSea, or give it to a friend."

---

### "Why would merchants use this instead of just checking .edu emails?"

**Simple Answer**:
"Three problems with email checks:
1. Alumni keep .edu emails forever - not actually students
2. Staff have university emails - not students either
3. Merchants store the email - creates data breach liability

With us, merchants learn ONLY that you're verified. No email stored. No lawsuit risk."

---

## Competitor Analysis

### SheerID (The 800lb Gorilla)

**What they do**: Enterprise student verification via database matching  
**Founded**: 2011  
**Funding**: $64M  
**How they verify**: National Student Clearinghouse + university partnerships

**Their Strengths**:
- ✅ Extremely accurate (database matching)
- ✅ Works for non-crypto users
- ✅ Instant verification
- ✅ 1000s of university partnerships
- ✅ Proven at scale

**Their Weaknesses**:
- ❌ Expensive ($0.50-2.00 per verification)
- ❌ Collects full PII (data liability for merchants)
- ❌ Must reverify for each merchant
- ❌ Web2 API only (doesn't work in Web3)
- ❌ Centralized (single point of failure)

**Our Position**: "We're not competing with SheerID for mass market. We're building for markets they CAN'T serve - Web3-native products that need on-chain, reusable, privacy-preserving credentials."

---

### UNiDAYS

**What they do**: Student discount aggregation platform  
**Business model**: Marketplace + verification

**Their Strengths**:
- ✅ Large merchant network
- ✅ Consumer-facing brand
- ✅ Mobile app with good UX

**Their Weaknesses**:
- ❌ Centralized platform (merchants must join their network)
- ❌ Takes commission from merchants
- ❌ Still collects student PII

**Our Position**: "UNiDAYS is a marketplace. We're infrastructure. They could actually use ZeroKlue for verification to reduce their own liability."

---

### Student Beans

**What they do**: Similar to UNiDAYS - discount aggregation  
**Market**: UK-focused

**Our Position**: Same as UNiDAYS - they're B2C marketplace, we're B2B infrastructure.

---

### Sismo (Closest ZK Competitor)

**What they do**: ZK identity aggregation badges  
**Founded**: 2022  
**Focus**: Proving on-chain activity (GitHub, Twitter, token holdings)

**Why we're different**:
- ❌ They don't do student verification
- ❌ They focus on on-chain reputation, not off-chain credentials
- ✅ We could actually use Sismo's infra as an integration partner

**Our Position**: "Sismo is focused on on-chain reputation. We're focused on bridging off-chain credentials (student status) to on-chain verification. Different problems."

---

### Gitcoin Passport

**What they do**: Decentralized identity verification for sybil resistance  
**Focus**: Proving uniqueness and humanity

**Why we're different**:
- They verify "you're unique/human"
- We verify "you're a student"
- Different attestations, complementary use cases

**Our Position**: "Gitcoin Passport could be an integration partner. They prove uniqueness, we prove student status. Together = sybil-resistant student communities."

---

### Does This Already Exist?

**Short Answer**: No, not exactly.

**Longer Answer**:
- ✅ ZK identity platforms exist (Sismo, Polygon ID, Privado ID)
- ✅ Student verification exists (SheerID, UNiDAYS)
- ❌ ZK student verification with on-chain NFT credentials doesn't exist
- ❌ Reusable, privacy-preserving student credentials don't exist

We're combining two existing markets (ZK identity + student verification) in a novel way.

---

## Mentor Round Questions

### "Why blockchain? You could do this with a centralized database."

**Answer**: 
"Three structural reasons:

1. **Trust**: Merchants don't trust our database. They trust Ethereum's math. With centralized verification, they have to trust we're not lying. With on-chain verification, they trust cryptography.

2. **Composability**: The NFT credential works across ANY application without our permission or API. If I go out of business tomorrow, student credentials still work. That's only possible with blockchain.

3. **Incentive alignment**: In a centralized model, we're incentivized to collect more data (it's valuable). In a decentralized model, we CAN'T collect more data - it's enforced by cryptography. That's a feature, not a bug.

Plus, once you need to verify a proof, blockchain gives you a neutral, tamper-proof ledger. The alternative is merchants calling our API - which is just SheerID 2.0."

---

### "Why would students trust you with their email?"

**Answer**:
"Great question. We DON'T want you to trust us - that's the whole point.

Here's what happens:
1. You sign in with Google directly (OAuth popup)
2. Google gives YOUR BROWSER a signed JWT token
3. Your browser generates a ZK proof that the JWT is valid
4. That proof is sent to the blockchain - not to us
5. We never see your email, your JWT, or anything personal

The key insight: Google is the signer, not us. We're just providing the cryptographic tools to make Google's signature private.

Compare this to SheerID: they store your email, name, DOB indefinitely and share it with every merchant. 

With us, we literally can't identify you. We never touched your credentials."

---

### "How do you prevent fake email domains?"

**Answer**:
"Google Workspace only issues JWTs for verified organization domains. You can't get a JWT claiming you're @stanford.edu unless Stanford has actually set up Google Workspace and given you an account.

Additionally, we maintain an allowlist of approved domains. For the hackathon:
```javascript
const APPROVED_DOMAINS = ['iiitkottayam.ac.in'];
```

In production, we'd use curated lists like GitHub Education's 10,000+ verified university domains.

The key insight: Google already verified the domain is real. We just check it's on our approved list."

---

### "What if someone graduates but keeps their email?"

**Answer**:
"You're right - that's a weakness of email-based verification. We've actually engineered a solution:

1. **Timestamp-based verification**: Our NFT stores when it was minted. Merchants can check: 'Was this minted in the last 6/12 months?' This lets them enforce their own freshness policies.

```solidity
// Merchant checks
if (block.timestamp - nft.verifiedAt > 365 days) {
    // Ask to re-verify
}
```

2. **Flexible policies per merchant**: 
   - Spotify: "Must be verified within last 12 months" (strict)
   - NFT project: "Was a student at some point" (relaxed)
   - DAO: "Verified within 6 months" (medium)

3. **Students can re-verify anytime**: If your verification is old, just prove again with your current email. Takes 30 seconds, refreshes the timestamp.

4. **Future: University issuer integration**: When universities run their own ZeroKlue issuers (integrated with student information systems), they only issue to currently-enrolled students. Then we get SheerID-level accuracy with ZK privacy.

The key insight: **Let merchants choose their own trust threshold**. Some care about 'current student,' others just want 'student audience.' Our system supports both."

---

### "15 seconds for proof generation is too slow. Users will bounce."

**Answer**:
"You're absolutely right for consumer apps. Three things:

1. **For hackathon**: We're browser-proving to show the ZK works end-to-end. Judges need to see the full flow.

2. **For production**: We'd implement delegated proving - users submit their credential, we generate the proof in <2 seconds on a server with GPU acceleration, they verify it on-chain. This is how Worldcoin and other ZK apps scale.

3. **The 15-second wait happens ONCE**: After that, every merchant just checks your NFT - which is instant and free. Compare that to SheerID where you reverify (and wait) for every single merchant.

So it's 15 seconds once vs 30 seconds 5-10 times per year. Our total friction is lower."

---

### "Only crypto people have wallets. Your market is tiny."

**Answer**:
"Correct today. That's why we're targeting crypto-native use cases FIRST:

**Year 1 Target Market** (already have wallets):
- NFT projects doing student airdrops
- Crypto DAOs with student memberships  
- DeFi protocols offering student rates
- University crypto clubs

These users already have wallets. They NEED on-chain student verification. SheerID doesn't work for them (Web2 API).

**Year 2-3: Wallet Adoption Curve**:
As embedded wallets (Privy, Dynamic) and account abstraction (ERC-4337) mature, students can get wallets via social login. Then we expand to mainstream.

We're like Stripe in 2011. Stripe didn't wait for everyone to be online - they built for online businesses and grew as internet adoption grew. We're building for Web3 businesses and will grow as wallet adoption grows.

The bet: In 3-5 years, having an Ethereum address is as common as having an email."

---

### "How do you make money?"

**Answer**:
"Three revenue models, in order:

**Phase 1 (Hackathon → Month 6)**: Free
- Focus on proving product-market fit
- Get crypto communities using it

**Phase 2 (Month 6-12)**: Freemium
- Basic verification: Free
- Premium features: $0.05/verification
  - Faster delegated proving
  - Custom branding
  - Analytics dashboard
  - Multi-tenant management

**Phase 3 (Year 2+)**: Protocol Fees
- 1% fee on smart contract verifications (taken from merchant)
- Still 95% cheaper than SheerID
- Revenue distributed to:
  - Protocol treasury (40%)
  - University issuers (30%)  
  - Token holders (30%)

The key: We're infrastructure. Our margin is cost of proof generation (~$0.001) vs price ($0.05). That's 50x margin vs SheerID's ~3x margin."

---

### "What's your moat? Can't anyone copy this?"

**Answer**:
"Great question. Our moat is NOT the technology (ZK is open source). Our moat is:

1. **Network Effects**: More universities → more students → more merchants → more universities. Classic two-sided network.

2. **Domain Allowlist**: We'll have the most comprehensive, curated list of valid university domains. That's data, not code.

3. **Trust/Brand**: Students will trust one ZK identity platform. Being first with good security builds trust that's hard to displace.

4. **Smart Contract Standard**: If our verification format becomes the standard that merchants check, we have lock-in similar to how ERC-20 is the token standard.

But honestly? We're built on StealthNote's open-source circuit. If someone copies us and does it better, that's fine. The WORLD benefits from privacy-preserving identity infrastructure. We just want to be the ones who build it first and best."

---

### "What exactly did you take from StealthNote?"

**Answer**:
"StealthNote is an MIT-licensed project for anonymous corporate messaging. We adapted:

1. **The Noir circuit** (`circuit/src/main.nr`): Verifies Google JWT RSA signatures inside a ZK proof
2. **The proof generation code** (`lib/circuits/jwt.ts`): JavaScript that calls the circuit and generates proofs
3. **The OAuth helper** (`lib/providers/google-oauth.ts`): Google sign-in integration

What we built fresh:
1. **ZeroKlue.sol**: On-chain verification registry with nullifier tracking
2. **HonkVerifier.sol**: Generated Solidity verifier for the circuit
3. **Merchant demo**: Shows how third parties can check verification status
4. **Domain filtering**: Restrict to specific university domains

We're transparent about this. StealthNote is production-tested code that solves the hardest part (ZK JWT verification). We're applying it to a new use case: portable student credentials."

---

### "Why Noir? Why not Circom or another ZK framework?"

**Answer**:
"We chose Noir for three reasons:

1. **Developer Experience**: Noir syntax is close to Rust/JavaScript. Much easier to read and audit than Circom. For identity/security, code readability matters.

2. **Barretenberg Backend**: Ultra-fast proving with UltraPlonk. We tested both - Barretenberg was 2-3x faster than Circom + Groth16 for our circuit.

3. **Ecosystem Momentum**: Aztec is investing heavily in Noir. Active development, good tooling (VS Code extension, debugger), growing community.

That said, we're backend-agnostic. If a better ZK framework emerges, we migrate. The value is in the product, not the tech stack."

---

### "What about privacy regulations? GDPR, CCPA?"

**Answer**:
"This is actually our STRONGEST advantage:

**GDPR Compliance**:
- Article 5(1)(c): Data minimization - collect only necessary data
- Article 25: Privacy by design
- With ZeroKlue, merchants collect ZERO PII → automatically compliant

**CCPA Compliance**:
- Users have right to know what data is collected
- With ZeroKlue, the answer is: None → automatically compliant

**Our pitch to merchants**: 'Verify students without touching PII. Zero GDPR risk. Zero data breach liability. Zero right-to-deletion requests.'

In fact, EU merchants are our BEST early adopters. They're legally required to minimize data collection. We make that possible."

---

### "How do you prevent Sybil attacks? One person creating 100 wallets?"

**Answer**:
"The nullifier prevents this cryptographically:

1. Each student email generates a unique nullifier_seed during verification
2. The nullifier is `poseidon_hash(nullifier_seed)`
3. Smart contract stores: `usedNullifiers[nullifier] = true`
4. If you try to mint again with same credential → nullifier collision → transaction reverts

So you CAN create 100 wallets, but you can only mint ONE student NFT across all of them.

To get multiple NFTs, you'd need multiple valid university emails. If you have those, you've earned them (you're enrolled at multiple universities or you hacked a university email server - much harder than hacking our system).

This is cryptographic sybil resistance, not trust-based."

---

### "What if your signing key gets compromised?"

**Answer**:
"We don't HAVE a signing key - that's the beauty of this architecture.

Google signs the JWT. We just verify their signature inside a ZK proof. Google's key management is their problem (and they're very good at it).

For the nullifier system:
- Even if someone learned the circuit, they can't fake proofs without valid Google JWTs
- The only attack is if Google's RSA private key gets compromised, which would be a global security incident affecting all Google services

This is actually MORE secure than having our own issuer key. We've removed ourselves as a point of failure."

---

### "Why would merchants integrate this instead of SheerID?"

**Answer**:
"They wouldn't - today. SheerID has 15 years of enterprise sales, compliance certifications, insurance. We're not competing with them for Walmart or Best Buy.

Our target merchants are:

**Category 1: Web3-Native** (can't use SheerID)
- NFT marketplaces (OpenSea, Blur)
- DeFi protocols (Aave, Uniswap education initiatives)
- DAO tooling (Snapshot, Guild.xyz)
- Crypto commerce (BitPay, Coinbase Commerce)

**Category 2: Compliance-Conscious** (don't want data liability)
- EU startups (GDPR-strict)
- Privacy-focused brands (Signal, Proton)
- Decentralized platforms (Lens Protocol, Farcaster)

**Category 3: Cost-Conscious** (indie devs/startups)
- Student discount costs $0.01 not $1.00
- Can afford to offer discounts that they couldn't before

The wedge is: **We serve markets SheerID CAN'T serve.** Then as wallet adoption grows, we expand."

---

## The Tough Questions (Don't Dodge These)

### "Isn't this just privacy theater? Google still knows who you are."

**Answer**:
"Fair. Let me be precise about what we protect and what we don't:

**What ZeroKlue DOESN'T hide**:
- Your wallet address is public
- Your transaction history is public
- If Google correlates your wallet to your Google account (via cookies, IP, browser fingerprinting), they can link you

**What ZeroKlue DOES hide**:
- MERCHANT A doesn't know your email (only that you're verified)
- MERCHANT B doesn't know you're the same student as Merchant A
- Even we (ZeroKlue) can't link your proof back to your email after issuance

So it's not perfect privacy from GOOGLE. It's privacy from MERCHANTS and AGGREGATION TRACKING.

That's still a massive improvement over SheerID where every merchant gets your full PII and can cross-reference it."

---

### "This seems complex. Why not just use email verification like everyone else?"

**Answer**:
"Some merchants do just check .edu emails. Here's why that's insufficient:

**Problem 1**: Alumni keep emails for life → not accurate
**Problem 2**: Staff have university emails → not students  
**Problem 3**: No sybil resistance → one email, infinite accounts
**Problem 4**: Merchants still store the email → data liability

With ZeroKlue:
- Nullifier prevents reuse (sybil resistance)
- Email is never stored by merchant (no liability)
- Cryptographic binding to wallet (can't share)
- Upgradable to university SSO for accuracy

We're not just checking emails. We're building reusable, privacy-preserving, sybil-resistant identity infrastructure."

---

### "Be honest: will this actually get adopted?"

**Answer**:
"Honest answer: I don't know. Here's what needs to go right:

**Technical**: ✅ The cryptography works (we're proving this today)

**Adoption**: ⚠️ Three hurdles
1. Students need wallets → Depends on embedded wallet adoption
2. Merchants need integration → Depends on finding PMF in Web3 
3. Universities need partnerships → Takes years

**Realistic Path**:
- **Hackathon → Month 3**: Prove it works with student crypto clubs
- **Month 3-6**: Get 3-5 Web3 merchants integrated (NFT projects, DAOs)
- **Month 6-12**: If we see 1000+ students using it, raise seed round
- **Year 2**: If wallet adoption grows, expand to mainstream

**Failure modes**: Wallet adoption stalls, no Web3 merchant demand, students don't care.

**Success mode**: We become THE identity standard for student verification in Web3, then ride wallet adoption to mainstream.

It's a bet on the future of identity infrastructure. Could fail. But if it works, it's huge."

---

## Quick-Fire Responses

| Question | Answer |
|----------|--------|
| "How many universities support this?" | "IIIT Kottayam for demo. Production launch with 50+ .ac.in/.edu domains." |
| "What's your revenue?" | "Zero. It's a hackathon project. Revenue model is protocol fees post-PMF." |
| "Why should students trust you?" | "They don't need to. Credentials are client-side. Proofs are zero-knowledge. We CAN'T access their data." |
| "What if I lose my wallet?" | "Same as losing your keys. We'll add social recovery in production." |
| "Can I transfer my student NFT?" | "No. It's soulbound (non-transferable). Can't sell or share." |
| "Why Ethereum? Why not Solana/Polygon?" | "Currently Holesky. Will deploy to Arbitrum/Base for low gas. Chain-agnostic architecture." |
| "What stops someone from creating fake university domains?" | "We maintain curated allowlist. Can't verify from random domains." |
| "Do universities know about this?" | "No. We verify email ownership, not university endorsement. Future: direct partnerships." |

---

## If You Get Stuck

**Fallback Responses**:

1. "That's a great question. Our MVP focuses on [X]. That feature would be a great addition post-hackathon."

2. "We're aware that's a limitation. Our bet is [explain tradeoff]. If we're wrong, we pivot."

3. "Honestly, we don't know yet. That's something we'd test with users in beta."

**Things NOT to say**:
- ❌ "Blockchain fixes everything"
- ❌ "This will replace all identity verification"
- ❌ "Privacy is more important than UX"
- ❌ "Web3 is the future so this will work"

**Things TO say**:
- ✅ "We're building infrastructure for a market that doesn't have a solution today"
- ✅ "There are tradeoffs. Here's why we chose this path"
- ✅ "We're not replacing SheerID. We're serving different markets"
- ✅ "This is a bet on wallet adoption. Could fail. But if it works, it's big"

---

## Remember

**You're not selling a finished product. You're selling:**
1. A team that understands the problem deeply
2. A working technical demo that proves it's possible  
3. A vision for where identity infrastructure needs to go
4. A realistic path from hackathon to startup

Be confident. Be honest. Be excited.

Good luck! 🚀
