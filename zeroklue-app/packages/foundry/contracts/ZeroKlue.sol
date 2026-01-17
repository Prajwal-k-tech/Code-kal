// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ZeroKlue Student Verification
 * @notice On-chain student verification using zero-knowledge proofs
 * @dev NFT represents verified student status with timestamp
 * 
 * KEY FEATURE: Timestamp-based verification
 * - NFT stores when proof was verified
 * - Merchants can check age of verification
 * - Flexible policies: "current student" vs "was a student"
 */
contract ZeroKlue is Ownable {
    // ============ State Variables ============

    struct StudentVerification {
        uint256 verifiedAt;     // When proof was submitted
        uint256 nullifier;      // Prevents duplicate verifications
        bool exists;            // Optimization for balanceOf
    }

    // Student address => their verification
    mapping(address => StudentVerification) public verifications;
    
    // Nullifier => used (prevents same credential twice)
    mapping(uint256 => bool) public usedNullifiers;
    
    // Issuer public key (from backend)
    uint256 public issuerPubKeyX;
    uint256 public issuerPubKeyY;
    
    // Total verified students (for stats)
    uint256 public totalVerified;

    // ============ Events ============

    event StudentVerified(
        address indexed student,
        uint256 nullifier,
        uint256 timestamp
    );
    
    event StudentReverified(
        address indexed student,
        uint256 newTimestamp
    );

    // ============ Constructor ============

    constructor(uint256 _issuerPubKeyX, uint256 _issuerPubKeyY) Ownable(msg.sender) {
        issuerPubKeyX = _issuerPubKeyX;
        issuerPubKeyY = _issuerPubKeyY;
    }

    // ============ Core Functions ============

    /**
     * @notice Verify ZK proof and mint student NFT
     * @param proof The ZK proof (format depends on verifier)
     * @param publicInputs [issuerPubKeyX, issuerPubKeyY, nullifier, walletAddress]
     * 
     * This is called by students after generating their proof
     */
    function verifyAndMint(
        uint256[8] calldata proof,
        uint256[4] calldata publicInputs
    ) external {
        // Extract public inputs
        uint256 _issuerPubKeyX = publicInputs[0];
        uint256 _issuerPubKeyY = publicInputs[1];
        uint256 nullifier = publicInputs[2];
        uint256 walletAddress = publicInputs[3];

        // 1. Check issuer key matches
        require(_issuerPubKeyX == issuerPubKeyX, "Invalid issuer key X");
        require(_issuerPubKeyY == issuerPubKeyY, "Invalid issuer key Y");

        // 2. Check wallet address matches sender
        require(uint256(uint160(msg.sender)) == walletAddress, "Wallet mismatch");

        // 3. Check nullifier not used
        require(!usedNullifiers[nullifier], "Credential already used");

        // 4. Verify the ZK proof
        require(verifyProof(proof, publicInputs), "Invalid proof");

        // 5. Check if reverifying (same student, different timestamp)
        bool isReverification = verifications[msg.sender].exists;

        // 6. Store verification with current timestamp
        verifications[msg.sender] = StudentVerification({
            verifiedAt: block.timestamp,
            nullifier: nullifier,
            exists: true
        });

        // 7. Mark nullifier as used
        usedNullifiers[nullifier] = true;

        // 8. Update counter
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
     * @return nullifier The nullifier used
     * @return age How long ago verified (in seconds)
     */
    function getVerification(address student) 
        public 
        view 
        returns (uint256 verifiedAt, uint256 nullifier, uint256 age) 
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
     * @notice Update issuer public key (only owner)
     * @dev Use if issuer key is compromised or rotated
     */
    function updateIssuerKey(uint256 _issuerPubKeyX, uint256 _issuerPubKeyY) 
        external 
        onlyOwner 
    {
        issuerPubKeyX = _issuerPubKeyX;
        issuerPubKeyY = _issuerPubKeyY;
    }

    /**
     * @notice Emergency revoke verification (only owner)
     * @dev Use if credential was fraudulently obtained
     */
    function revokeVerification(address student) external onlyOwner {
        require(verifications[student].exists, "Not verified");
        delete verifications[student];
        totalVerified--;
    }

    // ============ Proof Verification ============

    /**
     * @notice Verify the ZK proof using Noir verifier
     * @dev This will be replaced with actual verifier contract call
     * 
     * TODO for Person 4:
     * 1. Person 3 generates Solidity verifier from Noir circuit
     * 2. Deploy verifier contract separately
     * 3. Call verifier.verify(proof, publicInputs) here
     * 
     * For now, this is a placeholder that always returns true for testing
     */
    function verifyProof(
        uint256[8] calldata proof,
        uint256[4] calldata publicInputs
    ) internal pure returns (bool) {
        // TODO: Replace with actual verifier call
        // Example:
        // return UltraVerifier(verifierAddress).verify(proof, publicInputs);
        
        // Placeholder for testing
        // ⚠️ INSECURE - Remove before production!
        return proof.length > 0 && publicInputs.length > 0;
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
