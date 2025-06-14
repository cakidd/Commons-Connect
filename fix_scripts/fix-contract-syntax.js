const fs = require('fs');

try {
    console.log('🔍 Diagnosing MountainSharesPhase1.sol syntax error...');
    
    // Read the contract file
    let content = fs.readFileSync('contracts/MountainSharesPhase1.sol', 'utf8');
    let lines = content.split('\n');
    
    console.log(`Contract has ${lines.length} lines`);
    console.log('Lines around error (95-100):');
    for (let i = 94; i < 100 && i < lines.length; i++) {
        console.log(`${i + 1}: ${lines[i]}`);
    }
    
    // Count braces to find mismatch
    let openBraces = 0;
    let closeBraces = 0;
    
    for (let line of lines) {
        openBraces += (line.match(/\{/g) || []).length;
        closeBraces += (line.match(/\}/g) || []).length;
    }
    
    console.log(`Open braces: ${openBraces}, Close braces: ${closeBraces}`);
    
    if (closeBraces > openBraces) {
        console.log('❌ Extra closing braces detected - removing excess');
        
        // Remove lines that are just standalone closing braces at the end
        while (lines.length > 0 && lines[lines.length - 1].trim() === '}') {
            lines.pop();
        }
        
        // Add the final closing brace for the contract
        lines.push('}');
        
        // Write the fixed content
        fs.writeFileSync('contracts/MountainSharesPhase1.sol', lines.join('\n'));
        console.log('✅ Fixed extra closing braces');
    }
    
} catch (error) {
    console.log('❌ Error:', error.message);
}
