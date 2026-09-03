// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/// @notice REDD: ERC-20 with EIP-3009 transferWithAuthorization so it can be
/// the settlement token for x402 micropayments (REDD X402) without migration.
contract ReddToken is ERC20, EIP712 {
    bytes32 public constant TRANSFER_WITH_AUTHORIZATION_TYPEHASH = keccak256(
        "TransferWithAuthorization(address from,address to,uint256 value,uint256 validAfter,uint256 validBefore,bytes32 nonce)"
    );

    // authorizer => nonce => used
    mapping(address => mapping(bytes32 => bool)) private _authStates;

    constructor(address treasury) ERC20("REDD", "REDD") EIP712("REDD", "1") {
        _mint(treasury, 1_000_000_000e18);
    }

    function authorizationState(address authorizer, bytes32 nonce) external view returns (bool) {
        return _authStates[authorizer][nonce];
    }

    function transferWithAuthorization(
        address from,
        address to,
        uint256 value,
        uint256 validAfter,
        uint256 validBefore,
        bytes32 nonce,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external {
        require(block.timestamp > validAfter, "REDD: authorization not yet valid");
        require(block.timestamp < validBefore, "REDD: authorization expired");
        require(!_authStates[from][nonce], "REDD: authorization used");

        bytes32 structHash = keccak256(
            abi.encode(TRANSFER_WITH_AUTHORIZATION_TYPEHASH, from, to, value, validAfter, validBefore, nonce)
        );
        bytes32 digest = _hashTypedDataV4(structHash);
        address signer = ECDSA.recover(digest, v, r, s);
        require(signer == from, "REDD: invalid signature");

        _authStates[from][nonce] = true;
        _transfer(from, to, value);
    }
}
