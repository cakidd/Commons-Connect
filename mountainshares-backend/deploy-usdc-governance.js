const { ethers } = require('ethers');
require('dotenv').config({ path: '.env.production' }); // Fix: specify the correct file

async function deployUSDCGovernanceContract() {
    console.log('🚀 DEPLOYING USDC GOVERNANCE CONTRACT');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    console.log('📍 Deployer:', wallet.address);
    console.log('⛽ Gas balance:', ethers.formatEther(await provider.getBalance(wallet.address)), 'ETH');
    
    // MountainShares token address
    const MS_TOKEN_ADDRESS = '0xE8A9c6fFE6b2344147D886EcB8608C5F7863B20D';
    
    console.log('🏛️ GOVERNANCE RECIPIENTS:');
    console.log('   Harmony for Hope: 30% → 0xdE75F5168E33db23FA5601b5fc88545be7b287a4');
    console.log('   Treasury: 30% → 0x2B686A6C1C4b40fFc748b56b6C7A06c49E361167');
    console.log('   Development: 15% → 0xD8bb25076e61B5a382e17171b48d8E0952b5b4f3');
    console.log('   Community Programs: 15% → 0xf8C739a101e53F6fE4e24dF768be833ceecEFa84');
    console.log('   Governance: 10% → 0x8c09e686BDfd283BdF5f6fFfc780E62A695014F3');
    
    console.log('');
    console.log('💰 USDC Contract (Arbitrum): 0xaf88d065e77c8cC2239327C5EDb3A432268e5831');
    console.log('🪙 MountainShares Token:', MS_TOKEN_ADDRESS);
    
    // Contract bytecode - we'll need to compile the Solidity first
    console.log('');
    console.log('📋 NEXT STEPS:');
    console.log('1. Compile USDCGovernance.sol');
    console.log('2. Deploy with constructor parameter:', MS_TOKEN_ADDRESS);
    console.log('3. Verify on Arbiscan');
    console.log('4. Update payment backend to use new contract');
    
    return {
        deployer: wallet.address,
        msTokenAddress: MS_TOKEN_ADDRESS,
        ready: true
    };
}

deployUSDCGovernanceContract().then(console.log).catch(console.error);
