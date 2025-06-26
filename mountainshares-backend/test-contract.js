const { ethers } = require('ethers');
require('dotenv').config({ path: '.env.production' });

async function testContract() {
    console.log('🧪 TESTING DEPLOYED CONTRACT');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const contractAddress = process.env.CONTRACT_ADDRESS;
    
    console.log('📍 Contract Address:', contractAddress);
    console.log('🌐 Arbiscan URL:', `https://arbiscan.io/address/${contractAddress}`);
    
    // Test basic contract connection
    const abi = [
        "function owner() view returns (address)",
        "function mountainSharesToken() view returns (address)"
    ];
    const contract = new ethers.Contract(contractAddress, abi, provider);
    
    try {
        const owner = await contract.owner();
        const msToken = await contract.mountainSharesToken();
        
        console.log('🔐 Contract Owner:', owner);
        console.log('🪙 MountainShares Token:', msToken);
        console.log('✅ Contract is live and accessible!');
        
        return { success: true, owner, msToken };
        
    } catch (error) {
        console.log('❌ Contract test failed:', error.message);
        return { success: false, error: error.message };
    }
}

testContract().catch(console.error);
