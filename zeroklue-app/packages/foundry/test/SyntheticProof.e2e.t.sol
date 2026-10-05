// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import { Test } from "forge-std/Test.sol";
import { HonkVerifier } from "../contracts/HonkVerifier.sol";
import { ZeroKlue } from "../contracts/ZeroKlue.sol";

contract SyntheticProofE2ETest is Test {
    function testGeneratedJwtProofIsAcceptedBySolidityVerifierAndRegistry() public {
        string memory fixture = vm.readFile("test/fixtures/synthetic-proof.json");
        bytes memory proof = vm.parseJsonBytes(fixture, ".proof");
        bytes32[] memory inputs = vm.parseJsonBytes32Array(fixture, ".publicInputs");
        assertEq(inputs.length, 167);

        bytes32[18] memory keyLimbs;
        for (uint256 i; i < keyLimbs.length; ++i) keyLimbs[i] = inputs[i];

        bytes32[64] memory domainBytes;
        for (uint256 i; i < domainBytes.length; ++i) domainBytes[i] = inputs[18 + i];

        bytes32[80] memory audienceBytes;
        for (uint256 i; i < audienceBytes.length; ++i) audienceBytes[i] = inputs[83 + i];

        vm.warp(uint256(inputs[165]) - 1);
        HonkVerifier verifier = new HonkVerifier();
        ZeroKlue registry = new ZeroKlue(address(verifier));
        registry.setTrustedJwtKey(keyLimbs, true);
        registry.setApprovedDomain(domainBytes, true);
        registry.setApprovedAudience(audienceBytes, uint256(inputs[163]), true);

        address student = address(0xA11CE);
        vm.prank(student);
        registry.registerStudent(proof, inputs);

        assertTrue(registry.isVerified(student));
        assertEq(registry.totalVerified(), 1);
    }
}
