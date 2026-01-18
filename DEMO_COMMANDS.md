# 🚀 ZeroKlue Demo Commands Cheat Sheet

Run these commands in separate terminals to start the entire stack from scratch.

### 1. Start Local Blockchain (Anvil)
```bash
# Terminal 1
cd zeroklue-app
anvil --code-size-limit 100000 --port 8545
```

### 2. Deploy Contracts
*Wait for Anvil to be ready, then run:*
```bash
# Terminal 2
cd zeroklue-app/packages/foundry

# Deploy Verifier
forge create contracts/HonkVerifier.sol:HonkVerifier \
  --rpc-url http://localhost:8545 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  --broadcast

# Deploy ZeroKlue (Copy address from previous step if different, usually 0x5FbDB...aa3)
forge create contracts/ZeroKlue.sol:ZeroKlue \
  --rpc-url http://localhost:8545 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  --broadcast \
  --constructor-args 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

### 3. Fund Test Wallet (Burner Wallet)
*This funds the auto-connected wallet for the demo.*
```bash
# Terminal 2 (continued)
cast send 0xfb5DaadAd0d4B19b68c5dbBDf8A7D9d6e80cdfAd \
  --value 100ether \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  --rpc-url http://localhost:8545
```

### 4. Start Frontend
```bash
# Terminal 3
cd zeroklue-app
yarn start
```

### 🔗 Access
Open [http://localhost:3000](http://localhost:3000)
