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
        bytes32 nullifier;      // Prevents duplicate verifications (Poseidon hash of email)
        bool exists;            // Optimization for balanceOf
    }

    // Student address => their verification
    mapping(address => StudentVerification) public verifications;
    
    // Nullifier => used (prevents same credential twice)
    mapping(bytes32 => bool) public usedNullifiers;
    
    // HonkVerifier for ZK proof verification
    IVerifier public immutable verifier;
    
    // Total verified students (for stats)
    uint256 public totalVerified;
    
    // Number of public inputs expected from the circuit
    uint256 public constant NUM_PUBLIC_INPUTS = 85;

    // ============ Events ============

    event StudentVerified(
        address indexed student,
        bytes32 nullifier,
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
     * Public Inputs Layout (from noir-jwt circuit):
     * [0-2047]: JWT partial hash segments (256 bytes * 8 = 2048 field elements)
     * ... circuit-specific inputs ...
     * [82]: domain_hash_lo (lower 128 bits of email domain hash)
     * [83]: domain_hash_hi (upper 128 bits of email domain hash)
     * [84]: nullifier (Poseidon hash of email for privacy)
     * 
     * Note: The wallet address is committed to within the proof itself
     * via the ephemeral key signing mechanism
     */
    function verifyAndMint(
        bytes calldata proof,
        bytes32[] calldata publicInputs
    ) external {
        require(publicInputs.length == NUM_PUBLIC_INPUTS, "Invalid public inputs length");
        
        // Extract nullifier from public inputs (last element)
        bytes32 nullifier = publicInputs[84];

        // 1. Check nullifier not used (prevents double-verification with same credential)
        require(!usedNullifiers[nullifier], "Credential already used");

        // 2. Verify the ZK proof using HonkVerifier
        require(verifier.verify(proof, publicInputs), "Invalid proof");

        // 3. Check if reverifying (same student, different timestamp)
        bool isReverification = verifications[msg.sender].exists;

        // 4. Store verification with current timestamp
        verifications[msg.sender] = StudentVerification({
            verifiedAt: block.timestamp,
            nullifier: nullifier,
            exists: true
        });

        // 5. Mark nullifier as used
        usedNullifiers[nullifier] = true;

        // 6. Update counter and emit events
        if (!isReverification) {
            totalVerified++;
            emit StudentVerified(msg.sender, nullifier, block.timestamp);
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
     * @return nullifier The nullifier hash used
     * @return age How long ago verified (in seconds)
     */
    function getVerification(address student) 
        public 
        view 
        returns (uint256 verifiedAt, bytes32 nullifier, uint256 age) 
    {
        StudentVerification memory verification = verifications[student];
        require(verification.exists, "Not verified");
        
        verifiedAt = verification.verifiedAt;
        nullifier = verification.nullifier;
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
