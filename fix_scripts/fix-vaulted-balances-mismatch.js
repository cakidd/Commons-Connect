const fs = require('fs');

console.log('🔧 Fixing vaultedBalances Mapping Name Mismatch');
console.log('============================================');

try {
    console.log('📋 Step 1: Analyzing EarnedMSVaultTiered mappings');
    
    // Read EarnedMSVaultTiered.sol to understand available mappings
    let vaultContent = fs.readFileSync('contracts/EarnedMSVaultTiered.sol', 'utf8');
    
    const hasPhase1Vaulted = vaultContent.includes('mapping(address => uint256) public phase1Vaulted');
    const hasVaultedBalances = vaultContent.includes('mapping(address => uint256) public vaultedBalances');
    
    console.log(`Available mappings in vault:`);
    console.log(`  phase1Vaulted: ${hasPhase1Vaulted ? '✅' : '❌'}`);
    console.log(`  vaultedBalances: ${hasVaultedBalances ? '✅' : '❌'}`);
    
    console.log('📋 Step 2: Fixing TreasuryMonitorTiered.sol');
    
    // Read TreasuryMonitorTiered.sol
    let monitorContent = fs.readFileSync('contracts/TreasuryMonitorTiered.sol', 'utf8');
    
    // Replace vaultedBalances with phase1Vaulted
    monitorContent = monitorContent.replace(/vault\.vaultedBalances\(/g, 'vault.phase1Vaulted(');
    
    fs.writeFileSync('contracts/TreasuryMonitorTiered.sol', monitorContent);
    console.log('✅ Fixed: vault.vaultedBalances() → vault.phase1Vaulted()');
    
    console.log('📋 Step 3: Adding compatibility function (optional)');
    
    // Option: Add vaultedBalances compatibility function to vault
    if (!hasVaultedBalances && hasPhase1Vaulted) {
        const compatibilityFunction = `
    /**
     * @notice Compatibility function - returns phase1Vaulted amount
     * @param volunteer Volunteer address
     * @return Vaulted amount in Phase 1
     */
    function vaultedBalances(address volunteer) external view returns (uint256) {
        return phase1Vaulted[volunteer];
    }`;
        
        // Insert before the last closing brace
        vaultContent = vaultContent.replace(/(\s*})(\s*)$/, compatibilityFunction + '$1$2');
        fs.writeFileSync('contracts/EarnedMSVaultTiered.sol', vaultContent);
        console.log('✅ Added vaultedBalances compatibility function to vault');
    }
    
    console.log('📋 Step 4: Ensuring all function calls are consistent');
    
    // Check for other potential mismatches in monitor contract
    const functionMismatches = [
        { old: 'vault.totalVaulted()', new: 'vault.totalPhase1Vaulted' },
        { old: 'vault.immediateBalances(', new: 'vault.phase2Accessible(' },
        { old: 'vault.phase2Accessible(', new: 'vault.phase2Accessible(' } // This one should be correct
    ];
    
    functionMismatches.forEach(({old, new: newFunc}) => {
        if (monitorContent.includes(old)) {
            monitorContent = monitorContent.replace(new RegExp(old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newFunc);
            console.log(`✅ Fixed: ${old} → ${newFunc}`);
        }
    });
    
    fs.writeFileSync('contracts/TreasuryMonitorTiered.sol', monitorContent);
    
    console.log('🎉 All mapping name mismatches fixed!');
    console.log('📋 3-Phase System Mappings:');
    console.log('   phase1Vaulted: All tokens vaulted (Phase 1)');
    console.log('   phase2Accessible: $10/hour accessible (Phase 2)');
    console.log('   phase3Accessible: $24.79/hour accessible (Phase 3)');
    
} catch (error) {
    console.log('❌ Error:', error.message);
}
