// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/ReddToken.sol";

contract ReddToken3009Test is Test {
    ReddToken t;
    uint256 fromPk = 0xA11CE;
    address from;
    address to = address(0xD00D);

    bytes32 constant TYPEHASH = keccak256(
        "TransferWithAuthorization(address from,address to,uint256 value,uint256 validAfter,uint256 validBefore,bytes32 nonce)"
    );

    function setUp() public {
        from = vm.addr(fromPk);
        t = new ReddToken(from); // give `from` the full supply
    }

    function _domainSeparator() internal view returns (bytes32) {
        return keccak256(abi.encode(
            keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
            keccak256(bytes("REDD")),
            keccak256(bytes("1")),
            block.chainid,
            address(t)
        ));
    }

    function _sign(uint256 value, uint256 va, uint256 vb, bytes32 nonce)
        internal view returns (uint8 v, bytes32 r, bytes32 s)
    {
        bytes32 structHash = keccak256(abi.encode(TYPEHASH, from, to, value, va, vb, nonce));
        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", _domainSeparator(), structHash));
        (v, r, s) = vm.sign(fromPk, digest);
    }

    function test_transferWithAuthorization_moves_funds() public {
        uint256 value = 1_000e18;
        bytes32 nonce = keccak256("n1");
        (uint8 v, bytes32 r, bytes32 s) = _sign(value, 0, type(uint256).max, nonce);

        t.transferWithAuthorization(from, to, value, 0, type(uint256).max, nonce, v, r, s);

        assertEq(t.balanceOf(to), value);
        assertTrue(t.authorizationState(from, nonce));
    }

    function test_replay_reverts() public {
        uint256 value = 5e18;
        bytes32 nonce = keccak256("n2");
        (uint8 v, bytes32 r, bytes32 s) = _sign(value, 0, type(uint256).max, nonce);
        t.transferWithAuthorization(from, to, value, 0, type(uint256).max, nonce, v, r, s);
        vm.expectRevert(bytes("REDD: authorization used"));
        t.transferWithAuthorization(from, to, value, 0, type(uint256).max, nonce, v, r, s);
    }

    function test_expired_reverts() public {
        uint256 value = 5e18;
        bytes32 nonce = keccak256("n3");
        uint256 vb = block.timestamp; // validBefore = now -> not before now
        (uint8 v, bytes32 r, bytes32 s) = _sign(value, 0, vb, nonce);
        vm.warp(block.timestamp + 1);
        vm.expectRevert(bytes("REDD: authorization expired"));
        t.transferWithAuthorization(from, to, value, 0, vb, nonce, v, r, s);
    }
}
