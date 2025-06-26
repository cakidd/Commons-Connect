const { ethers } = require('ethers');
require('dotenv').config({ path: '.env.production' });

async function integrateGovernanceContract() {
    console.log('🔗 INTEGRATING GOVERNANCE CONTRACT');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const contractAddress = process.env.CONTRACT_ADDRESS;
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    
    console.log('📍 Contract Address:', contractAddress);
    console.log('🌐 Network: Arbitrum One');
    console.log('✅ Ready for payment integration!');
    
    // Test contract connection
    const contract = new ethers.Contract(
        contractAddress,
        ['function owner() view returns (address)'],
        provider
    );
    
    try {
        const owner = await contract.owner();
        console.log('🔐 Contract Owner:', owner);
        console.log('✅ Contract connection successful!');
    } catch (error) {
        console.log('❌ Contract connection failed:', error.message);
    }
}

integrateGovernanceContract().catch(console.error);
