const { ethers } = require('ethers');

async function mintTokensToWallet(customerWallet, tokenAmount) {
    try {
        console.log('🏔️ STARTING TOKEN MINT');
        console.log('👤 Customer wallet:', customerWallet);
        console.log('💰 Token amount:', tokenAmount);
        
        const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        
        console.log('✅ Connected to blockchain');
        
        const contractABI = ["function mint(address to, uint256 amount) external"];
        const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI, wallet);
        
        const tokenAmountWei = ethers.parseUnits(tokenAmount.toString(), 18);
        
        const tx = await contract.mint(customerWallet, tokenAmountWei);
        console.log('📄 TX Hash:', tx.hash);
        
        const receipt = await tx.wait();
        console.log('✅ MINTED! Block:', receipt.blockNumber);
        
        return { success: true, txHash: tx.hash };
        
    } catch (error) {
        console.error('❌ MINT FAILED:', error.message);
        return { success: false, error: error.message };
    }
}

module.exports = { mintTokensToWallet };
