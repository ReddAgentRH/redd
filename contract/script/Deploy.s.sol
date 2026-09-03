// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/ReddAgent.sol";
import "../src/ReddCredits.sol";

/// @notice Deploys REDD's on-chain layer. $REDD fair-launches on pons (plain ERC-20);
/// ReddToken.sol is NOT deployed. Tokenomics:
///   - creator fee (pons 2%) -> shared to $REDD holders, handled natively by pons
///     (set the creator-fee-to-holders option at launch; holders claim from their pons profile)
///   - usage revenue (X402 API calls) -> ReddCredits.treasury -> funds long-term REDD build
///   - tier/flair is hold-based (read off-chain from $REDD balance) -> no staking contract
contract Deploy is Script {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(pk);
        address redd = vm.envAddress("REDD");
        address treasury = vm.envOr("TREASURY", deployer);

        vm.startBroadcast(pk);
        ReddAgent agent = new ReddAgent();
        ReddCredits credits = new ReddCredits(redd, treasury);
        vm.stopBroadcast();

        console.log("REDD (pons) :", redd);
        console.log("ReddAgent   :", address(agent));
        console.log("ReddCredits :", address(credits));
        console.log("treasury    :", treasury);
        console.log("--- wire: REDD_ADDR_AGENT + REDD_ADDR_CREDITS ---");
        console.log("--- on pons: enable creator-fee-to-holders (2%) so holders claim from profile ---");
    }
}
