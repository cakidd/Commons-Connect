const fs = require('fs');

try {
    console.log('🔧 Fixing "hours" parameter in event declarations');
    console.log('===============================================');
    
    // Fix EarnedMSVaultTiered.sol
    if (fs.existsSync('contracts/EarnedMSVaultTiered.sol')) {
        let vaultContent = fs.readFileSync('contracts/EarnedMSVaultTiered.sol', 'utf8');
        
        // Fix the event declaration
        vaultContent = vaultContent.replace(
            'event VolunteerCompensated(address indexed volunteer, uint256 immediate, uint256 vaulted, uint256 hours);',
            'event VolunteerCompensated(address indexed volunteer, uint256 immediate, uint256 vaulted, uint256 numHours);'
        );
        
        // Fix the emit statement to match
        vaultContent = vaultContent.replace(
            'emit VolunteerCompensated(volunteer, immediateAmount, vaultedAmount, hours);',
            'emit VolunteerCompensated(volunteer, immediateAmount, vaultedAmount, hours);'
        );
        
        fs.writeFileSync('contracts/EarnedMSVaultTiered.sol', vaultContent);
        console.log('✅ Fixed EarnedMSVaultTiered.sol event declaration');
    }
    
    // Fix MountainSharesPhase1Enhanced.sol 
    if (fs.existsSync('contracts/MountainSharesPhase1Enhanced.sol')) {
        let enhancedContent = fs.readFileSync('contracts/MountainSharesPhase1Enhanced.sol', 'utf8');
        
        // Fix the event declaration
        enhancedContent = enhancedContent.replace(
            'event VolunteerAwarded(address indexed volunteer, uint256 hours, uint256 immediate, uint256 vaulted);',
            'event VolunteerAwarded(address indexed volunteer, uint256 numHours, uint256 immediate, uint256 vaulted);'
        );
        
        // Fix the emit statement to match
        enhancedContent = enhancedContent.replace(
            'emit VolunteerAwarded(volunteer, hours, hours * defaultImmediateRate, hours * defaultVaultedRate);',
            'emit VolunteerAwarded(volunteer, hours, hours * defaultImmediateRate, hours * defaultVaultedRate);'
        );
        
        fs.writeFileSync('contracts/MountainSharesPhase1Enhanced.sol', enhancedContent);
        console.log('✅ Fixed MountainSharesPhase1Enhanced.sol event declaration');
    }
    
    console.log('🎉 All event parameter conflicts resolved!');
    
} catch (error) {
    console.log('❌ Error:', error.message);
}
