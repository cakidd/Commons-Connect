const fs = require('fs');

try {
    console.log('🔧 Fixing virtual/override keywords...');
    
    // Fix MountainSharesPhase1.sol - add virtual keyword
    let phase1Content = fs.readFileSync('contracts/MountainSharesPhase1.sol', 'utf8');
    
    // Add virtual to setVaultAddress function
    phase1Content = phase1Content.replace(
        'function setVaultAddress(address _vaultAddress) external onlyRole(ADMIN_ROLE) {',
        'function setVaultAddress(address _vaultAddress) external virtual onlyRole(ADMIN_ROLE) {'
    );
    
    fs.writeFileSync('contracts/MountainSharesPhase1.sol', phase1Content);
    console.log('✅ Added virtual keyword to MountainSharesPhase1.sol');
    
    // Fix MountainSharesPhase1WithVault.sol - add override keyword
    if (fs.existsSync('contracts/MountainSharesPhase1WithVault.sol')) {
        let vaultContent = fs.readFileSync('contracts/MountainSharesPhase1WithVault.sol', 'utf8');
        
        // Add override to setVaultAddress function
        vaultContent = vaultContent.replace(
            'function setVaultAddress(address vaultAddress) external onlyRole(ADMIN_ROLE) {',
            'function setVaultAddress(address vaultAddress) external override onlyRole(ADMIN_ROLE) {'
        );
        
        fs.writeFileSync('contracts/MountainSharesPhase1WithVault.sol', vaultContent);
        console.log('✅ Added override keyword to MountainSharesPhase1WithVault.sol');
    } else {
        console.log('ℹ️ MountainSharesPhase1WithVault.sol not found - skipping');
    }
    
    console.log('🎉 Virtual/override fixes complete!');
    
} catch (error) {
    console.log('❌ Error:', error.message);
}
