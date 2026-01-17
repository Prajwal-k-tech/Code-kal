//SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "./DeployHelpers.s.sol";
import {HonkVerifier} from "../contracts/HonkVerifier.sol";
import {ZeroKlue} from "../contracts/ZeroKlue.sol";

/**
 * @notice Deploys ZeroKlue student verification system
 * @dev Deploys HonkVerifier first, then ZeroKlue with verifier address
 * 
 * Run with:
 *   yarn deploy --file DeployZeroKlue.s.sol
 * 
 * Or on specific network:
 *   yarn deploy --file DeployZeroKlue.s.sol --network sepolia
 */
contract DeployZeroKlue is ScaffoldETHDeploy {
    function run() external ScaffoldEthDeployerRunner {
        // 1. Deploy HonkVerifier (the ZK proof verifier)
        HonkVerifier verifier = new HonkVerifier();
        console.log("HonkVerifier deployed at:", address(verifier));
        deployments.push(Deployment("HonkVerifier", address(verifier)));

        // 2. Deploy ZeroKlue (the NFT + verification contract)
        ZeroKlue zeroKlue = new ZeroKlue(address(verifier));
        console.log("ZeroKlue deployed at:", address(zeroKlue));
        deployments.push(Deployment("ZeroKlue", address(zeroKlue)));
    }
}
