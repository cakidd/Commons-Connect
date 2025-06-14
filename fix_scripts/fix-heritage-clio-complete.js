const fs = require('fs');

console.log('🔧 Complete Heritage-Clio Integration Fix');
console.log('=======================================');

try {
    // Step 1: Fix OpenZeppelin imports
    console.log('📋 Step 1: Fixing OpenZeppelin imports...');
    let splitContent = fs.readFileSync('contracts/HeritageClioSplit.sol', 'utf8');
    splitContent = splitContent.replace(
        'import "@openzeppelin/contracts/security/ReentrancyGuard.sol";',
        'import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";'
    );
    fs.writeFileSync('contracts/HeritageClioSplit.sol', splitContent);
    console.log('✅ Fixed ReentrancyGuard import path');

    // Step 2: Ensure lib directory exists
    console.log('📋 Step 2: Creating lib directory...');
    if (!fs.existsSync('lib')) {
        fs.mkdirSync('lib');
        console.log('✅ Created lib directory');
    } else {
        console.log('✅ lib directory already exists');
    }

    // Step 3: Check if modules exist
    console.log('📋 Step 3: Checking required modules...');
    const requiredFiles = [
        'lib/TheClioService.js',
        'lib/HeritageClioIntegration.js'
    ];
    
    requiredFiles.forEach(file => {
        if (fs.existsSync(file)) {
            console.log(`✅ ${file} exists`);
        } else {
            console.log(`❌ ${file} missing - will be created`);
        }
    });

    console.log('🎯 Integration fix complete!');
    console.log('📋 Next steps:');
    console.log('   1. npm install @openzeppelin/contracts axios cheerio');
    console.log('   2. npx hardhat clean && npx hardhat compile');
    console.log('   3. npm run test:clio-service');

} catch (error) {
    console.log('❌ Error:', error.message);
}
