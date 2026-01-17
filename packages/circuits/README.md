# ZeroKlue Circuits

This package contains the Noir zero-knowledge circuits for student verification.

## Circuit Overview

The circuit verifies two things:
1. **Signature Verification**: Proves the student has a valid EdDSA signature from ZeroKlue issuer
2. **Nullifier Derivation**: Generates a unique nullifier to prevent double-verification

## Circuit Inputs

### Public Inputs (visible on-chain)
- `issuer_pubkey_x`: X-coordinate of issuer's EdDSA public key
- `issuer_pubkey_y`: Y-coordinate of issuer's EdDSA public key
- `nullifier`: Unique identifier derived from email (prevents reuse)
- `wallet_address`: Ethereum address receiving the student NFT

### Private Inputs (hidden)
- `signature_r`: R component of EdDSA signature
- `signature_s`: S component of EdDSA signature
- `email_hash`: Poseidon hash of student's email

## Setup

```bash
# Install Noir (if not already installed)
curl -L https://raw.githubusercontent.com/noir-lang/noirup/main/install | bash
noirup

# Install dependencies
nargo check
```

## Build

```bash
# Compile circuit
nargo compile

# This generates:
# - target/zeroklue_circuits.json (circuit artifact)
# - target/*.acir (intermediate representation)
```

## Test

```bash
# Create test inputs in Prover.toml first
nargo test

# Generate proof with test data
nargo prove
```

## Example Prover.toml

```toml
issuer_pubkey_x = "0x1234567890abcdef..."
issuer_pubkey_y = "0xfedcba0987654321..."
wallet_address = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
signature_r = "0x..."
signature_s = "0x..."
email_hash = "0x..."
nullifier = "0x..."
```

## Verification

```bash
# Generate verification key
bbup # Install Barretenberg if needed
bb write_vk -b ./target/zeroklue_circuits.json

# Verify a proof
bb verify -k ./target/vk -p ./proofs/zeroklue_circuits.proof
```

## Integration

The compiled circuit will be used by:
1. **Frontend** (`packages/frontend`): Generates proofs in browser using NoirJS
2. **Contracts** (`packages/contracts`): Verifies proofs on-chain via Solidity verifier

## Dependencies

- `eddsa`: EdDSA signature verification (BabyJubJub curve)
- `std`: Noir standard library (Poseidon hash)

## Performance

Expected metrics:
- **Circuit size**: ~10-15K constraints
- **Proving time**: <5 seconds (browser/Node.js)
- **Verification time**: <50ms (on-chain)
- **Proof size**: ~2KB

## Coordinate with Team

### Person 2 (Backend)
- Backend must sign with same curve (BabyJubJub EdDSA)
- Message format: `poseidon(wallet_address || email_hash)`
- Share test vectors for validation

### Person 4 (Contracts)
- Generate Solidity verifier after compilation
- Contract will call `verify(proof, publicInputs)`
- Public inputs order: `[issuer_pubkey_x, issuer_pubkey_y, nullifier, wallet_address]`

## Troubleshooting

**"nargo: command not found"**
```bash
curl -L https://raw.githubusercontent.com/noir-lang/noirup/main/install | bash
noirup
```

**"eddsa dependency not found"**
Add to Nargo.toml:
```toml
[dependencies]
eddsa = { git = "https://github.com/noir-lang/eddsa", tag = "v0.1.0" }
```

**"Circuit too slow"**
- Expected: ~5 seconds on modern laptop
- If slower, check circuit complexity
- Profile with `nargo info`

## Resources

- [Noir Documentation](https://noir-lang.org/docs)
- [EdDSA in Noir](https://github.com/noir-lang/eddsa)
- [Anon-Aadhaar Reference](https://github.com/anon-aadhaar/anon-aadhaar-noir)
