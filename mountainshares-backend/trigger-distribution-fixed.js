const { ethers } = require('ethers');
require('dotenv').config({ path: '.env.local' });

async function triggerDistribution() {
    try {
        console.log('🏛️ TRIGGERING GOVERNANCE FEE DISTRIBUTION');
        console.log('=========================================');
        
        // Check environment variables
        if (!process.env.RPC_URL) {
            throw new Error('RPC_URL not found in environment');
        }
        if (!process.env.PRIVATE_KEY) {
            throw new Error('PRIVATE_KEY not found in environment');
        }
        
        console.log('✅ Environment variables loaded');
        console.log('📡 RPC URL found:', process.env.RPC_URL.substring(0, 20) + '...');
        console.log('🔑 Private key found:', process.env.PRIVATE_KEY.substring(0, 8) + '...');
        
        const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
        
        // Clean the private key - remove any extra quotes or spaces
        let privateKey = process.env.PRIVATE_KEY.trim();
        if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
            privateKey = privateKey.slice(1, -1);
        }
        if (!privateKey.startsWith('0x')) {
            privateKey = '0x' + privateKey;
        }
        
        const wallet = new ethers.Wallet(privateKey, provider);
        
        console.log('👤 Your wallet:', wallet.address);
        console.log('📍 Contract:', '0x76ff8359879a8d1e456538b5cd6075a12025e88f');
        
        // Simple ABI with just the functions we can see
        const contractABI = [
            "function distributeFees() external",
            "function owner() view returns (address)"
        ];
        
        const contract = new ethers.Contract(
            '0x76ff8359879a8d1e456538b5cd6075a12025e88f',
            contractABI,
            wallet
        );
        
        // Check ownership
        try {
            const owner = await contract.owner();
            console.log('✅ Contract Owner:', owner);
            console.log('✅ You are owner:', owner.toLowerCase() === wallet.address.toLowerCase());
            
            if (owner.toLowerCase() !== wallet.address.toLowerCase()) {
                console.log('❌ You are not the owner! Cannot distribute fees.');
                console.log('💡 Expected owner (your wallet):', wallet.address);
                console.log('💡 Actual owner:', owner);
                return { success: false, error: 'Not owner' };
            }
        } catch (e) {
            console.log('⚠️ Could not verify ownership:', e.message);
        }
        
        // Check balance first
        const balance = await provider.getBalance(wallet.address);
        console.log('💰 Your ETH balance:', ethers.formatEther(balance), 'ETH');
        
        if (balance === 0n) {
            console.log('❌ No ETH for gas fees!');
            return { success: false, error: 'No ETH for gas' };
        }
        
        // Trigger fee distribution
        console.log('💰 Calling distributeFees()...');
        const tx = await contract.distributeFees();
        console.log('📄 Transaction sent:', tx.hash);
        console.log('⏳ Waiting for confirmation...');
        
        const receipt = await tx.wait();
        console.log('✅ FEE DISTRIBUTION COMPLETED!');
        console.log('🏛️ Block:', receipt.blockNumber);
        console.log('💎 Gas used:', receipt.gasUsed.toString());
        
        console.log('\n🎉 SUCCESS! Check the 5 governance wallets for new distributions:');
        console.log('  Harmony for Hope: 0xdE75F5168E33db23FA5601b5fc88545be7b287a4');
        console.log('  Treasury: 0x2B686A6C1C4b40fFc748b56b6C7A06c49E361167');
        console.log('  Development: 0xD8bb25076e61B5a382e17171b48d8E0952b5b4f3');
        console.log('  Community Programs: 0xf8C739a101e53F6fE4e24dF768be833ceecEFa84');
        console.log('  Governance: 0x8c09e686BDfd283BdF5f6fFfc780E62A695014F3');
        
        return { success: true, txHash: tx.hash };
        
    } catch (error) {
        console.error('❌ Distribution failed:', error.message);
        
        if (error.message.includes('execution reverted')) {
            console.log('💡 Possible reasons:');
            console.log('  - No fees accumulated yet');
            console.log('  - Distribution already completed');
            console.log('  - Contract needs manual configuration');
        }
        
        return { success: false, error: error.message };
    }
}

triggerDistribution();
