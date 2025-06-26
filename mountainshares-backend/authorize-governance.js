const { ethers } = require('ethers');
require('dotenv').config({ path: '.env.production' });

async function authorizeGovernanceContract() {
    console.log('🔗 AUTHORIZING GOVERNANCE CONTRACT IN SETTLEMENT TREASURY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    const settlementTreasuryAddress = "0x5574A3EcCFd6e9Af35F0B204f148D021be5b9C95";
    const governanceContractAddress = "0x57fC62371582F9Ba976887658fd44AE86fa0298a";
    
    console.log('🏦 Settlement Treasury:', settlementTreasuryAddress);
    console.log('🏛️ Governance Contract:', governanceContractAddress);
    
    // Settlement treasury ABI for authorization
    const settlementTreasuryAbi = [
        "function authorizeProcessor(address processor, bool authorized) external",
        "function authorizedProcessors(address) view returns (bool)"
    ];
    
    const settlementTreasury = new ethers.Contract(
        settlementTreasuryAddress, 
        settlementTreasuryAbi, 
        wallet
    );
    
    try {
        // Check if governance contract is already authorized
        const isAuthorized = await settlementTreasury.authorizedProcessors(governanceContractAddress);
        console.log('🔍 Current authorization status:', isAuthorized);
        
        if (!isAuthorized) {
            console.log('🔧 Authorizing governance contract...');
            const tx = await settlementTreasury.authorizeProcessor(governanceContractAddress, true);
            console.log('⏳ Transaction hash:', tx.hash);
            
            await tx.wait();
            console.log('✅ Governance contract authorized successfully!');
        } else {
            console.log('✅ Governance contract already authorized!');
        }
        
        // Verify authorization
        const finalStatus = await settlementTreasury.authorizedProcessors(governanceContractAddress);
        console.log('🎯 Final authorization status:', finalStatus);
        
    } catch (error) {
        console.error('❌ Authorization failed:', error.message);
    }
}

authorizeGovernanceContract().catch(console.error);
