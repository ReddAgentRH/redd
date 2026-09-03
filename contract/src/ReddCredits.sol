// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/// @notice Prepaid $REDD escrow for REDD X402. A user tops up $REDD once, then
/// each metered API call is settled by a per-call voucher the USER signs. The
/// facilitator only relays vouchers — it can never debit more than the user
/// signed, and the user can withdraw unused credit at any time (non-custodial).
/// This is why REDD X402 works with the plain pons $REDD token (no EIP-3009).
contract ReddCredits is EIP712, Ownable {
    IERC20 public immutable token;   // $REDD (pons)
    address public treasury;         // where debited usage revenue settles (build fund)
    address public constant BURN = 0x000000000000000000000000000000000000dEaD;
    uint256 public constant BURN_BPS = 3000; // 30% of every paid call is burned; 70% -> treasury

    mapping(address => uint256) public credit;                      // prepaid balance
    mapping(address => mapping(uint256 => bool)) public voucherUsed; // user => nonce => used

    bytes32 public constant VOUCHER_TYPEHASH =
        keccak256("Voucher(address user,uint256 amount,uint256 nonce)");

    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);
    event Debit(address indexed user, uint256 amount, uint256 nonce);

    constructor(address token_, address treasury_) EIP712("REDD Credits", "1") Ownable(msg.sender) {
        token = IERC20(token_);
        treasury = treasury_;
    }

    function balanceOf(address user) external view returns (uint256) {
        return credit[user];
    }

    /// @notice Top up credit. Caller must have approved this contract for `amount`.
    function deposit(uint256 amount) external {
        require(amount > 0, "REDD: zero deposit");
        credit[msg.sender] += amount;
        require(token.transferFrom(msg.sender, address(this), amount), "REDD: deposit failed");
        emit Deposit(msg.sender, amount);
    }

    /// @notice Pull back unused credit at any time.
    function withdraw(uint256 amount) external {
        require(credit[msg.sender] >= amount, "REDD: insufficient credit");
        credit[msg.sender] -= amount;
        require(token.transfer(msg.sender, amount), "REDD: withdraw failed");
        emit Withdraw(msg.sender, amount);
    }

    /// @notice Settle one API call: anyone (the facilitator) may relay a voucher the
    /// user signed. Funds move from the user's credit to the treasury.
    function debit(
        address user,
        uint256 amount,
        uint256 nonce,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external {
        require(!voucherUsed[user][nonce], "REDD: voucher used");
        require(credit[user] >= amount, "REDD: insufficient credit");

        bytes32 structHash = keccak256(abi.encode(VOUCHER_TYPEHASH, user, amount, nonce));
        address signer = ECDSA.recover(_hashTypedDataV4(structHash), v, r, s);
        require(signer == user, "REDD: bad voucher signature");

        voucherUsed[user][nonce] = true;
        credit[user] -= amount;
        uint256 toBurn = amount * BURN_BPS / 10000; // 30% burned
        uint256 toTreasury = amount - toBurn;        // 70% funds the build
        require(token.transfer(treasury, toTreasury), "REDD: settle failed");
        require(token.transfer(BURN, toBurn), "REDD: burn failed");
        emit Debit(user, amount, nonce);
    }

    function setTreasury(address t) external onlyOwner {
        treasury = t;
    }
}
