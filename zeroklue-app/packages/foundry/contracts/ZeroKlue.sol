// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ZeroKlue Student Verification (Simplified)
 * @notice Client-side ZK verification with on-chain attestation
 * @dev Proof verification happens client-side. This contract stores attestations.
 * 
 * SECURITY NOTE: This version trusts client-side verification.
 * For production, implement on-chain verification with HonkVerifier.
 */
contract ZeroKlue is Ownable {
    // ============ State Variables ============

    struct StudentVerification {
        uint256 verifiedAt;      // When verification was registered
        bytes32 ephemeralPubkey; // The ephemeral public key used
        bool exists;             // For balanceOf optimization
    }

    // Student address => their verification
    mapping(address => StudentVerification) public verifications;
    
    // Ephemeral pubkey => used (prevents same key twice)
    mapping(bytes32 => bool) public usedEphemeralKeys;
    
    // Total verified students (for stats)
    uint256 public totalVerified;

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

    constructor() Ownable(msg.sender) {}

    // ============ Core Functions ============

    /**
     * @notice Register student verification (called after client-side proof verification)
     * @param ephemeralPubkey The ephemeral public key from the ZK proof
     * 
     * FLOW:
     * 1. User generates ZK proof in browser
     * 2. Browser verifies proof with BarretenbergVerifier
     * 3. If valid, browser calls this function with the ephemeral pubkey
     * 4. Contract stores the verification attestation
     */
    function registerStudent(bytes32 ephemeralPubkey) external {
        // 1. Check ephemeral key not already used
        require(!usedEphemeralKeys[ephemeralPubkey], "Ephemeral key already used");

        // 2. Check if reverifying (same student, different ephemeral key)
        bool isReverification = verifications[msg.sender].exists;

        // 3. Store verification with current timestamp
        verifications[msg.sender] = StudentVerification({
            verifiedAt: block.timestamp,
            ephemeralPubkey: ephemeralPubkey,
            exists: true
        });

        // 4. Mark ephemeral key as used
        usedEphemeralKeys[ephemeralPubkey] = true;

        // 5. Update counter and emit events
        if (!isReverification) {
            totalVerified++;
            emit StudentVerified(msg.sender, ephemeralPubkey, block.timestamp);
        } else {
            emit StudentReverified(msg.sender, block.timestamp);
        }
    }

    // ============ View Functions (Merchant-facing) ============

    /**
     * @notice Check if address is a verified student
     */
    function isVerified(address student) public view returns (bool) {
        return verifications[student].exists;
    }

    /**
     * @notice Check if verification is recent (within maxAge)
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
     */
    function revokeVerification(address student) external onlyOwner {
        require(verifications[student].exists, "Not verified");
        delete verifications[student];
        totalVerified--;
    }
}
