//SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "./DeployHelpers.s.sol";
import {ZeroKlue} from "../contracts/ZeroKlue.sol";

/**
 * @notice Deploys ZeroKlue student verification system (simplified)
 * @dev Client-side verification model - no HonkVerifier needed
 */
contract DeployZeroKlue is ScaffoldETHDeploy {
    function run() external ScaffoldEthDeployerRunner {
        // Deploy ZeroKlue (simple attestation contract)
        ZeroKlue zeroKlue = new ZeroKlue();
        console.log("ZeroKlue deployed at:", address(zeroKlue));
        deployments.push(Deployment("ZeroKlue", address(zeroKlue)));
    }
}
