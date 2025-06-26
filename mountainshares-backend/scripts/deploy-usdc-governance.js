const { ethers } = require("hardhat");
require('dotenv').config({ path: '.env.production' });

async function main() {
    console.log('🚀 DEPLOYING USDC GOVERNANCE VIA HARDHAT');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const [deployer] = await ethers.getSigners();
    console.log('📍 Deployer Address:', deployer.address);
    
    const balance = await deployer.provider.getBalance(deployer.address);
    console.log('⛽ ETH Balance:', ethers.formatEther(balance), 'ETH');
    
    const MS_TOKEN_ADDRESS = '0xE8A9c6fFE6b2344147D886EcB8608C5F7863B20D';
    console.log('🪙 MountainShares Token:', MS_TOKEN_ADDRESS);
    
    console.log('🔧 Deploying USDCGovernanceFeeDistributor...');
    const USDCGovernance = await ethers.getContractFactory("USDCGovernanceFeeDistributor");
    const contract = await USDCGovernance.deploy(MS_TOKEN_ADDRESS);
    
    console.log('⏳ Waiting for deployment confirmation...');
    await contract.waitForDeployment();
    
    const contractAddress = await contract.getAddress();
    console.log('✅ CONTRACT DEPLOYED SUCCESSFULLY!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📍 Contract Address:', contractAddress);
    console.log('🌐 Arbiscan URL:', `https://arbiscan.io/address/${contractAddress}`);
    
    // Save to environment file
    const fs = require('fs');
    const envPath = '.env.production';
    let envContent = fs.readFileSync(envPath, 'utf8');
    envContent = envContent.replace(/^CONTRACT_ADDRESS=.*$/m, '');
    envContent += `\nCONTRACT_ADDRESS=${contractAddress}`;
    fs.writeFileSync(envPath, envContent);
    console.log('💾 Contract address saved to .env.production');
    
    return contractAddress;
}

main()
    .then((address) => {
        console.log('🎉 DEPLOYMENT COMPLETE!');
        console.log('📍 Contract Address:', address);
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Deployment failed:', error);
        process.exit(1);
    });
