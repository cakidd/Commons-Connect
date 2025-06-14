const fs = require('fs');

try {
    // Read Phase 1 contract
    let phase1Content = fs.readFileSync('contracts/MountainSharesPhase1.sol', 'utf8');
    
    // Add vault integration if not present
    if (!phase1Content.includes('EarnedMSVaultSimple')) {
        // Add vault import
        const importLine = 'import "./EarnedMSVaultSimple.sol";';
        if (!phase1Content.includes(importLine)) {
            phase1Content = phase1Content.replace(
                'import "./MountainSharesSecurity.sol";',
                `import "./MountainSharesSecurity.sol";
${importLine}`
            );
        }
        
        // Add vault address variable
        if (!phase1Content.includes('EarnedMSVaultSimple public vault;')) {
            phase1Content = phase1Content.replace(
                'mapping(address => mapping(string => uint256)) public activityHours;',
                `mapping(address => mapping(string => uint256)) public activityHours;
    
    // Vault integration
    EarnedMSVaultSimple public vault;`
            );
        }
        
        // Add setVaultAddress function if not present
        if (!phase1Content.includes('setVaultAddress')) {
            const setVaultFunction = `
    // Set vault address for EarnedMS integration
    function setVaultAddress(address vaultAddress) external onlyRole(ADMIN_ROLE) {
        vault = EarnedMSVaultSimple(vaultAddress);
    }`;
            
            phase1Content = phase1Content.replace(
                'return (1, PHASE_1_RATE, "Phase 1 - Foundation ($1.00 MS)");',
                `return (1, PHASE_1_RATE, "Phase 1 - Foundation ($1.00 MS)");
    }
${setVaultFunction}`
            );
        }
        
        fs.writeFileSync('contracts/MountainSharesPhase1.sol', phase1Content);
    }
    
    console.log('✅ MountainShares Phase 1 vault integration verified/added');
} catch (error) {
    console.log('❌ Integration error:', error.message);
}
