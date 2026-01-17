// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import {Test, console} from "forge-std/Test.sol";
import {ZeroKlue} from "../contracts/ZeroKlue.sol";
import {IVerifier} from "../contracts/HonkVerifier.sol";

/**
 * @title ZeroKlue Test Suite
 * @notice Tests for the ZeroKlue student verification contract
 * @dev Uses a mock verifier since real ZK proofs require browser-side generation
 */

/// @notice Mock verifier that always returns true (for testing contract logic)
contract MockVerifier is IVerifier {
    bool public shouldVerify = true;
    
    function setShouldVerify(bool _shouldVerify) external {
        shouldVerify = _shouldVerify;
    }
    
    function verify(bytes calldata, bytes32[] calldata) external view override returns (bool) {
        return shouldVerify;
    }
}

contract ZeroKlueTest is Test {
    ZeroKlue public zeroKlue;
    MockVerifier public mockVerifier;
    
    address public alice = address(0x1);
    address public bob = address(0x2);
    address public charlie = address(0x3);
    
    // Sample public inputs (85 elements as per StealthNote circuit)
    // Layout: pubkey_limbs(18) + domain(64) + domain_len(1) + ephemeral_pubkey(1) + expiry(1)
    bytes32[] public samplePublicInputs;
    bytes public sampleProof;
    
    function setUp() public {
        // Deploy mock verifier
        mockVerifier = new MockVerifier();
        
        // Deploy ZeroKlue with mock verifier
        zeroKlue = new ZeroKlue(address(mockVerifier));
        
        // Create sample public inputs (85 elements)
        samplePublicInputs = new bytes32[](85);
        
        // Fill with dummy data
        for (uint256 i = 0; i < 18; i++) {
            samplePublicInputs[i] = bytes32(uint256(i + 1)); // pubkey limbs
        }
        for (uint256 i = 18; i < 82; i++) {
            samplePublicInputs[i] = bytes32(uint256(0)); // domain storage (mostly empty)
        }
        samplePublicInputs[82] = bytes32(uint256(10)); // domain length
        samplePublicInputs[83] = bytes32(uint256(0xABCDEF123456)); // ephemeral pubkey
        samplePublicInputs[84] = bytes32(uint256(block.timestamp + 3600)); // expiry (1 hour from now)
        
        // Sample proof (empty for mock)
        sampleProof = "";
    }
    
    // ============ Basic Verification Tests ============
    
    function test_VerifyAndMint_Success() public {
        vm.prank(alice);
        zeroKlue.verifyAndMint(sampleProof, samplePublicInputs);
        
        assertTrue(zeroKlue.isVerified(alice));
        assertEq(zeroKlue.totalVerified(), 1);
        assertEq(zeroKlue.balanceOf(alice), 1);
    }
    
    function test_VerifyAndMint_EmitsEvent() public {
        bytes32 expectedEphemeralKey = samplePublicInputs[83];
        
        vm.expectEmit(true, false, false, true);
        emit ZeroKlue.StudentVerified(alice, expectedEphemeralKey, block.timestamp);
        
        vm.prank(alice);
        zeroKlue.verifyAndMint(sampleProof, samplePublicInputs);
    }
    
    function test_VerifyAndMint_StoresCorrectData() public {
        vm.prank(alice);
        zeroKlue.verifyAndMint(sampleProof, samplePublicInputs);
        
        (uint256 verifiedAt, bytes32 ephemeralPubkey, uint256 age) = zeroKlue.getVerification(alice);
        
        assertEq(verifiedAt, block.timestamp);
        assertEq(ephemeralPubkey, samplePublicInputs[83]);
        assertEq(age, 0); // Just verified
    }
    
    function test_VerifyAndMint_RejectsInvalidProof() public {
        mockVerifier.setShouldVerify(false);
        
        vm.expectRevert("Invalid proof");
        vm.prank(alice);
        zeroKlue.verifyAndMint(sampleProof, samplePublicInputs);
    }
    
    /**
     * @notice Expiry is enforced by the ZK circuit, not the contract
     * @dev The circuit validates that ephemeral_pubkey_expiry > current time
     * With a mock verifier, we can't test this - it would require a real proof
     * This test documents the expected behavior when the verifier rejects
     */
    function test_VerifyAndMint_ExpiredKeyRejectedByVerifier() public {
        // Set mock verifier to reject (simulating what happens with expired key)
        mockVerifier.setShouldVerify(false);
        
        vm.expectRevert("Invalid proof");
        vm.prank(alice);
        zeroKlue.verifyAndMint(sampleProof, samplePublicInputs);
    }
    
    function test_VerifyAndMint_RejectsReusedEphemeralKey() public {
        vm.prank(alice);
        zeroKlue.verifyAndMint(sampleProof, samplePublicInputs);
        
        // Bob tries to use the same ephemeral key
        vm.expectRevert("Ephemeral key already used");
        vm.prank(bob);
        zeroKlue.verifyAndMint(sampleProof, samplePublicInputs);
    }
    
    function test_VerifyAndMint_RejectsWrongPublicInputsLength() public {
        bytes32[] memory shortInputs = new bytes32[](50);
        
        vm.expectRevert("Invalid public inputs length");
        vm.prank(alice);
        zeroKlue.verifyAndMint(sampleProof, shortInputs);
    }
    
    // ============ Re-verification Tests ============
    
    function test_Reverification_UpdatesTimestamp() public {
        vm.prank(alice);
        zeroKlue.verifyAndMint(sampleProof, samplePublicInputs);
        
        uint256 firstTimestamp = block.timestamp;
        
        // Warp forward
        vm.warp(block.timestamp + 30 days);
        
        // Create new ephemeral key for re-verification
        bytes32[] memory newInputs = _cloneInputsWithNewEphemeralKey(0xDEADBEEF);
        
        vm.prank(alice);
        zeroKlue.verifyAndMint(sampleProof, newInputs);
        
        (uint256 verifiedAt, , ) = zeroKlue.getVerification(alice);
        assertGt(verifiedAt, firstTimestamp);
        
        // Total should still be 1 (not double counted)
        assertEq(zeroKlue.totalVerified(), 1);
    }
    
    // ============ Time-Based Verification Tests ============
    
    function test_IsRecentlyVerified_True() public {
        vm.prank(alice);
        zeroKlue.verifyAndMint(sampleProof, samplePublicInputs);
        
        // Still recent after 30 days when checking with 365 day window
        vm.warp(block.timestamp + 30 days);
        assertTrue(zeroKlue.isRecentlyVerified(alice, 365 days));
    }
    
    function test_IsRecentlyVerified_False_AfterExpiry() public {
        vm.prank(alice);
        zeroKlue.verifyAndMint(sampleProof, samplePublicInputs);
        
        // Not recent after 400 days when checking with 365 day window
        vm.warp(block.timestamp + 400 days);
        assertFalse(zeroKlue.isRecentlyVerified(alice, 365 days));
    }
    
    function test_IsRecentlyVerified_False_ForNonVerified() public {
        assertFalse(zeroKlue.isRecentlyVerified(alice, 365 days));
    }
    
    function test_IsExpiringSoon() public {
        vm.prank(alice);
        zeroKlue.verifyAndMint(sampleProof, samplePublicInputs);
        
        // Not expiring at day 300 (window starts at day 335 for 365-day expiry with 30-day warning)
        vm.warp(block.timestamp + 300 days);
        assertFalse(zeroKlue.isExpiringSoon(alice, 365 days, 30 days));
        
        // Expiring at day 340
        vm.warp(block.timestamp + 40 days); // Now at 340 days total
        assertTrue(zeroKlue.isExpiringSoon(alice, 365 days, 30 days));
        
        // Past expiry at day 370
        vm.warp(block.timestamp + 30 days); // Now at 370 days total
        assertFalse(zeroKlue.isExpiringSoon(alice, 365 days, 30 days));
    }
    
    // ============ NFT Compatibility Tests ============
    
    function test_BalanceOf() public {
        assertEq(zeroKlue.balanceOf(alice), 0);
        
        vm.prank(alice);
        zeroKlue.verifyAndMint(sampleProof, samplePublicInputs);
        
        assertEq(zeroKlue.balanceOf(alice), 1);
    }
    
    function test_TransferFrom_Reverts() public {
        vm.prank(alice);
        zeroKlue.verifyAndMint(sampleProof, samplePublicInputs);
        
        vm.expectRevert("Soulbound: cannot transfer");
        zeroKlue.transferFrom(alice, bob, 0);
    }
    
    // ============ Admin Tests ============
    
    function test_RevokeVerification_OnlyOwner() public {
        vm.prank(alice);
        zeroKlue.verifyAndMint(sampleProof, samplePublicInputs);
        
        // Non-owner cannot revoke
        vm.expectRevert();
        vm.prank(bob);
        zeroKlue.revokeVerification(alice);
        
        // Owner can revoke
        zeroKlue.revokeVerification(alice);
        assertFalse(zeroKlue.isVerified(alice));
        assertEq(zeroKlue.totalVerified(), 0);
    }
    
    function test_RevokeVerification_NotVerified() public {
        vm.expectRevert("Not verified");
        zeroKlue.revokeVerification(alice);
    }
    
    // ============ Multi-User Tests ============
    
    function test_MultipleUsers() public {
        // Alice verifies
        vm.prank(alice);
        zeroKlue.verifyAndMint(sampleProof, samplePublicInputs);
        
        // Bob verifies with different ephemeral key
        bytes32[] memory bobInputs = _cloneInputsWithNewEphemeralKey(0x123456);
        vm.prank(bob);
        zeroKlue.verifyAndMint(sampleProof, bobInputs);
        
        // Charlie verifies with different ephemeral key
        bytes32[] memory charlieInputs = _cloneInputsWithNewEphemeralKey(0x789ABC);
        vm.prank(charlie);
        zeroKlue.verifyAndMint(sampleProof, charlieInputs);
        
        assertEq(zeroKlue.totalVerified(), 3);
        assertTrue(zeroKlue.isVerified(alice));
        assertTrue(zeroKlue.isVerified(bob));
        assertTrue(zeroKlue.isVerified(charlie));
    }
    
    // ============ Edge Cases ============
    
    function test_GetVerification_NotVerified() public {
        vm.expectRevert("Not verified");
        zeroKlue.getVerification(alice);
    }
    
    function testFuzz_EphemeralKeyUniqueness(uint256 key1, uint256 key2) public {
        vm.assume(key1 != key2);
        
        bytes32[] memory inputs1 = _cloneInputsWithNewEphemeralKey(key1);
        bytes32[] memory inputs2 = _cloneInputsWithNewEphemeralKey(key2);
        
        vm.prank(alice);
        zeroKlue.verifyAndMint(sampleProof, inputs1);
        
        vm.prank(bob);
        zeroKlue.verifyAndMint(sampleProof, inputs2);
        
        assertTrue(zeroKlue.isVerified(alice));
        assertTrue(zeroKlue.isVerified(bob));
    }
    
    // ============ Helper Functions ============
    
    function _cloneInputsWithNewEphemeralKey(uint256 newKey) internal view returns (bytes32[] memory) {
        bytes32[] memory newInputs = new bytes32[](85);
        for (uint256 i = 0; i < 85; i++) {
            newInputs[i] = samplePublicInputs[i];
        }
        newInputs[83] = bytes32(newKey); // New ephemeral pubkey
        newInputs[84] = bytes32(uint256(block.timestamp + 3600)); // Valid expiry
        return newInputs;
    }
}
