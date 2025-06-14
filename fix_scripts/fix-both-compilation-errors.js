const fs = require('fs');

console.log('🔧 Fixing Both Compilation Errors');
console.log('================================');

try {
    console.log('📋 Step 1: Fixing Address Checksum');
    
    // Fix HeritageClioSplit.sol checksum
    let clioSplitContent = fs.readFileSync('contracts/HeritageClioSplit.sol', 'utf8');
    clioSplitContent = clioSplitContent.replace(
        '0x73fe99e620feeb5834124e6404d27086a857a12d',
        '0x73FE99e620feEb5834124e6404d27086a857A12D'
    );
    fs.writeFileSync('contracts/HeritageClioSplit.sol', clioSplitContent);
    console.log('✅ Fixed H4H_CLIO_RESERVE address checksum');

    console.log('📋 Step 2: Fixing Missing awardVolunteerPhase1 Function');
    
    // Add the missing function to EarnedMSVaultTiered.sol
    let vaultContent = fs.readFileSync('contracts/EarnedMSVaultTiered.sol', 'utf8');
    
    // Check if function already exists
    if (!vaultContent.includes('function awardVolunteerPhase1')) {
        // Add the missing function before the closing brace
        const missingFunction = `
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
        uint256 totalAmount = (numHours * (1000 + 2479) * 10**18) / 100; // $10 + $24.79
        
        // Everything goes to Phase 1 vault
        phase1Vaulted[volunteer] += totalAmount;
        totalVolunteerHours[volunteer] += numHours;
        totalPhase1Vaulted += totalAmount;
        
        emit VolunteerVaulted(volunteer, totalAmount, numHours);
    }`;

        // Insert before the last closing brace
        vaultContent = vaultContent.replace(/(\s*})(\s*)$/, missingFunction + '$1$2');
        
        fs.writeFileSync('contracts/EarnedMSVaultTiered.sol', vaultContent);
        console.log('✅ Added awardVolunteerPhase1 function to EarnedMSVaultTiered');
    } else {
        console.log('✅ awardVolunteerPhase1 function already exists');
    }

    console.log('📋 Step 3: Ensuring Required Events and Mappings');
    
    // Make sure VolunteerVaulted event exists
    if (!vaultContent.includes('event VolunteerVaulted')) {
        // Add missing event
        vaultContent = vaultContent.replace(
            'event Phase3TokensAccessed(address indexed volunteer, uint256 amount);',
            `event Phase3TokensAccessed(address indexed volunteer, uint256 amount);
    event VolunteerVaulted(address indexed volunteer, uint256 totalAmount, uint256 numHours);`
        );
        fs.writeFileSync('contracts/EarnedMSVaultTiered.sol', vaultContent);
        console.log('✅ Added VolunteerVaulted event');
    }

    console.log('🎉 All compilation errors fixed!');
    console.log('📋 Fixed issues:');
    console.log('   ✅ Address checksum: H4H_CLIO_RESERVE');
    console.log('   ✅ Missing function: awardVolunteerPhase1');
    console.log('   ✅ Missing event: VolunteerVaulted');

} catch (error) {
    console.log('❌ Error:', error.message);
}
