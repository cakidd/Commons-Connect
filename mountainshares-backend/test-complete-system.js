const { ethers } = require('ethers');
require('dotenv').config({ path: '.env.production' });

async function testCompleteSystem() {
    console.log('🧪 TESTING COMPLETE PAYMENT SYSTEM');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const completeProcessorAddress = "0x1F0c8a4c920E1094f85b18F681dcfB2e2b7DE076";
    
    console.log('📍 Complete Payment Processor:', completeProcessorAddress);
    
    // Test view functions
    const abi = [
        "function owner() view returns (address)",
        "function mountainSharesToken() view returns (address)",
        "function governanceContract() view returns (address)",
        "function settlementTreasury() view returns (address)"
    ];
    
    const contract = new ethers.Contract(completeProcessorAddress, abi, provider);
    
    try {
        const owner = await contract.owner();
        const msToken = await contract.mountainSharesToken();
        const govContract = await contract.governanceContract();
        const settlementTreasury = await contract.settlementTreasury();
        
        console.log('🔐 Owner:', owner);
        console.log('🪙 MountainShares Token:', msToken);
        console.log('🏛️ Governance Contract:', govContract);
        console.log('🏦 Settlement Treasury:', settlementTreasury);
        
        // Verify integration
        const expectedGov = "0x57fC62371582F9Ba976887658fd44AE86fa0298a";
        const expectedTreasury = "0x5574A3EcCFd6e9Af35F0B204f148D021be5b9C95";
        const expectedToken = "0xE8A9c6fFE6b2344147D886EcB8608C5F7863B20D";
        
        console.log('');
        console.log('✅ INTEGRATION VERIFICATION:');
        console.log('Governance Contract:', govContract === expectedGov ? '✅ CORRECT' : '❌ MISMATCH');
        console.log('Settlement Treasury:', settlementTreasury === expectedTreasury ? '✅ CORRECT' : '❌ MISMATCH');
        console.log('MountainShares Token:', msToken === expectedToken ? '✅ CORRECT' : '❌ MISMATCH');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testCompleteSystem().catch(console.error);
