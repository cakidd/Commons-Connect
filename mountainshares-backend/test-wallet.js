const { ethers } = require('ethers');

// Test different ways to load the private key
console.log('Testing wallet creation...');

// Method 1: Direct from .env.production
require('dotenv').config({ path: '.env.production' });
const pk1 = process.env.PRIVATE_KEY;
console.log('From .env.production:', pk1?.substring(0, 10) + '...');

try {
    const wallet1 = new ethers.Wallet(pk1);
    console.log('✅ Wallet 1 created successfully:', wallet1.address);
} catch (error) {
    console.log('❌ Wallet 1 failed:', error.message);
}

// Method 2: Hard-coded (for testing)
const pk2 = '0xcd0929c08ae6b7d06f7fe6c6bec08ed1caf716e776242a939e6df6603386c2f9';
console.log('Direct key:', pk2.substring(0, 10) + '...');

try {
    const wallet2 = new ethers.Wallet(pk2);
    console.log('✅ Wallet 2 created successfully:', wallet2.address);
} catch (error) {
    console.log('❌ Wallet 2 failed:', error.message);
}
