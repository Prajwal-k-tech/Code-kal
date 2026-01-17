// ZeroKlue Student Verification Circuit
// Verifies EdDSA signature on wallet address + generates nullifier
//
// WHAT THIS PROVES (without revealing the email):
// 1. User has a valid signature from ZeroKlue (trusted issuer)
// 2. The signature is bound to their wallet address
// 3. The nullifier derives from their email (prevents double-mint)
//
// @owner ZK Circuit Dev

use std::hash::poseidon;
use dep::eddsa;

fn main(
    // ============ PUBLIC INPUTS (visible on-chain) ============
    // Issuer's public key (ZeroKlue backend)
    pub issuer_pubkey_x: Field,
    pub issuer_pubkey_y: Field,
    // Nullifier - derived from email, prevents same email verifying twice
    pub nullifier: Field,
    // User's wallet address (will be checked against msg.sender)
    pub wallet_address: Field,
    
    // ============ PRIVATE INPUTS (hidden from verifier) ============
    // EdDSA signature from backend (R point + s scalar)
    signature_r8_x: Field,
    signature_r8_y: Field,
    signature_s: Field,
    // Secret seed for nullifier derivation
    nullifier_seed: Field,
) {
    // ============ STEP 1: Verify Nullifier Derivation ============
    // The nullifier is a public commitment to the email
    // computed_nullifier = poseidon(nullifier_seed)
    // This ensures:
    // - Same email always produces same nullifier (no double-mint)
    // - Email is never revealed (only its hash)
    
    let computed_nullifier = poseidon::bn254::hash_1([nullifier_seed]);
    assert(nullifier == computed_nullifier, "Invalid nullifier derivation");

    // ============ STEP 2: Verify EdDSA Signature ============
    // The issuer (ZeroKlue backend) signs: message = poseidon(wallet_address, nullifier_seed)
    // This binds the credential to both:
    // - The user's wallet (wallet_address)
    // - The user's email (via nullifier_seed)
    
    let message = poseidon::bn254::hash_2([wallet_address, nullifier_seed]);
    
    // Verify the signature using EdDSA
    let signature_valid = eddsa::eddsa_poseidon_verify(
        issuer_pubkey_x,
        issuer_pubkey_y,
        signature_s,
        signature_r8_x,
        signature_r8_y,
        message
    );
    
    assert(signature_valid, "Invalid issuer signature");
}

// ============ DEVELOPMENT NOTES ============
//
// CIRCUIT INPUT FLOW:
// 1. User enters email → Backend hashes it → nullifier_seed
// 2. User connects wallet → Backend gets wallet_address
// 3. Backend signs: message = poseidon(wallet_address, nullifier_seed)
// 4. Backend returns: signature, nullifier_seed, issuer_pubkey
// 5. Frontend computes: nullifier = poseidon(nullifier_seed)
// 6. Frontend generates proof with all inputs
// 7. Contract verifies: proof + public inputs
//
// SECURITY PROPERTIES:
// - Email is NEVER exposed (only poseidon hash)
// - Nullifier prevents same email verifying multiple wallets
// - Signature prevents forging credentials
// - Wallet binding prevents credential transfer
//
// COMPILE & TEST:
// $ cd packages/circuits
// $ nargo compile
// $ nargo prove
// $ nargo verify
//
// GENERATE VERIFIER CONTRACT:
// $ nargo codegen-verifier
// → Copy UltraVerifier.sol to packages/foundry/contracts/
//
// COORDINATE WITH:
// - Backend Dev: Signature format, hash functions
// - Frontend Dev: NoirJS integration, proof format
// - Contract Dev: Verifier integration
