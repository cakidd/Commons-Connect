const fs = require('fs');

try {
    // Fix EarnedMSVaultSimple.sol
    let vaultContent = fs.readFileSync('contracts/EarnedMSVaultSimple.sol', 'utf8');
    
    // Add MINTER_ROLE definition after the contract declaration
    const roleDefinition = `    
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
`;
    
    // Insert the role definition after the events
    vaultContent = vaultContent.replace(
        'event TokensReleased(address indexed user, uint256 amount);',
        `event TokensReleased(address indexed user, uint256 amount);
${roleDefinition}`
    );
    
    // Write back the fixed vault contract
    fs.writeFileSync('contracts/EarnedMSVaultSimple.sol', vaultContent);
    
    // Also fix TreasuryMonitor if needed
    let treasuryContent = fs.readFileSync('contracts/TreasuryMonitor.sol', 'utf8');
    
    // Add MINTER_ROLE to TreasuryMonitor as well for consistency
    if (!treasuryContent.includes('MINTER_ROLE')) {
        treasuryContent = treasuryContent.replace(
            'bytes32 public constant TREASURY_MONITOR_ROLE = keccak256("TREASURY_MONITOR_ROLE");',
            `bytes32 public constant TREASURY_MONITOR_ROLE = keccak256("TREASURY_MONITOR_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");`
        );
        fs.writeFileSync('contracts/TreasuryMonitor.sol', treasuryContent);
    }
    
    console.log('✅ Fixed MINTER_ROLE compilation errors in vault contracts');
} catch (error) {
    console.log('❌ Error:', error.message);
}
