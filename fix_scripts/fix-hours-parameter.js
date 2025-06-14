const fs = require('fs');

// Read the contract file
let contractContent = fs.readFileSync('contracts/MountainSharesPhase1.sol', 'utf8');

// Fix the event parameter name
contractContent = contractContent.replace('uint256 hours,', 'uint256 numHours,');

// Fix any function parameter references
contractContent = contractContent.replace('hours,', 'numHours,');

// Write back the fixed contract
fs.writeFileSync('contracts/MountainSharesPhase1.sol', contractContent);

console.log('✅ Fixed hours parameter name conflict');
