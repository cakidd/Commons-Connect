const fs = require('fs');

try {
    // Read the contract file
    let content = fs.readFileSync('contracts/MountainSharesPhase1.sol', 'utf8');

    // Fix the function declaration to add 'virtual'
    content = content.replace(
        /function awardHeritageMS\s*\([^)]*\)\s*external\s*onlyRole\(MINTER_ROLE\)/,
        'function awardHeritageMS(\n        address participant,\n        string memory activity,\n        uint256 amount\n    ) external virtual onlyRole(MINTER_ROLE)'
    );

    // Write back the fixed contract
    fs.writeFileSync('contracts/MountainSharesPhase1.sol', content);
    console.log('✅ Made awardHeritageMS function virtual in MountainSharesPhase1.sol');
} catch (error) {
    console.log('❌ Error:', error.message);
}
