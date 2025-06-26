// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract USDCGovernanceFeeDistributor {
    // USDC contract on Arbitrum One  
    address public constant USDC = 0xaf88d065e77c8cC2239327C5EDb3A432268e5831;
    address public immutable mountainSharesToken;
    address public owner;
    
    // Governance recipients
    address public constant HARMONY_FOR_HOPE = 0xdE75F5168E33db23FA5601b5fc88545be7b287a4;
    address public constant TREASURY = 0x2B686A6C1C4b40fFc748b56b6C7A06c49E361167;
    address public constant DEVELOPMENT = 0xD8bb25076e61B5a382e17171b48d8E0952b5b4f3;
    address public constant COMMUNITY_PROGRAMS = 0xf8C739a101e53F6fE4e24dF768be833ceecEFa84;
    address public constant GOVERNANCE = 0x8c09e686BDfd283BdF5f6fFfc780E62A695014F3;
    
    constructor(address _mountainSharesToken) {
        mountainSharesToken = _mountainSharesToken;
        owner = msg.sender;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    function processPayment(
        address customer,
        uint256 tokenAmount,
        uint256 governanceFeeUSDC
    ) external onlyOwner {
        // Transfer USDC from sender
        (bool success,) = USDC.call(
            abi.encodeWithSignature("transferFrom(address,address,uint256)", 
                msg.sender, address(this), governanceFeeUSDC)
        );
        require(success, "USDC transfer failed");
        
        // Distribute fees
        _distributeFees(governanceFeeUSDC);
        
        // Mint tokens
        (bool mintSuccess,) = mountainSharesToken.call(
            abi.encodeWithSignature("mint(address,uint256)", customer, tokenAmount)
        );
        require(mintSuccess, "Mint failed");
    }
    
    function _distributeFees(uint256 totalAmount) internal {
        uint256 harmonyAmount = (totalAmount * 30) / 100;
        uint256 treasuryAmount = (totalAmount * 30) / 100;
        uint256 devAmount = (totalAmount * 15) / 100;
        uint256 communityAmount = (totalAmount * 15) / 100;
        uint256 govAmount = (totalAmount * 10) / 100;
        
        (bool s1,) = USDC.call(abi.encodeWithSignature("transfer(address,uint256)", HARMONY_FOR_HOPE, harmonyAmount));
        (bool s2,) = USDC.call(abi.encodeWithSignature("transfer(address,uint256)", TREASURY, treasuryAmount));
        (bool s3,) = USDC.call(abi.encodeWithSignature("transfer(address,uint256)", DEVELOPMENT, devAmount));
        (bool s4,) = USDC.call(abi.encodeWithSignature("transfer(address,uint256)", COMMUNITY_PROGRAMS, communityAmount));
        (bool s5,) = USDC.call(abi.encodeWithSignature("transfer(address,uint256)", GOVERNANCE, govAmount));
        
        require(s1 && s2 && s3 && s4 && s5, "Distribution failed");
    }
}
