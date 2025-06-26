const { ethers } = require('ethers');
require('dotenv').config({ path: '.env.local' });

async function manualMint() {
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    // Correct contract and customer details
    const CONTRACT_ADDRESS = '0xE8A9c6fFE6b2344147D886EcB8608C5F7863B20D';
    const customerWallet = '0x0000000000000000000000000001750891099089';
    const tokenAmount = '1.0'; // 1 token for $1.36 payment
    
    console.log('🔧 MANUAL TOKEN MINTING');
    console.log('=======================');
    console.log('👤 Customer:', customerWallet);
    console.log('💎 Minting:', tokenAmount, 'MS tokens');
    console.log('📍 Contract:', CONTRACT_ADDRESS);
    console.log('🔑 From wallet:', wallet.address);
    
    const tokenABI = ["function mint(address to, uint256 amount) external"];
    const contract = new ethers.Contract(CONTRACT_ADDRESS, tokenABI, wallet);
    
    const tokenAmountWei = ethers.parseUnits(tokenAmount, 18);
    
    try {
        console.log('⏳ Sending mint transaction...');
        const tx = await contract.mint(customerWallet, tokenAmountWei);
        console.log('📄 TX Hash:', tx.hash);
        console.log('⏳ Waiting for confirmation...');
        
        const receipt = await tx.wait();
        console.log('✅ TOKENS MINTED! Block:', receipt.blockNumber);
        console.log('🌐 View on Arbiscan:', `https://arbiscan.io/tx/${tx.hash}`);
        console.log('🎉 Customer now has their Mountain Shares tokens!');
        
    } catch (error) {
        console.error('❌ Manual minting failed:', error.message);
        
        if (error.message.includes('execution reverted')) {
            console.log('💡 Possible reasons:');
            console.log('  - Not authorized to mint');
            console.log('  - Contract paused');
            console.log('  - Invalid parameters');
        }
    }
}

manualMint();
