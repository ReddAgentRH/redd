// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/ReddToken.sol";

contract ReddTokenTest is Test {
    ReddToken t;
    address treasury = address(0xBEEF);

    function setUp() public {
        t = new ReddToken(treasury);
    }

    function test_metadata() public {
        assertEq(t.name(), "REDD");
        assertEq(t.symbol(), "REDD");
        assertEq(t.decimals(), 18);
    }

    function test_supply_minted_to_treasury() public {
        assertEq(t.totalSupply(), 1_000_000_000e18);
        assertEq(t.balanceOf(treasury), 1_000_000_000e18);
    }
}
