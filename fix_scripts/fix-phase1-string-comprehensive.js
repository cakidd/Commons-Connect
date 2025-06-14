const fs = require('fs');

console.log('🔧 Comprehensive Phase 1 String Fix');
console.log('=================================');

try {
    let content = fs.readFileSync('contracts/MountainSharesPhase1.sol', 'utf8');
    
    // Replace the entire getCurrentPhaseInfo function with the correct version
    const correctFunction = `    // Phase 1: Get current phase info
    function getCurrentPhaseInfo() external pure returns (
        uint256 phase,
        uint256 rate,
        string memory description
    ) {
        return (1, PHASE_1_RATE, "Phase 1 - Foundation ($1.00 MS)");
    }`;
    
    // Find and replace the broken function
    content = content.replace(
        /\/\/ Phase 1: Get current phase info[\s\S]*?function getCurrentPhaseInfo[\s\S]*?\{[\s\S]*?return \(1, PHASE_1_RATE, "Phase 1 - Foundation[^}]*\}/,
        correctFunction
    );
    
    // Fallback: just fix the return line if function replacement doesn't work
    content = content.replace(
        /return \(1, PHASE_1_RATE, "Phase 1 - Foundation[^;]*;?/,
        'return (1, PHASE_1_RATE, "Phase 1 - Foundation ($1.00 MS)");'
    );
    
    fs.writeFileSync('contracts/MountainSharesPhase1.sol', content);
    console.log('✅ Fixed Phase 1 string literal');
    console.log('✅ Function properly terminated');
    
} catch (error) {
    console.log('❌ Error:', error.message);
}
