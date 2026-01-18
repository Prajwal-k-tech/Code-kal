#!/bin/bash

echo "start up..."

# Kill existing processes
pkill -f anvil || true
pkill -f "next dev" || true
pkill -f "yarn start" || true
pkill -f "yarn next" || true

# 1. Start Anvil (Local Chain)
echo "Starting Anvil..."
cd zeroklue-app
anvil --code-size-limit 100000 --port 8545 --host 0.0.0.0 --allow-origin '*' > /dev/null 2>&1 &
ANVIL_PID=$!
cd ..

# Wait for Anvil to be ready
echo "Waiting for Anvil..."
while ! nc -z localhost 8545; do   
  sleep 1
done
echo "Anvil is ready!"

# 2. Deploy Contracts (Using Scaffold-ETH script to update frontend config)
echo "Deploying Contracts..."
cd zeroklue-app
yarn foundry:clean  # Clean stale artifacts
yarn deploy         # Deploys HonkVerifier + ZeroKlue and updates deployedContracts.ts

# 3. Fund Burner Wallets
# Anvil account 0 has 10000 ETH - we'll fund known test addresses
echo "Funding test accounts with 1000 ETH each..."

ANVIL_PRIVATE_KEY="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
FUND_AMOUNT="1000ether"

# Fund known burner wallet address (from previous runs)
cast send 0xfb48fbA511C33bAB53a5e33f439D3a2C9971cdAd --value $FUND_AMOUNT --private-key $ANVIL_PRIVATE_KEY --rpc-url http://127.0.0.1:8545 >/dev/null 2>&1 || true

# Fund a few more common test addresses
cast send 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 --value $FUND_AMOUNT --private-key $ANVIL_PRIVATE_KEY --rpc-url http://127.0.0.1:8545 >/dev/null 2>&1 || true
cast send 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC --value $FUND_AMOUNT --private-key $ANVIL_PRIVATE_KEY --rpc-url http://127.0.0.1:8545 >/dev/null 2>&1 || true

echo "Contracts Deployed!"
echo ""
echo "💡 TIP: If your burner wallet has 0 ETH, run this in another terminal:"
echo "   cast send YOUR_WALLET_ADDRESS --value 1000ether --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 --rpc-url http://127.0.0.1:8545"
echo ""

# 4. Start Frontend
echo "Starting Frontend..."
yarn start  # Runs 'next dev' from root workspace logic
