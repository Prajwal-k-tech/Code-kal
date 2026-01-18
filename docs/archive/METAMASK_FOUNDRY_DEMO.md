# 🦊 MetaMask + Foundry Local Demo Guide

**For: Live demo with real wallets on local test chain**  
**Time to setup: 5 minutes**  
**Audience: Demo presenters, testers, judges**

---

## 🎯 What This Guide Does

This guide shows you how to:
1. Run a local Foundry (Anvil) chain
2. Connect MetaMask (or any Ethereum wallet) to it
3. Import test accounts with pre-funded ETH
4. Deploy ZeroKlue contracts
5. Demo the full verification flow with a real wallet

**Why this matters for demos:**
- ✅ Shows it works with ANY Ethereum wallet (not just Foundry-specific tools)
- ✅ Realistic user experience (clicking buttons in MetaMask)
- ✅ No testnet faucets or gas costs
- ✅ Instant transaction confirmations
- ✅ Full control over chain state for reproducible demos

---

## 📋 Prerequisites

```bash
# Check you have these installed:
forge --version    # Foundry (for local chain)
node --version     # Node.js 18+ (for frontend)
yarn --version     # Yarn package manager

# MetaMask browser extension (or any web3 wallet)
# Get it: https://metamask.io/download/
```

---

## 🚀 Step 1: Start Local Anvil Chain

Open a terminal and run:

```bash
cd zeroklue-app/packages/foundry
anvil
```

**What you'll see:**
```
Available Accounts
==================
(0) 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000.000000000000000000 ETH)
(1) 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (10000.000000000000000000 ETH)
...

Private Keys
==================
(0) 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
(1) 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
...

Chain ID: 31337
Base Fee: 1 gwei
Gas Limit: 30000000
```

**Keep this terminal open!** Anvil must run continuously.

---

## 🦊 Step 2: Configure MetaMask for Local Chain

### 2.1 Add Foundry Network

1. Open MetaMask
2. Click the network dropdown (top left, usually says "Ethereum Mainnet")
3. Click "Add Network" → "Add a network manually"
4. Enter these details:

```
Network Name:       Foundry Local
RPC URL:            http://127.0.0.1:8545
Chain ID:           31337
Currency Symbol:    ETH
Block Explorer URL: (leave blank)
```

5. Click "Save"
6. Switch to "Foundry Local" network

### 2.2 Import Test Account

**You now need ETH to interact with contracts.** Anvil gives you 10 pre-funded accounts.

1. In MetaMask, click the account icon (top right)
2. Click "Import Account"
3. Select "Private Key"
4. Paste one of Anvil's private keys from Step 1:

```
0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

5. Click "Import"

**✅ You should now see "Account X" with 10,000 ETH balance!**

**Security Note:** ⚠️ **NEVER** use these private keys on mainnet or testnets. They are publicly known test keys.

### 2.3 Import Multiple Accounts (Optional)

For testing multi-user scenarios, import more accounts:

```
Account 1: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
Account 2: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
Account 3: 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a
```

Addresses for these:
```
Account 1: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Account 2: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
Account 3: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
```

---

## ⚙️ Step 3: Deploy Contracts to Local Chain

**Open a NEW terminal** (keep Anvil running in the first one):

```bash
cd zeroklue-app/packages/foundry

# Deploy contracts
forge script script/Deploy.s.sol --broadcast --rpc-url http://127.0.0.1:8545
```

**What this does:**
- Compiles `ZeroKlue.sol` and `HonkVerifier.sol`
- Deploys them to your local Anvil chain
- Saves deployment info to `deployments/anvil-31337/`

**Look for this output:**
```
== Logs ==
  Deploying ZeroKlue on ChainID 31337
  ZeroKlue deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

**Copy that contract address!** You'll need it for the frontend.

---

## 🔍 Step 4: Verify Deployment

Check the contract is live:

```bash
cast call 0x5FbDB2315678afecb367f032d93F642f64180aa3 "name()" --rpc-url http://127.0.0.1:8545
```

**Expected output:**
```
"ZeroKlue Student Verification"
```

---

## 🌐 Step 5: Configure Frontend

### 5.1 Update Contract Address

Edit `zeroklue-app/packages/nextjs/contracts/deployedContracts.ts`:

```typescript
const deployedContracts = {
  31337: {
    ZeroKlue: {
      address: "0x5FbDB2315678afecb367f032d93F642f64180aa3", // ← Your address from Step 3
      abi: [...] // Already correct
    }
  }
};
```

### 5.2 Start Frontend

```bash
cd zeroklue-app/packages/nextjs
yarn install
yarn dev
```

**Open http://localhost:3000** in your browser.

---

## 🎬 Step 6: Demo Flow

### Full User Journey

**Before starting, make sure:**
- ✅ Anvil is running
- ✅ Contracts are deployed
- ✅ Frontend is running
- ✅ MetaMask is connected to "Foundry Local"
- ✅ MetaMask has imported test account with ETH

### Demo Script

1. **Open app in browser**
   - Navigate to `http://localhost:3000`
   - You should see the ZeroKlue landing page

2. **Connect wallet**
   - Click "Connect Wallet" button
   - MetaMask pops up
   - Select your imported test account
   - Click "Connect"
   - ✅ You're now connected!

3. **Start verification**
   - Click "Verify as Student"
   - You'll be redirected to Google OAuth

4. **Sign in with Google** *(requires real Google Workspace account)*
   - Use your university/organization email (e.g., `you@mit.edu`)
   - Google will redirect back with JWT token
   - ⚠️ This step requires a real .edu email from a Google Workspace org

5. **Generate ZK proof** *(~30 seconds)*
   - Frontend automatically:
     - Generates ephemeral key pair
     - Extracts JWT payload
     - Runs Noir circuit in browser
     - Creates zero-knowledge proof
   - You'll see a progress indicator
   - ⏱️ Takes ~30 seconds (this is normal for ZK proofs!)

6. **Submit to contract**
   - MetaMask pops up with transaction
   - Shows gas estimate (~5M gas for proof verification)
   - Click "Confirm"
   - ⚡ Transaction confirms instantly (it's local!)

7. **Success!**
   - You now have a soulbound NFT
   - Your wallet is verified as a student
   - Email was NEVER revealed on-chain
   - Check verification status: "Verified ✅"

### Testing Multiple Wallets

**Scenario: Same email, different wallets**

1. Complete verification flow with Account 1
2. Switch MetaMask to Account 2
3. Verify with SAME Google account
4. ✅ Both wallets get NFTs (this is expected behavior)
5. **Why this is OK:** Each wallet's verification is independent. Merchants can enforce "one offer per email" off-chain.

**Scenario: Sybil resistance (same wallet, same ephemeral key)**

1. Complete verification with Account 1
2. Try to submit the SAME proof again
3. ❌ Transaction reverts: "Ephemeral key already used"
4. ✅ This prevents proof replay attacks

---

## 🔧 Troubleshooting

### MetaMask doesn't show the transaction

**Problem:** You clicked "Verify" but nothing happens.

**Solution:**
```bash
# Check Anvil is still running (terminal 1)
# Check contract is deployed:
cast call <CONTRACT_ADDRESS> "name()" --rpc-url http://127.0.0.1:8545
```

### Transaction fails with "out of gas"

**Problem:** `verifyAndMint()` reverts with OOG error.

**Why:** HonkVerifier uses ~5M gas (large for ZK verification).

**Solution:** Already handled! `foundry.toml` has:
```toml
code_size_limit = 50000  # Allows 30KB contracts
```

If still failing, check your gas limit:
```typescript
// In contract call:
gasLimit: 6000000n  // 6M gas
```

### Proof verification fails

**Problem:** `verifyAndMint()` reverts with "Invalid proof".

**Causes:**
1. Wrong public inputs (check indices)
2. Expired JWT (JWT exp < current time)
3. Wrong Google public key (they rotate keys)
4. Circuit artifacts mismatch

**Debug:**
```bash
# Check public inputs length:
cast call <ADDRESS> "verifyAndMint(bytes,bytes32[])" <PROOF> <INPUTS> --trace

# Should see 85 public inputs
```

### "Nonce too high" error

**Problem:** MetaMask shows nonce error after restarting Anvil.

**Solution:**
1. MetaMask → Settings → Advanced
2. Click "Clear activity tab data"
3. Or manually reset account: Settings → Advanced → Reset Account

---

## 📊 Monitoring Local Chain

### View all transactions

```bash
# In another terminal:
cast logs --rpc-url http://127.0.0.1:8545
```

### Check NFT balance

```bash
cast call <CONTRACT_ADDRESS> "balanceOf(address)" <YOUR_WALLET> --rpc-url http://127.0.0.1:8545
```

Expected: `0x0000000000000000000000000000000000000000000000000000000000000001` (1 NFT)

### Check verification status

```bash
cast call <CONTRACT_ADDRESS> "isVerified(address)" <YOUR_WALLET> --rpc-url http://127.0.0.1:8545
```

Expected: `0x0000000000000000000000000000000000000000000000000000000000000001` (true)

### Get verification details

```bash
cast call <CONTRACT_ADDRESS> "getVerification(address)" <YOUR_WALLET> --rpc-url http://127.0.0.1:8545
```

Returns: `(ephemeralPubkey, timestamp, expiryTime)`

---

## 🎥 Demo Tips for Presentations

### Pre-Demo Setup (5 min before)

```bash
# Terminal 1: Start Anvil
cd zeroklue-app/packages/foundry && anvil

# Terminal 2: Deploy contracts
forge script script/Deploy.s.sol --broadcast --rpc-url http://127.0.0.1:8545

# Terminal 3: Start frontend
cd zeroklue-app/packages/nextjs && yarn dev

# Browser: Configure MetaMask (if not already done)
```

### During Demo

**Show these key points:**

1. **Privacy:**
   - Inspect the transaction on Anvil logs
   - Point out: NO email address visible
   - Only `ephemeralPubkey` and `timestamp` stored

2. **Sybil Resistance:**
   - Try to verify same wallet twice
   - Show transaction reverts
   - Explain: "Each ephemeral key is one-time-use"

3. **Soulbound:**
   - Try to transfer the NFT (use MetaMask "Send NFT" feature)
   - Show: Transaction reverts
   - Explain: "Verification cannot be sold or transferred"

4. **Real-time Verification:**
   - Have a merchant contract call `isVerified()`
   - Show: Returns `true` instantly
   - Explain: "No API calls, no databases, just blockchain"

### Backup Plan (If Google OAuth Breaks)

**Use pre-generated proof:**

```typescript
// In useStudentVerification.ts:
const mockProof = {
  proof: "0x...", // Pre-generated from successful run
  publicInputs: [...], // Pre-generated
  ephemeralPubkey: "0x...",
  timestamp: Date.now()
};

// Skip OAuth step and use mockProof
await verifyAndMint(mockProof);
```

**Tell judges:** "This is a pre-generated proof from a successful verification. In production, users generate this live."

---

## 🔐 Security Notes for Demo

### What's Safe

✅ Using Anvil private keys locally  
✅ Testing with real Google accounts (JWT never goes to our backend)  
✅ Connecting multiple wallets to same email  
✅ Resetting Anvil state (no persistent data)

### What's NOT Safe

❌ **NEVER use Anvil private keys on mainnet/testnets** - they're public!  
❌ **NEVER commit `.env` with real private keys**  
❌ **NEVER deploy unaudited contracts to mainnet**  
❌ **NEVER share your real Google OAuth client secrets publicly**

### Demo Disclaimers

When presenting, mention:

> "This is running on a local test chain. For production:
> - Contracts would be audited
> - Circuit would be audited
> - We'd deploy to L2s for lower gas costs
> - OAuth client secrets would be protected"

---

## 🔄 Resetting Between Demos

**To start fresh:**

```bash
# Stop Anvil (Ctrl+C in terminal 1)
# Start it again:
anvil

# Redeploy:
forge script script/Deploy.s.sol --broadcast --rpc-url http://127.0.0.1:8545

# Reset MetaMask:
# Settings → Advanced → Clear activity tab data
```

**State is now clean!** All previous verifications are gone.

---

## 🌍 Works with ANY Ethereum Wallet

**Not just MetaMask!** ZeroKlue works with:

- 🦊 MetaMask
- 🌈 Rainbow Wallet
- 🔗 WalletConnect-compatible wallets
- 🦄 Uniswap Wallet
- 💼 Coinbase Wallet
- 🔒 Ledger / Trezor hardware wallets

**Setup is identical:**
1. Add "Foundry Local" network (RPC: http://127.0.0.1:8545, Chain ID: 31337)
2. Import Anvil test account private key
3. Connect to app and verify

**RainbowKit (our wallet connector) handles all the complexity!**

---

## 📚 Related Docs

- [QUICKSTART.md](./QUICKSTART.md) - Initial project setup
- [TECHNICAL_DEEP_DIVE.md](./TECHNICAL_DEEP_DIVE.md) - How ZK proofs work
- [BACKEND_READY.md](./BACKEND_READY.md) - Contract API reference
- [FRONTEND_GUIDE.md](./FRONTEND_GUIDE.md) - Building the UI
- [SECURITY_ANALYSIS.md](./SECURITY_ANALYSIS.md) - Security considerations

---

## ✅ Demo Checklist

Print this for live demos:

```
Pre-Demo (5 min before):
□ Anvil running
□ Contracts deployed
□ Frontend running (http://localhost:3000)
□ MetaMask configured with Foundry Local network
□ Test account imported with 10,000 ETH
□ Google account ready (university email)

During Demo:
□ Connect wallet (show MetaMask popup)
□ Sign in with Google (show OAuth flow)
□ Wait for proof generation (~30s, explain why)
□ Confirm transaction (show gas estimate)
□ Show success page (NFT minted)
□ Demonstrate verification check (call isVerified)
□ Show privacy (no email on-chain)
□ Try to transfer NFT (show it fails - soulbound)
□ Try to verify again (show it fails - sybil resistance)

Backup:
□ Have pre-generated proof ready
□ Have screenshots of successful flow
□ Have Anvil logs showing verification event
```

---

**Ready to demo! 🚀**

Questions during demo? Check [HACKATHON_QA.md](./HACKATHON_QA.md) for judge Q&A prep.
