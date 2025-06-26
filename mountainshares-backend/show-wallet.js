const { ethers } = require('ethers');

// Show which wallet your system uses
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY);
console.log('🔑 Your system wallet:', wallet.address);
