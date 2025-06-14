const fs = require('fs');

// Read the contract file
let contractContent = fs.readFileSync('contracts/MountainSharesPhase1.sol', 'utf8');

// Fix all occurrences of 'hours' to 'numHours' (whole words only)
contractContent = contractContent.replace(/\bhours\b/g, 'numHours');

// Write back the fixed contract
fs.writeFileSync('contracts/MountainSharesPhase1.sol', contractContent);

console.log('✅ Fixed all occurrences of hours parameter name conflict');
