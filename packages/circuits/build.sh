#!/bin/bash
# ZeroKlue Circuit Build Script (adapted from StealthNote)

rm -rf target

echo "Compiling circuit..."
if ! nargo compile; then
    echo "Compilation failed. Exiting..."
    exit 1
fi

# Use the exact Barretenberg version bundled with the browser prover. Its
# `ultra_keccak_honk` commands generate the EVM-compatible verification key.
BB="../../zeroklue-app/packages/nextjs/node_modules/.bin/bb.js"
if [ ! -x "$BB" ]; then
    echo "Barretenberg CLI not found. Run the immutable Yarn install in zeroklue-app first."
    exit 1
fi

# Create output directories
mkdir -p "../../zeroklue-app/packages/nextjs/public/circuits"
mkdir -p "../../zeroklue-app/packages/foundry/contracts"

echo "Copying circuit.json to nextjs public folder..."
cp target/stealthnote_jwt.json "../../zeroklue-app/packages/nextjs/public/circuits/circuit.json"

echo "Generating verification key..."
"$BB" write_vk_ultra_keccak_honk -b ./target/stealthnote_jwt.json -o ./target/vk

echo "Generating circuit-vkey.json..."
node -e "const fs = require('fs'); fs.writeFileSync('../../zeroklue-app/packages/nextjs/public/circuits/circuit-vkey.json', JSON.stringify(Array.from(Uint8Array.from(fs.readFileSync('./target/vk')))));"

echo "Generating Solidity verifier..."
"$BB" contract_ultra_honk -b ./target/stealthnote_jwt.json -k ./target/vk -o ../../zeroklue-app/packages/foundry/contracts/HonkVerifier.sol
cp ./target/vk ./vk/vk
cp ./target/vk "../../zeroklue-app/packages/nextjs/public/circuits/vk"
cp "../../zeroklue-app/packages/foundry/contracts/HonkVerifier.sol" ./HonkVerifier.sol

echo "Done! Files generated:"
echo "  - zeroklue-app/packages/nextjs/public/circuits/circuit.json"
echo "  - zeroklue-app/packages/nextjs/public/circuits/circuit-vkey.json"
echo "  - zeroklue-app/packages/foundry/contracts/HonkVerifier.sol"
