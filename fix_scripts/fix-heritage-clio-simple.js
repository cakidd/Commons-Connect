const fs = require('fs');

console.log('🔧 Creating Simplified HeritageClioSplit (No Inheritance Conflict)');
console.log('================================================================');

try {
    // Create a simplified version that avoids the diamond problem
    const simplifiedContract = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title HeritageClioSplit - Revenue Sharing Contract (Simplified)
 * @notice Automatically splits Heritage NFT revenue: 50% creator, 30% TheClio, 20% platform
 */
contract HeritageClioSplit is ReentrancyGuard, Ownable {
    
    // Revenue split percentages (basis points: 10000 = 100%)
    uint256 public constant CREATOR_SHARE = 5000;     // 50%
    uint256 public constant CLIO_SHARE = 3000;        // 30% 
    uint256 public constant PLATFORM_SHARE = 2000;    // 20%
    
    // Addresses
    address public immutable H4H_CLIO_RESERVE = 0x73fe99e620feeb5834124e6404d27086a857a12d;
    address public platformTreasury;
    
    // Revenue tracking
    mapping(uint256 => uint256) public nftRevenue;        // tokenId => total revenue
    mapping(uint256 => address) public nftCreators;       // tokenId => creator address
    mapping(uint256 => bool) public isClioContent;        // tokenId => is from TheClio
    mapping(address => uint256) public pendingWithdrawals; // address => amount
    
    // Events
    event RevenueReceived(uint256 indexed tokenId, uint256 amount, address sender);
    event RevenueSplit(uint256 indexed tokenId, address creator, uint256 creatorAmount, uint256 clioAmount, uint256 platformAmount);
    event WithdrawalProcessed(address indexed recipient, uint256 amount);
    
    constructor(address _platformTreasury) Ownable(msg.sender) {
        platformTreasury = _platformTreasury;
    }
    
    /**
     * @notice Register NFT for revenue sharing
     * @param tokenId NFT token ID
     * @param creator Creator address
     * @param fromClio Whether content is from TheClio
     */
    function registerNFT(
        uint256 tokenId, 
        address creator, 
        bool fromClio
    ) external onlyOwner {
        nftCreators[tokenId] = creator;
        isClioContent[tokenId] = fromClio;
    }
    
    /**
     * @notice Receive and split revenue for NFT
     * @param tokenId NFT token ID
     */
    function distributeRevenue(uint256 tokenId) external payable nonReentrant {
        require(msg.value > 0, "No revenue to distribute");
        require(nftCreators[tokenId] != address(0), "NFT not registered");
        
        uint256 totalRevenue = msg.value;
        nftRevenue[tokenId] += totalRevenue;
        
        // Calculate shares
        uint256 creatorAmount = (totalRevenue * CREATOR_SHARE) / 10000;
        uint256 clioAmount = isClioContent[tokenId] ? (totalRevenue * CLIO_SHARE) / 10000 : 0;
        uint256 platformAmount = totalRevenue - creatorAmount - clioAmount;
        
        // Add to pending withdrawals
        pendingWithdrawals[nftCreators[tokenId]] += creatorAmount;
        
        if (clioAmount > 0) {
            pendingWithdrawals[H4H_CLIO_RESERVE] += clioAmount;
        }
        
        pendingWithdrawals[platformTreasury] += platformAmount;
        
        emit RevenueReceived(tokenId, totalRevenue, msg.sender);
        emit RevenueSplit(tokenId, nftCreators[tokenId], creatorAmount, clioAmount, platformAmount);
    }
    
    /**
     * @notice Withdraw pending revenue
     */
    function withdraw() external nonReentrant {
        uint256 amount = pendingWithdrawals[msg.sender];
        require(amount > 0, "No pending withdrawals");
        
        pendingWithdrawals[msg.sender] = 0;
        
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Withdrawal failed");
        
        emit WithdrawalProcessed(msg.sender, amount);
    }
    
    /**
     * @notice Get NFT revenue information
     */
    function getNFTInfo(uint256 tokenId) external view returns (
        address creator,
        uint256 totalRevenue,
        bool fromClio
    ) {
        return (
            nftCreators[tokenId],
            nftRevenue[tokenId],
            isClioContent[tokenId]
        );
    }
    
    /**
     * @notice Get pending withdrawal amount
     */
    function getPendingWithdrawal(address account) external view returns (uint256) {
        return pendingWithdrawals[account];
    }
}`;

    // Backup the original
    const originalContent = fs.readFileSync('contracts/HeritageClioSplit.sol', 'utf8');
    fs.writeFileSync('contracts/HeritageClioSplit.sol.backup', originalContent);
    
    // Write the simplified contract
    fs.writeFileSync('contracts/HeritageClioSplit.sol', simplifiedContract);
    
    console.log('✅ Created simplified HeritageClioSplit contract');
    console.log('✅ Uses ReentrancyGuard, Ownable (no inheritance conflicts)');
    console.log('✅ Backup saved as HeritageClioSplit.sol.backup');
    console.log('💰 Revenue sharing: 50% creator, 30% Clio, 20% platform');
    
} catch (error) {
    console.log('❌ Error:', error.message);
}
