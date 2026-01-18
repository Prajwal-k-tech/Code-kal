// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import {Test, console} from "forge-std/Test.sol";
import {ZeroKlue} from "../contracts/ZeroKlue.sol";

/**
 * @title ZeroKlue Test Suite (Simplified)
 * @notice Tests for the ZeroKlue student verification contract with client-side verification model
 */
contract ZeroKlueTest is Test {
    ZeroKlue public zeroKlue;
    
    address public alice = address(0x1);
    address public bob = address(0x2);
    
    bytes32 public sampleEphemeralKey1 = bytes32(uint256(0xABCDEF123456));
    bytes32 public sampleEphemeralKey2 = bytes32(uint256(0xFEDCBA654321));
    bytes32 public sampleEphemeralKey3 = bytes32(uint256(0x112233445566));
    
    function setUp() public {
        zeroKlue = new ZeroKlue();
    }

    // ============ Registration Tests ============

    function test_RegisterStudent_Success() public {
        vm.prank(alice);
        zeroKlue.registerStudent(sampleEphemeralKey1);
        
        assertTrue(zeroKlue.isVerified(alice));
        assertEq(zeroKlue.balanceOf(alice), 1);
        assertEq(zeroKlue.totalVerified(), 1);
    }

    function test_RegisterStudent_EmitsEvent() public {
        vm.prank(alice);
        vm.expectEmit(true, false, false, true);
        emit ZeroKlue.StudentVerified(alice, sampleEphemeralKey1, block.timestamp);
        zeroKlue.registerStudent(sampleEphemeralKey1);
    }

    function test_RegisterStudent_StoresCorrectData() public {
        vm.prank(alice);
        zeroKlue.registerStudent(sampleEphemeralKey1);
        
        (uint256 verifiedAt, bytes32 ephemeralPubkey, uint256 age) = zeroKlue.getVerification(alice);
        
        assertEq(verifiedAt, block.timestamp);
        assertEq(ephemeralPubkey, sampleEphemeralKey1);
        assertEq(age, 0);
    }

    function test_RegisterStudent_RejectsReusedEphemeralKey() public {
        vm.prank(alice);
        zeroKlue.registerStudent(sampleEphemeralKey1);
        
        vm.prank(bob);
        vm.expectRevert("Ephemeral key already used");
        zeroKlue.registerStudent(sampleEphemeralKey1);
    }

    function test_Reverification_UpdatesTimestamp() public {
        // First registration
        vm.prank(alice);
        zeroKlue.registerStudent(sampleEphemeralKey1);
        
        // Time passes
        vm.warp(block.timestamp + 30 days);
        
        // Re-registration with new key
        vm.prank(alice);
        zeroKlue.registerStudent(sampleEphemeralKey2);
        
        (uint256 verifiedAt, bytes32 ephemeralPubkey, ) = zeroKlue.getVerification(alice);
        assertEq(verifiedAt, block.timestamp);
        assertEq(ephemeralPubkey, sampleEphemeralKey2);
        
        // Total should still be 1 (reverification, not new)
        assertEq(zeroKlue.totalVerified(), 1);
    }

    // ============ View Function Tests ============

    function test_IsVerified() public {
        assertFalse(zeroKlue.isVerified(alice));
        
        vm.prank(alice);
        zeroKlue.registerStudent(sampleEphemeralKey1);
        
        assertTrue(zeroKlue.isVerified(alice));
    }

    function test_IsRecentlyVerified_True() public {
        vm.prank(alice);
        zeroKlue.registerStudent(sampleEphemeralKey1);
        
        assertTrue(zeroKlue.isRecentlyVerified(alice, 365 days));
    }

    function test_IsRecentlyVerified_False_AfterExpiry() public {
        vm.prank(alice);
        zeroKlue.registerStudent(sampleEphemeralKey1);
        
        // Time passes beyond maxAge
        vm.warp(block.timestamp + 366 days);
        
        assertFalse(zeroKlue.isRecentlyVerified(alice, 365 days));
    }

    function test_BalanceOf() public {
        assertEq(zeroKlue.balanceOf(alice), 0);
        
        vm.prank(alice);
        zeroKlue.registerStudent(sampleEphemeralKey1);
        
        assertEq(zeroKlue.balanceOf(alice), 1);
    }

    function test_TransferFrom_Reverts() public {
        vm.expectRevert("Soulbound: cannot transfer");
        zeroKlue.transferFrom(alice, bob, 1);
    }

    function test_MultipleUsers() public {
        vm.prank(alice);
        zeroKlue.registerStudent(sampleEphemeralKey1);
        
        vm.prank(bob);
        zeroKlue.registerStudent(sampleEphemeralKey2);
        
        assertTrue(zeroKlue.isVerified(alice));
        assertTrue(zeroKlue.isVerified(bob));
        assertEq(zeroKlue.totalVerified(), 2);
    }

    // ============ Admin Tests ============

    function test_RevokeVerification() public {
        vm.prank(alice);
        zeroKlue.registerStudent(sampleEphemeralKey1);
        
        assertTrue(zeroKlue.isVerified(alice));
        
        zeroKlue.revokeVerification(alice);
        
        assertFalse(zeroKlue.isVerified(alice));
    }

    function test_RevokeVerification_OnlyOwner() public {
        vm.prank(alice);
        zeroKlue.registerStudent(sampleEphemeralKey1);
        
        vm.prank(bob);
        vm.expectRevert();
        zeroKlue.revokeVerification(alice);
    }
}
