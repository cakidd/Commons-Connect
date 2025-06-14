const fs = require('fs');

try {
    // Read the contract file
    let content = fs.readFileSync('contracts/MountainSharesPhase1.sol', 'utf8');
    
    // Find and replace the broken function with the complete correct version
    const brokenFunctionPattern = /\/\/ Heritage Integration Function \(Required for Heritage V3\)[\s\S]*?function awardHeritageMS[\s\S]*?\{[\s\S]*?emit VolunteerHoursLogged[\s\S]*?\}/;
    
    const correctFunction = `    // Heritage Integration Function (Required for Heritage V3)
    function awardHeritageMS(address participant, string memory activity, uint256 amount) external virtual onlyRole(MINTER_ROLE) {
        uint256 msAmount = amount * 10**18;
        _mint(participant, msAmount);
        emit VolunteerHoursLogged(participant, amount, activity);
    }`;
    
    content = content.replace(brokenFunctionPattern, correctFunction);
    
    // Write back the fixed contract
    fs.writeFileSync('contracts/MountainSharesPhase1.sol', content);
    console.log('✅ Complete function fix applied - parameters and virtual keyword corrected');
} catch (error) {
    console.log('❌ Error:', error.message);
}
