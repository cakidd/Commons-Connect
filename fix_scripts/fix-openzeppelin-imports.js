const fs = require('fs');

console.log('🔧 Fixing OpenZeppelin Import Paths');
console.log('=================================');

try {
    // Fix HeritageClioSplit.sol
    let splitContent = fs.readFileSync('contracts/HeritageClioSplit.sol', 'utf8');
    
    // Update ReentrancyGuard import path
    splitContent = splitContent.replace(
        'import "@openzeppelin/contracts/security/ReentrancyGuard.sol";',
        'import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";'
    );
    
    fs.writeFileSync('contracts/HeritageClioSplit.sol', splitContent);
    console.log('✅ Fixed ReentrancyGuard import in HeritageClioSplit.sol');
    
    // Check OpenZeppelin version
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const ozVersion = packageJson.dependencies?.['@openzeppelin/contracts'] || 'Not installed';
    console.log(`📦 OpenZeppelin version: ${ozVersion}`);
    
    if (ozVersion === 'Not installed') {
        console.log('⚠️  Need to install OpenZeppelin contracts');
    }
    
} catch (error) {
    console.log('❌ Error:', error.message);
}
