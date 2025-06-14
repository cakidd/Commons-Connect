const fs = require('fs');

console.log('🔧 Fixing Function Name Mismatch');
console.log('==============================');

try {
    // Read MountainSharesPhase1Enhanced.sol
    let enhancedContent = fs.readFileSync('contracts/MountainSharesPhase1Enhanced.sol', 'utf8');
    
    console.log('📋 Step 1: Fixing function call in Phase1Enhanced');
    
    // Replace awardVolunteerCompensation with awardVolunteerPhase1
    enhancedContent = enhancedContent.replace(
        /tieredVault\.awardVolunteerCompensation\(/g,
        'tieredVault.awardVolunteerPhase1('
    );
    
    // Also fix the parameters to match awardVolunteerPhase1(volunteer, numHours)
    enhancedContent = enhancedContent.replace(
        /tieredVault\.awardVolunteerPhase1\(\s*volunteer,\s*numHours,\s*IMMEDIATE_RATE,\s*VAULTED_RATE\s*\)/g,
        'tieredVault.awardVolunteerPhase1(volunteer, numHours)'
    );
    
    fs.writeFileSync('contracts/MountainSharesPhase1Enhanced.sol', enhancedContent);
    console.log('✅ Fixed function call: awardVolunteerCompensation → awardVolunteerPhase1');
    
    console.log('📋 Step 2: Ensuring EarnedMSVaultTiered has correct function');
    
    // Read and check EarnedMSVaultTiered.sol
    let vaultContent = fs.readFileSync('contracts/EarnedMSVaultTiered.sol', 'utf8');
    
    if (!vaultContent.includes('function awardVolunteerPhase1')) {
        console.log('⚠️  awardVolunteerPhase1 function missing in vault - adding it');
        
        // Add the missing function
        const awardFunction = `
    /**
     * @notice Award volunteer - Phase 1: All tokens vaulted
     * @param volunteer Volunteer address
     * @param numHours Hours worked
     */
    function awardVolunteerPhase1(
        address volunteer,
        uint256 numHours
    ) external onlyRole(MINTER_ROLE) {
        // Calculate total federal rate: $34.79/hour
        uint256 totalAmount = (numHours * (PHASE2_RATE * 100 + PHASE3_RATE) * 10**18) / RATE_PRECISION;
        
        // Everything goes to Phase 1 vault
        phase1Vaulted[volunteer] += totalAmount;
        totalVolunteerHours[volunteer] += numHours;
        totalPhase1Vaulted += totalAmount;
        
        emit VolunteerVaulted(volunteer, totalAmount, numHours);
    }`;
        
        // Insert before the last closing brace
        vaultContent = vaultContent.replace(/(\s*})(\s*)$/, awardFunction + '$1$2');
        fs.writeFileSync('contracts/EarnedMSVaultTiered.sol', vaultContent);
        console.log('✅ Added awardVolunteerPhase1 function to vault');
    } else {
        console.log('✅ awardVolunteerPhase1 function already exists in vault');
    }
    
    console.log('🎉 Function name mismatch fixed!');
    console.log('📋 Both contracts now use: awardVolunteerPhase1(volunteer, numHours)');
    
} catch (error) {
    console.log('❌ Error:', error.message);
}
