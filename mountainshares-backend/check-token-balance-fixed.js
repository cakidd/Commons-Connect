const { ethers } = require('ethers');
require('dotenv').config({ path: '.env.local' });

async function checkBalance() {
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || 'https://arb1.arbitrum.io/rpc');
    
    // Your customer wallet from the Stripe metadata
    const customerWallet = '0x1750891099089'; // From Stripe data
    
    // Main Mountain Shares contract
    const CONTRACT_ADDRESS = '0xF36Ebf89DF6C7ACdA6F98932Dc6804E833D1eFA1';
    
    const tokenABI = [
        "function balanceOf(address owner) view returns (uint256)",
        "function name() view returns (string)",
        "function symbol() view returns (string)"
    ];
    
    const tokenContract = new ethers.Contract(CONTRACT_ADDRESS, tokenABI, provider);
    
    try {
        const [balance, name, symbol] = await Promise.all([
            tokenContract.balanceOf(customerWallet),
            tokenContract.name(),
            tokenContract.symbol()
        ]);
        
        const formattedBalance = ethers.formatUnits(balance, 18);
        
        console.log('🏔️ Mountain Shares Token Balance Check:');
        console.log('📍 Contract:', CONTRACT_ADDRESS);
        console.log('🎯 Token:', name, '(' + symbol + ')');
        console.log('👤 Customer wallet:', customerWallet);
        console.log('💎 Balance:', formattedBalance, 'tokens');
        
        if (parseFloat(formattedBalance) > 0) {
            console.log('✅ SUCCESS! Tokens were minted successfully');
        } else {
            console.log('❌ No tokens found - webhook processing may have failed');
        }
        
    } catch (error) {
        console.error('❌ Balance check failed:', error.message);
    }
}

checkBalance();
