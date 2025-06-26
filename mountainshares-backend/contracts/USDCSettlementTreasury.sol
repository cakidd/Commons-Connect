// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title USDC Settlement Treasury for MountainShares
 * @dev Optimized for Arbitrum One with native USDC integration
 * @notice Handles $1 purchase capital settlement with verification
 */
contract USDCSettlementTreasury {
    // Native USDC on Arbitrum One
    address public constant USDC = 0xaf88d065e77c8cC2239327C5EDb3A432268e5831;
    
    // MountainShares ecosystem addresses
    address public owner;
    address public governanceContract;
    address public paymentProcessor;
    
    // Settlement tracking
    mapping(address => uint256) public settlementBalances;
    mapping(address => bool) public authorizedProcessors;
    
    // Events for transparency
    event SettlementReceived(
        address indexed from,
        address indexed customer,
        uint256 amount,
        uint256 timestamp
    );
    
    event ProcessorAuthorized(address indexed processor, bool authorized);
    event SettlementWithdrawn(address indexed to, uint256 amount);
    event VerificationRequested(address indexed requester, bool verified);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    modifier onlyAuthorized() {
        require(authorizedProcessors[msg.sender] || msg.sender == owner, "Not authorized");
        _;
    }
    
    constructor(address _governanceContract) {
        owner = msg.sender;
        governanceContract = _governanceContract;
        
        // Authorize the governance contract by default
        authorizedProcessors[_governanceContract] = true;
        emit ProcessorAuthorized(_governanceContract, true);
    }
    
    /**
     * @notice Authorize payment processors to send settlements
     * @param processor Address of the payment processor
     * @param authorized Whether the processor is authorized
     */
    function authorizeProcessor(address processor, bool authorized) external onlyOwner {
        authorizedProcessors[processor] = authorized;
        emit ProcessorAuthorized(processor, authorized);
    }
    
    /**
     * @notice Verify settlement connection during transaction
     * @dev Called by payment processors to ensure proper connection
     * @return bool True if connection is verified
     */
    function verifySettlementConnection() external returns (bool) {
        bool verified = authorizedProcessors[msg.sender];
        emit VerificationRequested(msg.sender, verified);
        return verified;
    }
    
    /**
     * @notice Receive USDC settlement from authorized payment processor
     * @param customer The customer who made the purchase
     * @param amount Amount of USDC to settle (should be $1.00 in USDC)
     */
    function receiveSettlement(address customer, uint256 amount) external onlyAuthorized {
        require(customer != address(0), "Invalid customer address");
        require(amount > 0, "Amount must be greater than 0");
        
        // Transfer USDC from payment processor to this treasury
        (bool success, bytes memory data) = USDC.call(
            abi.encodeWithSignature("transferFrom(address,address,uint256)", 
                msg.sender, address(this), amount)
        );
        require(success && (data.length == 0 || abi.decode(data, (bool))), "USDC settlement transfer failed");
        
        // Track settlement for customer
        settlementBalances[customer] += amount;
        
        emit SettlementReceived(msg.sender, customer, amount, block.timestamp);
    }
    
    /**
     * @notice Get total USDC balance in treasury
     * @return uint256 Total USDC balance
     */
    function getTotalBalance() external view returns (uint256) {
        (bool success, bytes memory data) = USDC.staticcall(
            abi.encodeWithSignature("balanceOf(address)", address(this))
        );
        require(success, "Balance check failed");
        return abi.decode(data, (uint256));
    }
    
    /**
     * @notice Get settlement balance for specific customer
     * @param customer Customer address
     * @return uint256 Settlement balance for customer
     */
    function getCustomerSettlement(address customer) external view returns (uint256) {
        return settlementBalances[customer];
    }
    
    /**
     * @notice Withdraw USDC from treasury (owner only)
     * @param to Destination address
     * @param amount Amount to withdraw
     */
    function withdrawSettlement(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "Invalid destination address");
        require(amount > 0, "Amount must be greater than 0");
        
        (bool success, bytes memory data) = USDC.call(
            abi.encodeWithSignature("transfer(address,uint256)", to, amount)
        );
        require(success && (data.length == 0 || abi.decode(data, (bool))), "USDC withdrawal failed");
        
        emit SettlementWithdrawn(to, amount);
    }
    
    /**
     * @notice Emergency withdrawal function (owner only)
     * @dev Withdraws all USDC to owner in case of emergency
     */
    function emergencyWithdraw() external onlyOwner {
        (bool success, bytes memory data) = USDC.staticcall(
            abi.encodeWithSignature("balanceOf(address)", address(this))
        );
        require(success, "Balance check failed");
        uint256 balance = abi.decode(data, (uint256));
        
        if (balance > 0) {
            (bool transferSuccess, bytes memory transferData) = USDC.call(
                abi.encodeWithSignature("transfer(address,uint256)", owner, balance)
            );
            require(transferSuccess && (transferData.length == 0 || abi.decode(transferData, (bool))), "Emergency withdrawal failed");
            
            emit SettlementWithdrawn(owner, balance);
        }
    }
    
    /**
     * @notice Update governance contract address (owner only)
     * @param newGovernanceContract New governance contract address
     */
    function updateGovernanceContract(address newGovernanceContract) external onlyOwner {
        require(newGovernanceContract != address(0), "Invalid governance contract address");
        
        // Remove authorization from old governance contract
        if (governanceContract != address(0)) {
            authorizedProcessors[governanceContract] = false;
            emit ProcessorAuthorized(governanceContract, false);
        }
        
        // Set and authorize new governance contract
        governanceContract = newGovernanceContract;
        authorizedProcessors[newGovernanceContract] = true;
        emit ProcessorAuthorized(newGovernanceContract, true);
    }
}
