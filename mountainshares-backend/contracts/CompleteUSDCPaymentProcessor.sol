// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IUSDCSettlementTreasury {
    function verifySettlementConnection() external returns (bool);
    function receiveSettlement(address customer, uint256 amount) external;
}

interface IGovernanceContract {
    function processPayment(address customer, uint256 tokenAmount, uint256 governanceFeeUSDC) external;
}

/**
 * @title Complete USDC Payment Processor
 * @dev Handles complete payment flow: settlement + governance + token minting
 */
contract CompleteUSDCPaymentProcessor {
    address public constant USDC = 0xaf88d065e77c8cC2239327C5EDb3A432268e5831;
    address public immutable mountainSharesToken;
    IGovernanceContract public immutable governanceContract;
    IUSDCSettlementTreasury public immutable settlementTreasury;
    address public owner;
    
    event CompletePaymentProcessed(
        address indexed customer,
        uint256 tokenAmount,
        uint256 purchaseAmount,
        uint256 governanceFee,
        bool settlementVerified
    );
    
    constructor(
        address _mountainSharesToken,
        address _governanceContract,
        address _settlementTreasury
    ) {
        mountainSharesToken = _mountainSharesToken;
        governanceContract = IGovernanceContract(_governanceContract);
        settlementTreasury = IUSDCSettlementTreasury(_settlementTreasury);
        owner = msg.sender;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    /**
     * @notice Process complete payment: $1.00 to settlement + $0.02 to governance + mint tokens
     * @param customer Customer receiving the tokens
     * @param tokenAmount Amount of MountainShares tokens to mint
     * @param purchaseAmount Settlement amount (should be $1.00 in USDC)
     * @param governanceFee Governance fee amount (should be $0.02 in USDC)
     */
    function processCompletePayment(
        address customer,
        uint256 tokenAmount,
        uint256 purchaseAmount,
        uint256 governanceFee
    ) external onlyOwner {
        require(customer != address(0), "Invalid customer address");
        require(tokenAmount > 0, "Token amount must be greater than 0");
        require(purchaseAmount > 0, "Purchase amount must be greater than 0");
        require(governanceFee > 0, "Governance fee must be greater than 0");
        
        // Verify settlement treasury connection
        bool settlementVerified = settlementTreasury.verifySettlementConnection();
        require(settlementVerified, "Settlement treasury verification failed");
        
        uint256 totalAmount = purchaseAmount + governanceFee;
        
        // Transfer total USDC from sender to this contract
        (bool success, bytes memory data) = USDC.call(
            abi.encodeWithSignature("transferFrom(address,address,uint256)", 
                msg.sender, address(this), totalAmount)
        );
        require(success && (data.length == 0 || abi.decode(data, (bool))), "USDC transfer failed");
        
        // Approve settlement treasury for purchase amount
        (bool approveSettlementSuccess, bytes memory approveSettlementData) = USDC.call(
            abi.encodeWithSignature("approve(address,uint256)", 
                address(settlementTreasury), purchaseAmount)
        );
        require(approveSettlementSuccess && (approveSettlementData.length == 0 || abi.decode(approveSettlementData, (bool))), "Settlement approval failed");
        
        // Send purchase amount to settlement treasury
        settlementTreasury.receiveSettlement(customer, purchaseAmount);
        
        // Approve governance contract for governance fee
        (bool approveGovSuccess, bytes memory approveGovData) = USDC.call(
            abi.encodeWithSignature("approve(address,uint256)", 
                address(governanceContract), governanceFee)
        );
        require(approveGovSuccess && (approveGovData.length == 0 || abi.decode(approveGovData, (bool))), "Governance approval failed");
        
        // Process governance fee distribution and token minting
        governanceContract.processPayment(customer, tokenAmount, governanceFee);
        
        emit CompletePaymentProcessed(customer, tokenAmount, purchaseAmount, governanceFee, settlementVerified);
    }
}
