// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./HonkVerifier.sol";

/**
 * @title ZeroKlue Student Verification
 * @notice On-chain student verification using zero-knowledge proofs
 * @dev Verifies JWT proofs using Noir/HonkVerifier for trustless Google OAuth verification
 * 
 * KEY FEATURE: Trustless JWT Verification
 * - User signs in with Google on their browser
 * - Browser generates ZK proof that JWT is valid (RSA signature check)
 * - Proof submitted on-chain, verified by HonkVerifier
 * - NFT minted with verification timestamp
 * 
 * MERCHANT INTEGRATION:
 * - isRecentlyVerified(user, maxAge) - check if verified within time window
 * - Flexible policies: "current student" vs "was a student"
 */
contract ZeroKlue is Ownable {
    // ============ State Variables ============

    struct StudentVerification {
        uint256 verifiedAt;     // When proof was submitted
        bytes32 ephemeralPubkey; // The ephemeral public key used (prevents reuse)
        bool exists;            // Optimization for balanceOf
    }

    // Student address => their verification
    mapping(address => StudentVerification) public verifications;
    
    // Ephemeral pubkey => used (prevents same key twice)
    mapping(bytes32 => bool) public usedEphemeralKeys;
    
    // HonkVerifier for ZK proof verification
    IVerifier public immutable verifier;
    
    // Total verified students (for stats)
    uint256 public totalVerified;
    
    // Number of public inputs expected from the circuit
    // Layout: pubkey_limbs(18) + domain(64) + domain_len(1) + ephemeral_pubkey(1) + expiry(1) = 85
    uint256 public constant NUM_PUBLIC_INPUTS = 85;
    
    // Public input indices (from StealthNote circuit)
    uint256 private constant IDX_EPHEMERAL_PUBKEY = 83;
    uint256 private constant IDX_EPHEMERAL_EXPIRY = 84;

    // ============ Events ============

    event StudentVerified(
        address indexed student,
        bytes32 ephemeralPubkey,
        uint256 timestamp
    );
    
    event StudentReverified(
        address indexed student,
        uint256 newTimestamp
    );

    // ============ Constructor ============

    constructor(address _verifier) Ownable(msg.sender) {
        verifier = IVerifier(_verifier);
    }

    // ============ Core Functions ============

    /**
     * @notice Verify ZK proof and mint student verification NFT
     * @param proof The ZK proof bytes from noir_js
     * @param publicInputs Array of 85 public inputs from the circuit
     * 
     * Public Inputs Layout (from StealthNote noir-jwt circuit):
     * [0-17]:  jwt_pubkey_modulus_limbs (18 x u128) - Google's RSA public key
     * [18-81]: domain.storage (64 bytes) - The verified domain (e.g., "university.edu")
     * [82]:    domain.len - Length of the domain string
     * [83]:    ephemeral_pubkey - User's ephemeral public key (used as unique ID)
     * [84]:    ephemeral_pubkey_expiry - When the ephemeral key expires
     * 
     * Sybil Resistance: We use ephemeral_pubkey as unique identifier.
     * Same ephemeral key cannot mint twice, but user can generate new key
     * and re-verify (which is intentional for privacy rotation).
     */
    function verifyAndMint(
        bytes calldata proof,
        bytes32[] calldata publicInputs
    ) external {
        require(publicInputs.length == NUM_PUBLIC_INPUTS, "Invalid public inputs length");
        
        // Extract ephemeral pubkey from public inputs
        bytes32 ephemeralPubkey = publicInputs[IDX_EPHEMERAL_PUBKEY];

        // 1. Check ephemeral key not already used
        require(!usedEphemeralKeys[ephemeralPubkey], "Ephemeral key already used");

        // 2. Verify the ZK proof using HonkVerifier
        require(verifier.verify(proof, publicInputs), "Invalid proof");

        // 3. Check if reverifying (same student, different ephemeral key)
        bool isReverification = verifications[msg.sender].exists;

        // 4. Store verification with current timestamp
        verifications[msg.sender] = StudentVerification({
            verifiedAt: block.timestamp,
            ephemeralPubkey: ephemeralPubkey,
            exists: true
        });

        // 5. Mark ephemeral key as used
        usedEphemeralKeys[ephemeralPubkey] = true;

        // 6. Update counter and emit events
        if (!isReverification) {
            totalVerified++;
            emit StudentVerified(msg.sender, ephemeralPubkey, block.timestamp);
        } else {
            emit StudentReverified(msg.sender, block.timestamp);
        }
    }

    // ============ View Functions (Merchant-facing) ============

    /**
     * @notice Check if address is a verified student (any time)
     * @param student Address to check
     * @return True if verified at any point
     */
    function isVerified(address student) public view returns (bool) {
        return verifications[student].exists;
    }

    /**
     * @notice Check if verification is recent (within maxAge)
     * @param student Address to check
     * @param maxAge Maximum age in seconds (e.g., 365 days)
     * @return True if verified within maxAge
     * 
     * MERCHANT USAGE:
     * - Spotify: isRecentlyVerified(user, 365 days) - strict
     * - NFT drop: isRecentlyVerified(user, 730 days) - relaxed
     * - DAO: isRecentlyVerified(user, 180 days) - medium
     */
    function isRecentlyVerified(address student, uint256 maxAge) 
        public 
        view 
        returns (bool) 
    {
        StudentVerification memory verification = verifications[student];
        
        if (!verification.exists) {
            return false;
        }
        
        return (block.timestamp - verification.verifiedAt) <= maxAge;
    }

    /**
     * @notice Get full verification details
     * @param student Address to check
     * @return verifiedAt Timestamp of verification
     * @return ephemeralPubkey The ephemeral public key used (for sybil resistance)
     * @return age How long ago verified (in seconds)
     */
    function getVerification(address student) 
        public 
        view 
        returns (uint256 verifiedAt, bytes32 ephemeralPubkey, uint256 age) 
    {
        StudentVerification memory verification = verifications[student];
        require(verification.exists, "Not verified");
        
        verifiedAt = verification.verifiedAt;
        ephemeralPubkey = verification.ephemeralPubkey;
        age = block.timestamp - verification.verifiedAt;
    }

    /**
     * @notice Check if verification expires soon
     * @param student Address to check
     * @param expiryAge Age at which verification is considered expired
     * @param warningWindow Window before expiry to show warning
     * @return True if expiring soon
     * 
     * Example: expiryAge = 365 days, warningWindow = 30 days
     * Returns true if verification is 335-365 days old
     */
    function isExpiringSoon(
        address student,
        uint256 expiryAge,
        uint256 warningWindow
    ) public view returns (bool) {
        StudentVerification memory verification = verifications[student];
        
        if (!verification.exists) {
            return false;
        }
        
        uint256 age = block.timestamp - verification.verifiedAt;
        return age >= (expiryAge - warningWindow) && age < expiryAge;
    }

    // ============ NFT-like Functions (for compatibility) ============

    /**
     * @notice Returns 1 if verified, 0 if not (NFT balanceOf compatibility)
     */
    function balanceOf(address student) public view returns (uint256) {
        return verifications[student].exists ? 1 : 0;
    }

    /**
     * @notice Prevent transfers (soulbound NFT)
     */
    function transferFrom(address, address, uint256) public pure {
        revert("Soulbound: cannot transfer");
    }

    // ============ Admin Functions ============

    /**
     * @notice Emergency revoke verification (only owner)
     * @dev Use if credential was fraudulently obtained
     */
    function revokeVerification(address student) external onlyOwner {
        require(verifications[student].exists, "Not verified");
        delete verifications[student];
        totalVerified--;
    }
}

/**
 * MERCHANT INTEGRATION EXAMPLES
 * 
 * Example 1: Strict verification (Spotify-like)
 * ============================================
 * 
 * function applyDiscount(address user) public view returns (uint256) {
 *     if (zeroKlue.isRecentlyVerified(user, 365 days)) {
 *         return studentPrice;  // 50% off
 *     }
 *     return regularPrice;
 * }
 * 
 * 
 * Example 2: Relaxed verification (NFT airdrop)
 * =============================================
 * 
 * function canClaim(address user) public view returns (bool) {
 *     // Just need to have been a student at some point
 *     return zeroKlue.isVerified(user);
 * }
 * 
 * 
 * Example 3: Medium verification with warning (DAO)
 * =================================================
 * 
 * function getMembershipStatus(address user) public view returns (string memory) {
 *     if (zeroKlue.isRecentlyVerified(user, 180 days)) {
 *         return "Active";
 *     } else if (zeroKlue.isExpiringSoon(user, 180 days, 30 days)) {
 *         return "Expiring Soon - Please Reverify";
 *     } else if (zeroKlue.isVerified(user)) {
 *         return "Expired - Reverification Required";
 *     }
 *     return "Not Verified";
 * }
 * 
 * 
 * Example 4: Age-based pricing tiers
 * ===================================
 * 
 * function getPrice(address user) public view returns (uint256) {
 *     (uint256 verifiedAt, , uint256 age) = zeroKlue.getVerification(user);
 *     
 *     if (age < 30 days) {
 *         return 10 ether;  // Fresh verification: 10 ETH
 *     } else if (age < 180 days) {
 *         return 12 ether;  // Medium age: 12 ETH
 *     } else if (age < 365 days) {
 *         return 15 ether;  // Old verification: 15 ETH
 *     }
 *     return 20 ether;  // Not verified or expired: 20 ETH
 * }
 */
