// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import {Test, console} from "forge-std/Test.sol";
import {ZeroKlue} from "../contracts/ZeroKlue.sol";

/**
 * @title ZeroKlue Test Suite (Simplified)
 * @notice Tests for the ZeroKlue student verification contract with client-side verification model
 */
contract MockZeroKlueVerifier {
    function verify(bytes calldata proof, bytes32[] calldata) external pure returns (bool) {
        return keccak256(proof) == keccak256(hex"01");
    }
}

contract ZeroKlueTest is Test {
    ZeroKlue public zeroKlue;
    MockZeroKlueVerifier public verifier;
    
    address public alice = address(0x1);
    address public bob = address(0x2);
    
    bytes32 public sampleEphemeralKey1 = bytes32(uint256(0xABCDEF123456));
    bytes32 public sampleEphemeralKey2 = bytes32(uint256(0xFEDCBA654321));
    bytes32 public sampleEphemeralKey3 = bytes32(uint256(0x112233445566));
    
    function setUp() public {
        verifier = new MockZeroKlueVerifier();
        zeroKlue = new ZeroKlue(address(verifier));
        zeroKlue.setTrustedJwtKey(_keyLimbs(), true);
        zeroKlue.setApprovedDomain(_domainBytes(), true);
        zeroKlue.setApprovedAudience(_audienceBytes(), _audienceLength(), true);
    }

    function _proof() internal pure returns (bytes memory) {
        return hex"01";
    }

    function _publicInputs(bytes32 ephemeralKey) internal view returns (bytes32[] memory inputs) {
        inputs = new bytes32[](167);
        bytes32[18] memory key = _keyLimbs();
        bytes32[64] memory domain = _domainBytes();
        bytes32[80] memory audience = _audienceBytes();
        for (uint256 i = 0; i < 18; i++) inputs[i] = key[i];
        for (uint256 i = 0; i < 64; i++) inputs[18 + i] = domain[i];
        inputs[82] = bytes32(uint256(bytes("iiitkottayam.ac.in").length));
        for (uint256 i = 0; i < 80; i++) inputs[83 + i] = audience[i];
        inputs[163] = bytes32(uint256(bytes("123456789012-example.apps.googleusercontent.com").length));
        inputs[164] = ephemeralKey;
        inputs[165] = bytes32(block.timestamp + 1 days);
        inputs[166] = bytes32(block.timestamp + 1 hours);
    }

    function _keyLimbs() internal pure returns (bytes32[18] memory key) {
        for (uint256 i = 0; i < 18; i++) key[i] = bytes32(i + 1);
    }

    function _domainBytes() internal pure returns (bytes32[64] memory domain) {
        bytes memory text = bytes("iiitkottayam.ac.in");
        for (uint256 i = 0; i < text.length; i++) domain[i] = bytes32(uint256(uint8(text[i])));
    }

    function _audienceBytes() internal pure returns (bytes32[80] memory audience) {
        bytes memory text = bytes("123456789012-example.apps.googleusercontent.com");
        for (uint256 i = 0; i < text.length; i++) audience[i] = bytes32(uint256(uint8(text[i])));
    }

    function _audienceLength() internal pure returns (uint256) {
        return bytes("123456789012-example.apps.googleusercontent.com").length;
    }

    function _register(address student, bytes32 ephemeralKey) internal {
        vm.prank(student);
        zeroKlue.registerStudent(_proof(), _publicInputs(ephemeralKey));
    }

    // ============ Registration Tests ============

    function test_RegisterStudent_Success() public {
        _register(alice, sampleEphemeralKey1);
        
        assertTrue(zeroKlue.isVerified(alice));
        assertEq(zeroKlue.balanceOf(alice), 1);
        assertEq(zeroKlue.totalVerified(), 1);
    }

    function test_RegisterStudent_EmitsEvent() public {
        vm.expectEmit(true, false, false, true);
        emit ZeroKlue.StudentVerified(alice, sampleEphemeralKey1, block.timestamp);
        _register(alice, sampleEphemeralKey1);
    }

    function test_RegisterStudent_StoresCorrectData() public {
        _register(alice, sampleEphemeralKey1);
        
        (uint256 verifiedAt, bytes32 ephemeralPubkey, uint256 age) = zeroKlue.getVerification(alice);
        
        assertEq(verifiedAt, block.timestamp);
        assertEq(ephemeralPubkey, sampleEphemeralKey1);
        assertEq(age, 0);
    }

    function test_RegisterStudent_RejectsReusedEphemeralKey() public {
        _register(alice, sampleEphemeralKey1);
        
        vm.prank(bob);
        vm.expectRevert("Ephemeral key already used");
        zeroKlue.registerStudent(_proof(), _publicInputs(sampleEphemeralKey1));
    }

    function test_RegisterStudent_RejectsInvalidProof() public {
        bytes32[] memory inputs = _publicInputs(sampleEphemeralKey1);
        vm.prank(alice);
        vm.expectRevert("Invalid proof");
        zeroKlue.registerStudent(hex"02", inputs);
    }

    function test_RegisterStudent_RejectsExpiredKey() public {
        bytes32[] memory inputs = _publicInputs(sampleEphemeralKey1);
        inputs[165] = bytes32(block.timestamp);
        vm.prank(alice);
        vm.expectRevert("Ephemeral key expired");
        zeroKlue.registerStudent(_proof(), inputs);
    }

    function test_RegisterStudent_RejectsExpiredJwt() public {
        bytes32[] memory inputs = _publicInputs(sampleEphemeralKey1);
        inputs[166] = bytes32(block.timestamp);
        vm.prank(alice);
        vm.expectRevert("JWT expired");
        zeroKlue.registerStudent(_proof(), inputs);
    }

    function test_RegisterStudent_RejectsUntrustedJwtKey() public {
        bytes32[] memory inputs = _publicInputs(sampleEphemeralKey1);
        inputs[0] = bytes32(uint256(99));
        vm.prank(alice);
        vm.expectRevert("Untrusted JWT signing key");
        zeroKlue.registerStudent(_proof(), inputs);
    }

    function test_RegisterStudent_RejectsUnapprovedDomain() public {
        bytes32[] memory inputs = _publicInputs(sampleEphemeralKey1);
        inputs[18] = bytes32(uint256(uint8(bytes1("x"))));
        vm.prank(alice);
        vm.expectRevert("Unapproved organization domain");
        zeroKlue.registerStudent(_proof(), inputs);
    }

    function test_RegisterStudent_RejectsUnapprovedAudience() public {
        bytes32[] memory inputs = _publicInputs(sampleEphemeralKey1);
        inputs[83] = bytes32(uint256(uint8(bytes1("x"))));
        vm.prank(alice);
        vm.expectRevert("Unapproved OAuth audience");
        zeroKlue.registerStudent(_proof(), inputs);
    }

    function test_RegisterStudent_RejectsInvalidDomainLength() public {
        bytes32[] memory inputs = _publicInputs(sampleEphemeralKey1);
        inputs[82] = bytes32(uint256(65));
        vm.prank(alice);
        vm.expectRevert("Invalid domain length");
        zeroKlue.registerStudent(_proof(), inputs);
    }

    function test_RegisterStudent_RejectsInvalidAudienceLength() public {
        bytes32[] memory inputs = _publicInputs(sampleEphemeralKey1);
        inputs[163] = bytes32(uint256(81));
        vm.prank(alice);
        vm.expectRevert("Invalid audience length");
        zeroKlue.registerStudent(_proof(), inputs);
    }

    function test_RegisterStudent_RejectsWrongPublicInputCount() public {
        vm.prank(alice);
        vm.expectRevert("Invalid public input count");
        zeroKlue.registerStudent(_proof(), new bytes32[](166));
    }

    function test_Reverification_UpdatesTimestamp() public {
        // First registration
        _register(alice, sampleEphemeralKey1);
        
        // Time passes
        vm.warp(block.timestamp + 30 days);
        
        // Re-registration with new key
        _register(alice, sampleEphemeralKey2);
        
        (uint256 verifiedAt, bytes32 ephemeralPubkey, ) = zeroKlue.getVerification(alice);
        assertEq(verifiedAt, block.timestamp);
        assertEq(ephemeralPubkey, sampleEphemeralKey2);
        
        // Total should still be 1 (reverification, not new)
        assertEq(zeroKlue.totalVerified(), 1);
    }

    // ============ View Function Tests ============

    function test_IsVerified() public {
        assertFalse(zeroKlue.isVerified(alice));
        
        _register(alice, sampleEphemeralKey1);
        
        assertTrue(zeroKlue.isVerified(alice));
    }

    function test_IsRecentlyVerified_True() public {
        _register(alice, sampleEphemeralKey1);
        
        assertTrue(zeroKlue.isRecentlyVerified(alice, 365 days));
    }

    function test_IsRecentlyVerified_False_AfterExpiry() public {
        _register(alice, sampleEphemeralKey1);
        
        // Time passes beyond maxAge
        vm.warp(block.timestamp + 366 days);
        
        assertFalse(zeroKlue.isRecentlyVerified(alice, 365 days));
    }

    function test_BalanceOf() public {
        assertEq(zeroKlue.balanceOf(alice), 0);
        
        _register(alice, sampleEphemeralKey1);
        
        assertEq(zeroKlue.balanceOf(alice), 1);
    }

    function test_TransferFrom_Reverts() public {
        vm.expectRevert("Soulbound: cannot transfer");
        zeroKlue.transferFrom(alice, bob, 1);
    }

    function test_MultipleUsers() public {
        _register(alice, sampleEphemeralKey1);
        
        _register(bob, sampleEphemeralKey2);
        
        assertTrue(zeroKlue.isVerified(alice));
        assertTrue(zeroKlue.isVerified(bob));
        assertEq(zeroKlue.totalVerified(), 2);
    }

    // ============ Admin Tests ============

    function test_RevokeVerification() public {
        _register(alice, sampleEphemeralKey1);
        
        assertTrue(zeroKlue.isVerified(alice));
        
        zeroKlue.revokeVerification(alice);
        
        assertFalse(zeroKlue.isVerified(alice));
    }

    function test_RevokeVerification_OnlyOwner() public {
        _register(alice, sampleEphemeralKey1);
        
        vm.prank(bob);
        vm.expectRevert();
        zeroKlue.revokeVerification(alice);
    }

    function test_TrustConfiguration_OnlyOwner() public {
        bytes32[18] memory key = _keyLimbs();
        vm.prank(bob);
        vm.expectRevert();
        zeroKlue.setTrustedJwtKey(key, false);
    }

    function test_AudienceConfiguration_OnlyOwner() public {
        vm.prank(bob);
        vm.expectRevert();
        zeroKlue.setApprovedAudience(_audienceBytes(), _audienceLength(), false);
    }
}
