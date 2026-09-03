// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/ReddAgent.sol";

contract ReddAgentTest is Test {
    ReddAgent a;
    address user = address(0x001);
    address user2 = address(0x002);

    function setUp() public {
        a = new ReddAgent(); // deployer = owner = authority
    }

    function test_mint_one_per_address() public {
        vm.prank(user);
        uint256 id = a.mint();
        assertEq(id, 1);
        assertEq(a.agentOf(user), 1);
        vm.prank(user);
        vm.expectRevert(bytes("REDD: already minted"));
        a.mint();
    }

    function test_memoryRoot_owner_only() public {
        vm.prank(user);
        uint256 id = a.mint();
        vm.prank(user);
        a.setMemoryRoot(id, bytes32(uint256(0xABCD)));
        assertEq(a.memoryRoot(id), bytes32(uint256(0xABCD)));
        vm.prank(user2);
        vm.expectRevert(bytes("REDD: not agent owner"));
        a.setMemoryRoot(id, bytes32(uint256(0x1)));
    }

    function test_tier_and_karma_authority_only() public {
        vm.prank(user);
        uint256 id = a.mint();
        a.setTier(id, ReddAgent.Tier.Silver);
        assertEq(uint256(a.tierOf(id)), uint256(ReddAgent.Tier.Silver));
        a.bumpKarma(id, 5);
        a.bumpKarma(id, 3);
        assertEq(a.karmaOf(id), 8);
        vm.prank(user);
        vm.expectRevert();
        a.bumpKarma(id, 100);
    }

    function test_soulbound_transfer_reverts() public {
        vm.prank(user);
        uint256 id = a.mint();
        vm.prank(user);
        vm.expectRevert(bytes("REDD: soulbound"));
        a.transferFrom(user, user2, id);
    }
}
