//SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "./DeployHelpers.s.sol";
import {ZeroKlue} from "../contracts/ZeroKlue.sol";
import {HonkVerifier} from "../contracts/HonkVerifier.sol";

/**
 * @notice Deploys the Honk proof verifier and ZeroKlue registry
 */
contract DeployZeroKlue is ScaffoldETHDeploy {
    function run() external ScaffoldEthDeployerRunner {
        HonkVerifier verifier = new HonkVerifier();
        ZeroKlue zeroKlue = new ZeroKlue(address(verifier));
        console.log("ZeroKlue deployed at:", address(zeroKlue));
        deployments.push(Deployment("ZeroKlue", address(zeroKlue)));
    }
}
