use jwt::JWT;
use std::hash::poseidon2::Poseidon2;

global MAX_PARTIAL_DATA_LENGTH: u32 = 1024; // signed data length after partial SHA (increased from 640 to handle larger Google JWTs)
global MAX_DOMAIN_LENGTH: u32 = 64;
global MAX_AUDIENCE_LENGTH: u32 = 80;
global NONCE_LENGTH: u32 = 77;

/**
 * @brief Verify JWT signature and the Google issuer, audience, expiry, hosted domain, and nonce
 *
 * @param partial_data: OIDC JWT (id_token) base64 data (`$header.$payload`) as byte array of ascii characters
 *                      We do partial SHA on the data up to hd field outside of the circuit, to reduce constraints
 *                      This field only contains the bytes after partial SHA; padded to MAX_PARTIAL_DATA_LENGTH
 * @param partial_hash: The 256-bit partial hash of the `data`
 * @param full_data_length: The full length of the `data` (before partial SHA)
 * @param b64_offset: Offset needed in `partial_data` to make the payloadB64 a multiple of 4
 *                    Signed data is $header.$payload. $payload might not be a multiple of 4 in `partial_data`, so we need to offset
 *                    Not attack-able by giving an incorrect offset, as string match of hd and nonce will fail
 * @param jwt_pubkey_modulus_limbs: RSA public key modulus limbs (2048-bit split into 18 limbs)
 * @param jwt_pubkey_redc_params_limbs: RSA reduction parameters limbs
 * @param jwt_signature_limbs: RSA signature limbs
 * @param domain: Domain name (`hd` key) as a byte array of ascii characters padded to MAX_DOMAIN_LENGTH
 * @param audience: Expected Google OAuth client ID from the signed `aud` claim
 * @param ephemeral_pubkey: Public key of the ephemeral keypair that is used to sign messages
 * @param ephemeral_pubkey_salt: Salt of the ephemeral keypair that is used to sign messages
 * @param ephemeral_pubkey_expiry: Expiry of the ephemeral keypair that is used to sign messages
 * @param jwt_expiry: Public Unix timestamp copied from the signed JWT `exp` claim
 **/
fn main(
    partial_data: BoundedVec<u8, MAX_PARTIAL_DATA_LENGTH>,
    partial_hash: [u32; 8],
    full_data_length: u32,
    base64_decode_offset: u32,
    jwt_pubkey_modulus_limbs: pub [u128; 18],
    jwt_pubkey_redc_params_limbs: [u128; 18],
    jwt_signature_limbs: [u128; 18],
    domain: pub BoundedVec<u8, MAX_DOMAIN_LENGTH>,
    audience: pub BoundedVec<u8, MAX_AUDIENCE_LENGTH>,
    ephemeral_pubkey: pub Field,
    ephemeral_pubkey_salt: Field,
    ephemeral_pubkey_expiry: pub u32,
    jwt_expiry: pub u64,
) {
    // Init JWT struct and verify signature
    let jwt = JWT::init_with_partial_hash(
        partial_data,
        partial_hash,
        full_data_length,
        base64_decode_offset,
        jwt_pubkey_modulus_limbs,
        jwt_pubkey_redc_params_limbs,
        jwt_signature_limbs,
    );
    jwt.verify();

    // Google accepts the modern issuer and one legacy spelling.
    let issuer: BoundedVec<u8, 27> = jwt.get_claim_string("iss".as_bytes());
    let modern_issuer: BoundedVec<u8, 27> =
        BoundedVec::from_array("https://accounts.google.com".as_bytes());
    let legacy_issuer: BoundedVec<u8, 27> = BoundedVec::from_array("accounts.google.com".as_bytes());
    let is_modern_issuer = issuer == modern_issuer;
    let is_legacy_issuer = issuer == legacy_issuer;
    assert(is_modern_issuer | is_legacy_issuer, "invalid issuer");

    let token_audience: BoundedVec<u8, MAX_AUDIENCE_LENGTH> =
        jwt.get_claim_string("aud".as_bytes());
    assert(token_audience == audience, "invalid audience");

    let token_expiry: u64 = jwt.get_claim_number("exp".as_bytes());
    assert(token_expiry == jwt_expiry, "invalid JWT expiry");

    // Get nonce claim
    let nonce: BoundedVec<u8, NONCE_LENGTH> = jwt.get_claim_string("nonce".as_bytes());
    let nonce_field: Field = decimal_string_to_field(nonce.storage());

    // Verify nonce is the hash(ephemeral_pubkey, ephemeral_pubkey_salt, ephemeral_pubkey_expiry)
    let ephemeral_pubkey_hash = Poseidon2::hash(
        [ephemeral_pubkey, ephemeral_pubkey_salt, ephemeral_pubkey_expiry as Field],
        3,
    );

    assert(nonce_field == ephemeral_pubkey_hash, "invalid nonce");

    // Assert email_verified claim
    jwt.assert_claim_bool("email_verified".as_bytes(), true);

    // Google's hosted-domain claim is authoritative for Workspace membership;
    // an email address suffix alone is not.
    jwt.assert_claim_string("hd".as_bytes(), domain);
}

fn decimal_string_to_field<let LEN: u32>(decimal_bytes: [u8; LEN]) -> Field {
    assert(LEN <= 77);

    let mut field: Field = 0;
    let mut multiplier: Field = 1;

    for i in 0..LEN {
        let ascii_char = decimal_bytes[LEN - i - 1];
        if ascii_char >= 48 & ascii_char <= 57 {
            let digit = ascii_char as Field - 48;
            field += digit * multiplier;
            multiplier *= 10;
        }
    }

    field
}
