const fs = require('fs');

console.log('🔧 Fixing totalVaulted Function Name Mismatch');
console.log('===========================================');

try {
    console.log('📋 Step 1: Fixing TreasuryMonitorTiered.sol');
    
    // Read TreasuryMonitorTiered.sol
    let monitorContent = fs.readFileSync('contracts/TreasuryMonitorTiered.sol', 'utf8');
    
    // Replace totalVaulted() with totalPhase1Vaulted
    monitorContent = monitorContent.replace(/vault\.totalVaulted\(\)/g, 'vault.totalPhase1Vaulted()');
    
    fs.writeFileSync('contracts/TreasuryMonitorTiered.sol', monitorContent);
    console.log('✅ Fixed: vault.totalVaulted() → vault.totalPhase1Vaulted()');
    
    console.log('📋 Step 2: Ensuring EarnedMSVaultTiered has totalPhase1Vaulted');
    
    // Read EarnedMSVaultTiered.sol to verify function exists
    let vaultContent = fs.readFileSync('contracts/EarnedMSVaultTiered.sol', 'utf8');
    
    if (vaultContent.includes('uint256 public totalPhase1Vaulted;')) {
        console.log('✅ totalPhase1Vaulted variable exists in vault');
    } else {
        console.log('⚠️  Adding totalPhase1Vaulted variable to vault');
        
        // Add missing variable
        vaultContent = vaultContent.replace(
            'uint256 public totalPhase3Accessible;',
            `uint256 public totalPhase3Accessible;
    uint256 public totalPhase1Vaulted;`
        );
        
        fs.writeFileSync('contracts/EarnedMSVaultTiered.sol', vaultContent);
        console.log('✅ Added totalPhase1Vaulted variable');
    }
    
    console.log('📋 Step 3: Updating H4H Address Checksums');
    
    // Update all H4H addresses with proper checksums
    const addressMappings = {
        '0x73fe99e620feeb5834124e6404d27086a857a12d': '0x73FE99e620feEb5834124e6404d27086a857A12D',
        '0x2b686a6c1c4b40ffc748b56b6c7a06c49e361167': '0x2B686a6C1c4b40FfC748b56B6c7A06C49e361167',
        '0x95e4c1b6aad37e610742254114216ceaf0f49acd': '0x95E4c1B6AAd37E610742254114216cEaf0f49aCd',
        '0xde75f5168e33db23fa5601b5fc88545be7b287a4': '0xdE75F5168E33db23FA5601b5fc88545be7b287a4'
    };
    
    // Fix checksums in all contracts
    const contractFiles = [
        'contracts/HeritageClioSplit.sol',
        'contracts/TreasuryMonitorTiered.sol',
        'scripts/deploy-heritage-clio-split.js'
    ];
    
    contractFiles.forEach(filePath => {
        if (fs.existsSync(filePath)) {
            let content = fs.readFileSync(filePath, 'utf8');
            
            Object.keys(addressMappings).forEach(lowercase => {
                const checksummed = addressMappings[lowercase];
                content = content.replace(new RegExp(lowercase, 'gi'), checksummed);
            });
            
            fs.writeFileSync(filePath, content);
            console.log(`✅ Fixed address checksums in ${filePath}`);
        }
    });
    
    console.log('🎉 All function name mismatches and checksums fixed!');
    console.log('📋 H4H Organizational Structure Ready:');
    console.log('   Treasury: 0x2B686a6C1c4b40FfC748b56B6c7A06C49e361167');
    console.log('   Clio Reserve: 0x73FE99e620feEb5834124e6404d27086a857A12D');
    console.log('   EarnedMS Vault: 0x95E4c1B6AAd37E610742254114216cEaf0f49aCd');
    console.log('   Main Organization: 0xdE75F5168E33db23FA5601b5fc88545be7b287a4');
    
} catch (error) {
    console.log('❌ Error:', error.message);
}
