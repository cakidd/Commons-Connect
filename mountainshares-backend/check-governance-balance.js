const { ethers } = require('ethers');
require('dotenv').config({ path: '.env.local' });

async function checkGovernanceContract() {
    try {
        console.log('🔍 CHECKING GOVERNANCE CONTRACT STATUS');
        console.log('====================================');
        
        const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
        const contractAddress = '0x76ff8359879a8d1e456538b5cd6075a12025e88f';
        
        // Check ETH balance
        const balance = await provider.getBalance(contractAddress);
        console.log('💰 Contract ETH Balance:', ethers.formatEther(balance), 'ETH');
        console.log('💵 USD Value (~$2400/ETH):', (parseFloat(ethers.formatEther(balance)) * 2400).toFixed(2));
        
        if (balance === 0n) {
            console.log('❌ Contract has no ETH - this is why distribution failed');
            console.log('');
            console.log('💡 Possible issues:');
            console.log('  1. Payment system not sending fees to governance contract');
            console.log('  2. Fees being collected as tokens instead of ETH');
            console.log('  3. Manual funding needed for governance contract');
        } else {
            console.log('✅ Contract has ETH available for distribution');
        }
        
        // Check recent transactions to this contract
        console.log('');
        console.log('🔍 Recent activity:');
        console.log('   Check: https://arbiscan.io/address/0x76ff8359879a8d1e456538b5cd6075a12025e88f');
        
        // Check your Mountain Shares token contract balance
        const tokenContract = process.env.CONTRACT_ADDRESS; // Should be your MS token
        const tokenBalance = await provider.getBalance(tokenContract);
        console.log('');
        console.log('📊 Mountain Shares Token Contract:');
        console.log('   Address:', tokenContract);
        console.log('   ETH Balance:', ethers.formatEther(tokenBalance), 'ETH');
        
    } catch (error) {
        console.error('❌ Check failed:', error.message);
    }
}

checkGovernanceContract();
