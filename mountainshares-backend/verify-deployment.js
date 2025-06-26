require('dotenv').config({ path: '.env.production' });
const { ethers } = require('ethers');

async function verifyDeployment() {
    console.log('🔍 DEPLOYMENT VERIFICATION');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const contractAddress = process.env.CONTRACT_ADDRESS;
    const rpcUrl = process.env.RPC_URL;
    const privateKey = process.env.PRIVATE_KEY;
    
    console.log('📍 Contract Address:', contractAddress || 'NOT SET');
    console.log('🌐 RPC URL:', rpcUrl ? 'CONFIGURED' : 'NOT SET');
    console.log('🔐 Private Key:', privateKey ? 'CONFIGURED' : 'NOT SET');
    
    if (contractAddress && rpcUrl && privateKey) {
        console.log('✅ All environment variables configured!');
        
        // Test contract interaction
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const contract = new ethers.Contract(
            contractAddress,
            [
                'function owner() view returns (address)',
                'function mountainSharesToken() view returns (address)'
            ],
            provider
        );
        
        try {
            const owner = await contract.owner();
            const tokenAddress = await contract.mountainSharesToken();
            
            console.log('🔐 Contract Owner:', owner);
            console.log('🪙 MountainShares Token:', tokenAddress);
            console.log('🎉 CONTRACT DEPLOYMENT SUCCESSFUL!');
            
        } catch (error) {
            console.log('❌ Contract interaction failed:', error.message);
        }
    } else {
        console.log('❌ Missing environment variables');
    }
}

verifyDeployment().catch(console.error);
