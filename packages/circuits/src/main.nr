// ZeroKlue Student Verification Circuit
// Verifies EdDSA signature on wallet address + generates nullifier

use dep::std;

// TODO: Add eddsa dependency once we install it
// For now, this is a placeholder structure

fn main(
    // Public inputs (visible on-chain)
    issuer_pubkey_x: Field,
    issuer_pubkey_y: Field,
    nullifier: pub Field,
    wallet_address: pub Field,
    
    // Private inputs (hidden from verifier)
    signature_r: Field,
    signature_s: Field,
    email_hash: Field,
) {
    // Step 1: Verify EdDSA signature
    // The issuer signs: hash(wallet_address || email_hash)
    // TODO: Implement with eddsa library
    
    // Step 2: Verify nullifier derivation
    // nullifier = poseidon_hash(email_hash)
    // This ensures same email can't verify multiple wallets
    let computed_nullifier = std::hash::poseidon::bn254::hash_1([email_hash]);
    assert(nullifier == computed_nullifier);
    
    // TODO: Add actual signature verification
    // let message = [wallet_address, email_hash];
    // let pubkey = [issuer_pubkey_x, issuer_pubkey_y];
    // let signature = [signature_r, signature_s];
    // let valid = eddsa::verify(pubkey, signature, message);
    // assert(valid);
}

// DEVELOPMENT NOTES FOR PERSON 3:
// 
// 1. Install eddsa library:
//    Add to Nargo.toml:
//    eddsa = { git = "https://github.com/noir-lang/eddsa", tag = "v0.1.0" }
//
// 2. Message format:
//    - Backend signs: poseidon(wallet_address || email_hash)
//    - Circuit verifies this signature
//
// 3. Nullifier purpose:
//    - Prevents same email from verifying multiple wallets
//    - Contract tracks used nullifiers
//
// 4. Test inputs (create Prover.toml):
//    issuer_pubkey_x = "0x..."
//    issuer_pubkey_y = "0x..."
//    wallet_address = "0x..."
//    signature_r = "0x..."
//    signature_s = "0x..."
//    email_hash = "0x..." # poseidon(email)
//    nullifier = "0x..." # should match poseidon(email_hash)
//
// 5. Expected circuit size: ~10-15K constraints
//    Proving time: <5 seconds on M1 Mac
//
// 6. Coordinate with Person 2 (Backend):
//    - Signature format must match exactly
//    - Use same hash functions (Poseidon)
//    - Test vectors from backend
