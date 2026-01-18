# 👻 What is a Soulbound NFT? (SBT)

> "Soulbound tokens (SBTs) are non-transferable NFTs representing a person's identity and achievements." — *Vitalik Buterin*

## The ELI5 (Explain Like I'm 5)
Imagine a **drivers license**.
- It belongs to **you**.
- You can't sell it to someone else.
- You can't give it to a friend to use.
- If you lose your wallet, you get it re-issued to YOU, not someone else.

Now imagine a **video game skin** (Standard NFT).
- You can buy it.
- You can sell it.
- You can trade it.
- It doesn't matter *who* holds it, just that they have it.

**ZeroKlue uses Soulbound NFTs.**
When you verify as a student, we mint a credential that is **locked to your wallet**.
- ✅ You can prove you have it.
- ❌ You cannot sell your student status to a random stranger.
- ❌ You cannot transfer it to a burner wallet to farm airdrops.

## Why We Use It for ZeroKlue
1.  **Trust**: Merchants know that the person holding the discounts is the actual verified student.
2.  **Reputation**: Over time, your wallet builds a reputation/history of valid credentials.
3.  **Sybil Resistance**: Prevents one person from verifying 100 times and selling the accounts.

## Under the Hood
In our smart contract (`ZeroKlue.sol`), the transfer function is disabled:
```solidity
function transferFrom(address, address, uint256) public pure override {
    revert("Soulbound: Cannot transfer this credential");
}
```

This simple check turns a standard NFT into a permanent identity badge.
