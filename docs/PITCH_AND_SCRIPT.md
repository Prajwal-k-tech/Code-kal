# 🎤 ZeroKlue Pitch & Demo Script

> **Goal**: Explain the problem, solution, and tech magic in < 3 minutes.

---

## ⚡ Elevator Pitch (30 Seconds)

"Hi, I'm [Your Name].

We all love student discounts, but verifying them is a privacy nightmare. Services like **UNiDAYS** and **SheerID** force you to upload ID cards and share personal data that gets stored in centralized databases forever.

Introducing **ZeroKlue**: A trustless, privacy-first verification protocol.

It lets students prove they attend a university using their existing Google account, **without revealing their email address, name, or even which specific university they attend**.

We use **Zero-Knowledge Proofs** to verify Google's cryptographic signature directly in the browser. The result is a soulbound NFT that merchants can check instantly—giving you the discount, while keeping your data 100% private."

---

## 🧪 The "Under the Hood" Explanation (If Judges Ask)

"How do you verify Google login without a backend?"

"Great question. It relies on **OIDC (OpenID Connect)** and **ZK Circuits**.

1.   When you sign in with Google, they sign a **JWT (JSON Web Token)** with their private RSA key.
2.  Usually, you send this token to a backend to verify.
3.  Instead, we feed this token into a **Noir ZK Circuit** running entirely in the user's browser.
4.  The circuit checks two things:
    *   **Signature**: Is this signed by Google? (RSA-SHA256 verification)
    *   **Domain**: does the email end in `.edu`?
5.  The circuit outputs a **Proof** and a **Nullifier** (to prevent double-spending), but **hides** the email address.
6.  We submit this proof to our **Smart Contract**, which verifies it on-chain and mints the NFT.

It's completely trustless—we never see the data, and neither does the blockchain."

---

## 🎬 Live Demo Script (Step-by-Step)

**Setup**: Have `http://localhost:3000` open. Have MetaMask disconnected or ready to connect.

**Step 1: The Hook**
*   "Here is the ZeroKlue dashboard. As you can see, I'm just an anonymous wallet."
*   *(Click Connect Wallet)* → "I connect my wallet."

**Step 2: The Action**
*   "Now I want to get verified. I verify with Google."
*   *(Click 'Verify with Google')* → *(Sign in with your test account)*
*   "I'm signing in with my standard university account."

**Step 3: The Magic (The Wait)**
*   *(While the spinner spins ~30s)*
*   **Say this**: "Right now, your browser is doing heavy cryptography. It's generating a Zero-Knowledge proof. It's proving to the blockchain that I have a valid token from Google, without actually sending the token. Secure, private, client-side."

**Step 4: The Result**
*   "Proof generated!"
*   *(Click 'Confirm Transaction' / Wallet pops up)*
*   "I verify the transaction..."
*   *(Wait for Mint)*
*   "And boom! I verified."
*   *(Show "Verification Complete")*

**Step 5: The Value (Merchant Demo)**
*   "Now, why does this matter?"
*   *(Navigate to `/merchant` or Marketplace)*
*   "If I go to a merchant site, they just check my wallet. 'IsVerified? Yes.' They give me the discount. They don't know my name, email, or usage history. That is true privacy."

---

## 🧠 Judge Q&A Cheat Sheet (Difficult Questions)

**Q: How do you prevent me from minting 100 NFTs with one email?**
**A:** "We use a **Nullifier**. The ZK circuit deterministically hashes the 'Ephemeral Key' linked to the session. Actually, better yet—we use the `nonce` field in the JWT to bind the proof to a specific session key. If you try to replay the same JWT, the contract rejects it. If you get a new JWT, you can re-verify (which we allow for privacy rotation), but merchants can see you're the same wallet if you reuse the address."

**Q: What if Google changes their keys?**
**A:** "Google publishes their public keys at a known endpoint. Our circuit takes the Public Key as a **Public Input**. The smart contract verifies that the key used in the proof matches Google's current active keys."

**Q: Can I use a personal Gmail account?**
**A:** "No. The circuit specifically checks the `hd` (Hosted Domain) claim in the JWT. Personal Gmails don't have this field, so the circuit proof would fail."

**Q: Why not just use zkEmail?**
**A:** "zkEmail is great, but it requires parsing email headers and DKIM signatures, which can be brittle. Since we are targeting students who already use Google Workspace (G-Suite for Education), verifying the OIDC Token directly is cleaner, faster, and standard-compliant."

**Q: Is this deployed?**
**A:** "The demo runs on a local Anvil chain for speed, but the contracts are standard Solidity and deployed Verification Keys. It is compatible with Sepolia, Base, or an Optimism rollup."

---

## ✅ Checklist: Did we meet requirements?

*   [x] **Trustless**: No backend used.
*   [x] **Privacy**: Email never revealed.
*   [x] **Sybil Resistance**: Ephemeral keys + JWT nonce binding.
*   [x] **User Flow**: Connect -> Auth -> Proof -> Mint.
*   [x] **Tech**: Noir (ZK), Next.js, Foundry.

**You are ready to pitch! 🚀**
