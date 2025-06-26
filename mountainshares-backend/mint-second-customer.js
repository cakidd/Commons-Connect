const { ethers } = require('ethers');
require('dotenv').config({ path: '.env.local' });

async function mintSecondCustomer() {
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    const CONTRACT_ADDRESS = '0xE8A9c6fFE6b2344147D886EcB8608C5F7863B20D';
    const customerWallet = '0xd8bb25076e61b5a382e17171b48d8e0952b5b4f3';
    const tokenAmount = '1.0';
    
    console.log('🔧 MINTING FOR SECOND CUSTOMER WHO PAID $1.36');
    console.log('👤 Customer:', customerWallet);
    console.log('💎 Amount:', tokenAmount, 'MS');
    
    const tokenABI = ["function mint(address to, uint256 amount) external"];
    const contract = new ethers.Contract(CONTRACT_ADDRESS, tokenABI, wallet);
    const tokenAmountWei = ethers.parseUnits(tokenAmount, 18);
    
    const tx = await contract.mint(customerWallet, tokenAmountWei);
    console.log('📄 TX Hash:', tx.hash);
    
    const receipt = await tx.wait();
    console.log('✅ SECOND CUSTOMER MADE WHOLE! Block:', receipt.blockNumber);
}

mintSecondCustomer();
