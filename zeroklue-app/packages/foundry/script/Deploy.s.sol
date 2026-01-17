//SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "./DeployHelpers.s.sol";
import { DeployZeroKlue } from "./DeployZeroKlue.s.sol";

/**
 * @notice Main deployment script for ZeroKlue
 * @dev Run this when you want to deploy all ZeroKlue contracts
 *
 * Example: yarn deploy # runs this script(without`--file` flag)
 */
contract DeployScript is ScaffoldETHDeploy {
    function run() external {
        // Deploy ZeroKlue (HonkVerifier + ZeroKlue NFT contract)
        DeployZeroKlue deployZeroKlue = new DeployZeroKlue();
        deployZeroKlue.run();
    }
}
