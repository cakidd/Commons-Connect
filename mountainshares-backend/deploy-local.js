const { ethers } = require('hardhat');
require('dotenv').config({ path: '.env.production' });

async function main() {
    console.log('🚀 DEPLOYING VIA HARDHAT (TERMINAL-BASED)');
    
    const [deployer] = await ethers.getSigners();
    console.log('📍 Deployer:', deployer.address);
    
    const USDCGovernance = await ethers.getContractFactory('USDCGovernanceFeeDistributor');
    const contract = await USDCGovernance.deploy('0xE8A9c6fFE6b2344147D886EcB8608C5F7863B20D');
    
    await contract.deployed();
    console.log('✅ Contract deployed:', contract.address);
}

main().catch(console.error);
