// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @notice Soulbound agent identity. Holds tier, karma (reputation) and the
/// off-chain memory-root commitment. One agent per address. Non-transferable:
/// reputation is earned, not bought.
contract ReddAgent is ERC721, Ownable {
    enum Tier { None, Bronze, Silver, Gold }

    uint256 private _next = 1;
    mapping(address => uint256) private _agentOf;
    mapping(uint256 => bytes32) private _memoryRoot;
    mapping(uint256 => Tier) private _tier;
    mapping(uint256 => uint256) private _karma;

    constructor() ERC721("REDD Agent", "REDDAGENT") Ownable(msg.sender) {}

    function mint() external returns (uint256 tokenId) {
        require(_agentOf[msg.sender] == 0, "REDD: already minted");
        tokenId = _next++;
        _agentOf[msg.sender] = tokenId;
        _safeMint(msg.sender, tokenId);
    }

    function agentOf(address owner) external view returns (uint256) {
        return _agentOf[owner];
    }

    function setMemoryRoot(uint256 tokenId, bytes32 root) external {
        require(ownerOf(tokenId) == msg.sender, "REDD: not agent owner");
        _memoryRoot[tokenId] = root;
    }

    function memoryRoot(uint256 tokenId) external view returns (bytes32) {
        return _memoryRoot[tokenId];
    }

    function setTier(uint256 tokenId, Tier tier) external onlyOwner {
        _requireOwned(tokenId);
        _tier[tokenId] = tier;
    }

    function tierOf(uint256 tokenId) external view returns (Tier) {
        return _tier[tokenId];
    }

    function bumpKarma(uint256 tokenId, uint256 amount) external onlyOwner {
        _requireOwned(tokenId);
        _karma[tokenId] += amount;
    }

    function karmaOf(uint256 tokenId) external view returns (uint256) {
        return _karma[tokenId];
    }

    // Soulbound: block all transfers, allow mint (from == 0) only.
    function _update(address to, uint256 tokenId, address auth)
        internal override returns (address)
    {
        address from = _ownerOf(tokenId);
        require(from == address(0), "REDD: soulbound");
        return super._update(to, tokenId, auth);
    }
}
