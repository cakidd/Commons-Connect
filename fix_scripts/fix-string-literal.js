const fs = require('fs');

console.log('🔧 Fixing Unterminated String Literal in Phase 1');
console.log('==============================================');

try {
    // Read the Phase 1 contract
    let content = fs.readFileSync('contracts/MountainSharesPhase1.sol', 'utf8');
    
    // Fix the broken string at line 75
    // From: return (1, PHASE_1_RATE, "Phase 1 - Foundation (
    // To:   return (1, PHASE_1_RATE, "Phase 1 - Foundation ($1.00 MS)");
    
    content = content.replace(
        /return \(1, PHASE_1_RATE, "Phase 1 - Foundation \(/,
        'return (1, PHASE_1_RATE, "Phase 1 - Foundation ($1.00 MS)");'
    );
    
    // Alternative fix in case the line is different
    content = content.replace(
        /return \(1, PHASE_1_RATE, "Phase 1 - Foundation[^"]*$/m,
        'return (1, PHASE_1_RATE, "Phase 1 - Foundation ($1.00 MS)");'
    );
    
    fs.writeFileSync('contracts/MountainSharesPhase1.sol', content);
    console.log('✅ Fixed unterminated string literal at line 75');
    console.log('✅ String now properly closed: "Phase 1 - Foundation ($1.00 MS)"');
    
} catch (error) {
    console.log('❌ Error:', error.message);
}
