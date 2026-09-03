// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/ReddToken.sol";
import "../src/ReddCredits.sol";

contract ReddCreditsTest is Test {
    ReddToken redd;
    ReddCredits credits;
    uint256 userPk = 0xA11CE;
    address user;
    address treasury = address(0x715A);

    bytes32 constant VOUCHER_TYPEHASH =
        keccak256("Voucher(address user,uint256 amount,uint256 nonce)");

    function setUp() public {
        user = vm.addr(userPk);
        redd = new ReddToken(user);          // user holds the whole supply
        credits = new ReddCredits(address(redd), treasury);
        vm.prank(user);
        redd.approve(address(credits), type(uint256).max);
    }

    function _domainSeparator() internal view returns (bytes32) {
        return keccak256(abi.encode(
            keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
            keccak256(bytes("REDD Credits")),
            keccak256(bytes("1")),
            block.chainid,
            address(credits)
        ));
    }

    function _sign(uint256 amount, uint256 nonce) internal view returns (uint8 v, bytes32 r, bytes32 s) {
        bytes32 structHash = keccak256(abi.encode(VOUCHER_TYPEHASH, user, amount, nonce));
        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", _domainSeparator(), structHash));
        (v, r, s) = vm.sign(userPk, digest);
    }

    function test_deposit_and_withdraw() public {
        vm.prank(user);
        credits.deposit(1_000e18);
        assertEq(credits.balanceOf(user), 1_000e18);
        assertEq(redd.balanceOf(address(credits)), 1_000e18);

        vm.prank(user);
        credits.withdraw(400e18);
        assertEq(credits.balanceOf(user), 600e18);
    }

    function test_debit_with_user_voucher_settles_to_treasury() public {
        vm.prank(user);
        credits.deposit(500e18);

        uint256 amount = 16e18; // e.g. execute_swap price
        uint256 nonce = 1;
        (uint8 v, bytes32 r, bytes32 s) = _sign(amount, nonce);

        // relayed by a random facilitator, not the user
        vm.prank(address(0xFACE));
        credits.debit(user, amount, nonce, v, r, s);

        assertEq(credits.balanceOf(user), 500e18 - amount);
        assertEq(redd.balanceOf(treasury), amount * 70 / 100);                 // 70% -> treasury
        assertEq(redd.balanceOf(0x000000000000000000000000000000000000dEaD), amount * 30 / 100); // 30% burned
        assertTrue(credits.voucherUsed(user, nonce));
    }

    function test_replay_reverts() public {
        vm.prank(user);
        credits.deposit(500e18);
        (uint8 v, bytes32 r, bytes32 s) = _sign(10e18, 7);
        credits.debit(user, 10e18, 7, v, r, s);
        vm.expectRevert(bytes("REDD: voucher used"));
        credits.debit(user, 10e18, 7, v, r, s);
    }

    function test_over_credit_reverts() public {
        vm.prank(user);
        credits.deposit(5e18);
        (uint8 v, bytes32 r, bytes32 s) = _sign(9e18, 3);
        vm.expectRevert(bytes("REDD: insufficient credit"));
        credits.debit(user, 9e18, 3, v, r, s);
    }

    function test_bad_signature_reverts() public {
        vm.prank(user);
        credits.deposit(100e18);
        // sign amount 5 but submit amount 50 -> recovered signer != user
        (uint8 v, bytes32 r, bytes32 s) = _sign(5e18, 2);
        vm.expectRevert(bytes("REDD: bad voucher signature"));
        credits.debit(user, 50e18, 2, v, r, s);
    }
}
