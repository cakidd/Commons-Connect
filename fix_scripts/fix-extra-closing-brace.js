const fs = require('fs');

console.log('🔧 Fixing MountainSharesPhase1.sol syntax error at line 113');

try {
    let content = fs.readFileSync('contracts/MountainSharesPhase1.sol', 'utf8');

    // Remove any extra closing braces at the end of the file
    while (content.trim().endsWith('}')) {
        // Count braces
        const openBraces = (content.match(/{/g) || []).length;
        const closeBraces = (content.match(/}/g) || []).length;
        if (closeBraces <= openBraces) {
            break;
        }
        // Remove last closing brace
        const lastIndex = content.lastIndexOf('}');
        content = content.substring(0, lastIndex);
    }

    // Add a single closing brace at the end
    if (!content.trim().endsWith('}')) {
        content += '\n}';
    }

    fs.writeFileSync('contracts/MountainSharesPhase1.sol', content);
    console.log('✅ Fixed extra closing brace issue in MountainSharesPhase1.sol');
} catch (error) {
    console.error('❌ Error fixing MountainSharesPhase1.sol:', error.message);
}
