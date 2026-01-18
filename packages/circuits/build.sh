#!/bin/bash
# ZeroKlue Circuit Build Script (adapted from StealthNote)

rm -rf target

echo "Compiling circuit..."
if ! nargo compile; then
    echo "Compilation failed. Exiting..."
    exit 1
fi

echo "Gate count:"
bb gates -b target/stealthnote_jwt.json | jq '.functions[0].circuit_size'

# Create output directories
mkdir -p "../../zeroklue-app/packages/nextjs/public/circuits"
mkdir -p "../../zeroklue-app/packages/foundry/contracts"

echo "Copying circuit.json to nextjs public folder..."
cp target/stealthnote_jwt.json "../../zeroklue-app/packages/nextjs/public/circuits/circuit.json"

echo "Generating verification key..."
bb write_vk -b ./target/stealthnote_jwt.json -o ./target --oracle_hash keccak

echo "Generating circuit-vkey.json..."
node -e "const fs = require('fs'); fs.writeFileSync('../../zeroklue-app/packages/nextjs/public/circuits/circuit-vkey.json', JSON.stringify(Array.from(Uint8Array.from(fs.readFileSync('./target/vk')))));"

echo "Generating Solidity verifier..."
bb write_solidity_verifier -k ./target/vk -o ../../zeroklue-app/packages/foundry/contracts/HonkVerifier.sol

echo "Done! Files generated:"
echo "  - zeroklue-app/packages/nextjs/public/circuits/circuit.json"
echo "  - zeroklue-app/packages/nextjs/public/circuits/circuit-vkey.json"
echo "  - zeroklue-app/packages/foundry/contracts/HonkVerifier.sol"
