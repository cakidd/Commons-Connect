const fs = require('fs');

// Read the working backup
const packageJson = JSON.parse(fs.readFileSync('package.json.backup', 'utf8'));

// Add heritage scripts safely
const heritageScripts = {
  "test:heritage-v3": "npx hardhat run scripts/test-heritage-v3-fixed.js",
  "test:heritage-integration": "npx hardhat run scripts/test-heritage-vault-integration.js",
  "monitor:reserves": "npx hardhat run scripts/monitor-reserve-ratio.js",
  "verify:ci-cd": "npx hardhat run scripts/ci-heritage-verification.js",
  "test:all-heritage": "npm run test:heritage-v3 && npm run test:heritage-integration && npm run verify:ci-cd",
  "deploy:heritage-system": "run-s deploy:phase1-heritage deploy:heritage-v3 deploy:vault-monitor"
};

// Merge scripts properly
packageJson.scripts = { ...packageJson.scripts, ...heritageScripts };

// Write the corrected file
fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
console.log("✅ Heritage scripts added safely");
