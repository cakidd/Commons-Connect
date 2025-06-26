const { ethers } = require("hardhat");
require('dotenv').config({ path: '.env.production' });

async function main() {
    console.log('🚀 SIMPLE DEPLOYMENT TO ARBITRUM ONE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const [deployer] = await ethers.getSigners();
    console.log('📍 Deployer:', deployer.address);
    
    const MS_TOKEN_ADDRESS = '0xE8A9c6fFE6b2344147D886EcB8608C5F7863B20D';
    
    const USDCGovernance = await ethers.getContractFactory("USDCGovernanceFeeDistributor");
    const contract = await USDCGovernance.deploy(MS_TOKEN_ADDRESS);
    
    await contract.waitForDeployment();
    const address = await contract.getAddress();
    
    console.log('✅ Contract deployed:', address);
    console.log('🌐 Arbiscan:', `https://arbiscan.io/address/${address}`);
    
    // Save to .env.production
    const fs = require('fs');
    const envContent = fs.readFileSync('.env.production', 'utf8');
    const newContent = envContent.replace(/^CONTRACT_ADDRESS=.*$/m, '') + `\nCONTRACT_ADDRESS=${address}`;
    fs.writeFileSync('.env.production', newContent);
    
    console.log('💾 Address saved to .env.production');
}

main().catch(console.error);
