const { ethers } = require('ethers');

async function checkCustomerTokens() {
    const provider = new ethers.JsonRpcProvider('https://arb1.arbitrum.io/rpc');
    
    // Active contract
    const CONTRACT_ADDRESS = '0xE8A9c6fFE6b2344147D886EcB8608C5F7863B20D';
    
    // Customer wallet from Stripe (needs proper formatting)
    const rawCustomerWallet = '0x1750891099089';
    
    // Pad to proper address length (42 characters)
    const customerWallet = ethers.getAddress('0x' + rawCustomerWallet.slice(2).padStart(40, '0'));
    
    console.log('🔍 CHECKING CUSTOMER TOKENS');
    console.log('===========================');
    console.log('📍 Contract:', CONTRACT_ADDRESS);
    console.log('👤 Customer wallet (formatted):', customerWallet);
    
    const tokenABI = [
        "function balanceOf(address owner) view returns (uint256)",
        "function name() view returns (string)",
        "function symbol() view returns (string)"
    ];
    
    try {
        const contract = new ethers.Contract(CONTRACT_ADDRESS, tokenABI, provider);
        
        const [balance, name, symbol] = await Promise.all([
            contract.balanceOf(customerWallet),
            contract.name(),
            contract.symbol()
        ]);
        
        const formattedBalance = ethers.formatUnits(balance, 18);
        
        console.log('🏔️ Token:', name, '(' + symbol + ')');
        console.log('💎 Customer balance:', formattedBalance, symbol);
        
        if (parseFloat(formattedBalance) > 0) {
            console.log('🎉 SUCCESS! Customer received tokens from the payment!');
            console.log('✅ Your Mountain Shares payment system is working!');
        } else {
            console.log('❌ Customer has no tokens - webhook may not have processed');
        }
        
    } catch (error) {
        console.error('❌ Token check failed:', error.message);
    }
}

checkCustomerTokens();
