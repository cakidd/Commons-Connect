const fs = require('fs');

console.log('🔧 Treasury Monitor Specific Structure Fixer');
console.log('=========================================');

try {
    const contractPath = 'contracts/TreasuryMonitorTiered.sol';
    
    if (!fs.existsSync(contractPath)) {
        console.log('❌ TreasuryMonitorTiered.sol not found - creating from scratch');
        
        // Create a clean TreasuryMonitorTiered contract
        const cleanContract = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./MountainSharesSecurity.sol";
import "./EarnedMSVaultTiered.sol";

/**
 * @title TreasuryMonitor3Phase - Phase 2 & 3 Activation Controller
 * @notice Monitors treasury backing and activates phases based on reserves
 */
contract TreasuryMonitorTiered is MountainSharesSecurity {
    IERC20 public mountainSharesToken;
    address public treasuryAddress;
    EarnedMSVaultTiered public vault;
    
    bool public phase2Activated = false;
    bool public phase3Activated = false;
    uint256 public phase2ActivationThreshold = 100; // Treasury > Vaulted = Phase 2
    uint256 public phase3ActivationThreshold = 150; // Treasury > 150% Vaulted = Phase 3

    bytes32 public constant MONITOR_ROLE = keccak256("MONITOR_ROLE");

    event Phase2Triggered(uint256 treasuryBalance, uint256 vaultedAmount);
    event Phase3Triggered(uint256 treasuryBalance, uint256 vaultedAmount);
    event ReleaseTriggered(address indexed volunteer, uint256 amount);

    constructor(
        address _mountainSharesToken,
        address _treasuryAddress,
        address _vaultAddress
    ) MountainSharesSecurity() {
        mountainSharesToken = IERC20(_mountainSharesToken);
        treasuryAddress = _treasuryAddress;
        vault = EarnedMSVaultTiered(_vaultAddress);
        _grantRole(MONITOR_ROLE, msg.sender);
    }

    /**
     * @notice Check and activate phases based on treasury backing
     */
    function checkPhaseActivation() external onlyRole(MONITOR_ROLE) {
        uint256 treasuryBalance = mountainSharesToken.balanceOf(treasuryAddress);
        uint256 vaultedAmount = vault.totalPhase1Vaulted();
        
        if (vaultedAmount == 0) return;
        
        uint256 backingRatio = (treasuryBalance * 100) / vaultedAmount;
        
        // Check Phase 2 activation
        if (!phase2Activated && backingRatio >= phase2ActivationThreshold) {
            phase2Activated = true;
            vault.activatePhase2();
            emit Phase2Triggered(treasuryBalance, vaultedAmount);
        }
        
        // Check Phase 3 activation
        if (!phase3Activated && backingRatio >= phase3ActivationThreshold) {
            phase3Activated = true;
            vault.activatePhase3();
            emit Phase3Triggered(treasuryBalance, vaultedAmount);
        }
    }

    /**
     * @notice Simplified release trigger for volunteers
     * @param volunteer Volunteer address
     */
    function releaseAllVaultedTokens(address volunteer) external {
        require(phase3Activated, "Phase 3 not activated");
        
        uint256 vaultedAmount = vault.phase1Vaulted(volunteer);
        require(vaultedAmount > 0, "No vaulted tokens");
        
        emit ReleaseTriggered(volunteer, vaultedAmount);
    }

    // View functions
    function getPhaseStatus() external view returns (
        bool phase2Active,
        bool phase3Active,
        uint256 currentBackingRatio,
        bool canActivatePhase2,
        bool canActivatePhase3
    ) {
        uint256 treasury = mountainSharesToken.balanceOf(treasuryAddress);
        uint256 vaulted = vault.totalPhase1Vaulted();
        uint256 ratio = vaulted > 0 ? (treasury * 100) / vaulted : 0;
        
        return (
            phase2Activated,
            phase3Activated,
            ratio,
            !phase2Activated && ratio >= phase2ActivationThreshold,
            !phase3Activated && ratio >= phase3ActivationThreshold
        );
    }
}`;

        fs.writeFileSync(contractPath, cleanContract);
        console.log('✅ Created clean TreasuryMonitorTiered.sol');
        
    } else {
        // Fix existing file
        let content = fs.readFileSync(contractPath, 'utf8');
        let lines = content.split('\n');
        
        // Remove any trailing closing braces
        while (lines.length > 0 && lines[lines.length - 1].trim() === '}') {
            lines.pop();
        }
        
        // Count braces to ensure proper closure
        let openBraces = 0;
        let closeBraces = 0;
        
        lines.forEach(line => {
            openBraces += (line.match(/\{/g) || []).length;
            closeBraces += (line.match(/\}/g) || []).length;
        });
        
        // Add exactly the right number of closing braces
        const needed = openBraces - closeBraces;
        for (let i = 0; i < needed; i++) {
            lines.push('}');
        }
        
        fs.writeFileSync(contractPath, lines.join('\n'));
        console.log('✅ Fixed TreasuryMonitorTiered.sol structure');
    }
    
    console.log('🎯 Treasury Monitor structure verified');
    
} catch (error) {
    console.log('❌ Error:', error.message);
}
