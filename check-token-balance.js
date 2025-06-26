const { ethers } = require('ethers');
require('dotenv').config({ path: '.env.local' });

async function checkBalance() {
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    
    // Your wallet that should have received the token
    const walletAddress = '0xdE75F5168E33db23FA5601b5fc88545be7b287a4'; // Harmony for Hope wallet
    
    const tokenABI = ["function balanceOf(address owner) view returns (uint256)"];
    const tokenContract = new ethers.Contract(process.env.CONTRACT_ADDRESS, tokenABI, provider);
    
    const balance = await tokenContract.balanceOf(walletAddress);
    const formattedBalance = ethers.formatUnits(balance, 18);
    
    console.log('🏔️ Mountain Shares Token Balance Check:');
    console.log('👤 Wallet:', walletAddress);
    console.log('💎 Balance:', formattedBalance, 'MS tokens');
    
    if (parseFloat(formattedBalance) > 0) {
        console.log('✅ Tokens found! The minting worked even if webhook logs are delayed');
    } else {
        console.log('❌ No tokens found - webhook may not have processed yet');
    }
}

checkBalance();
