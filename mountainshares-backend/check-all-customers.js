const { ethers } = require('ethers');

async function checkAllCustomers() {
    // Use direct RPC URL instead of environment variable
    const provider = new ethers.JsonRpcProvider('https://arb1.arbitrum.io/rpc');
    const CONTRACT_ADDRESS = '0xE8A9c6fFE6b2344147D886EcB8608C5F7863B20D';
    
    const customers = [
        { wallet: '0x0000000000000000000000000001750891099089', payment: '$1.36 (first)' },
        { wallet: '0xd8bb25076e61b5a382e17171b48d8e0952b5b4f3', payment: '$1.36 (second)' }
    ];
    
    const tokenABI = ["function balanceOf(address owner) view returns (uint256)"];
    const contract = new ethers.Contract(CONTRACT_ADDRESS, tokenABI, provider);
    
    console.log('👥 CHECKING ALL CUSTOMERS WHO PAID');
    console.log('==================================');
    
    for (const customer of customers) {
        try {
            const balance = await contract.balanceOf(customer.wallet);
            const formattedBalance = ethers.formatUnits(balance, 18);
            
            console.log(`👤 ${customer.wallet}`);
            console.log(`💰 Payment: ${customer.payment}`);
            console.log(`💎 Balance: ${formattedBalance} MS tokens`);
            console.log(`✅ Status: ${parseFloat(formattedBalance) > 0 ? 'SATISFIED' : 'NEEDS TOKENS'}`);
            console.log('');
        } catch (error) {
            console.log(`❌ Error checking ${customer.wallet}:`, error.message);
        }
    }
}

checkAllCustomers();
