const { ethers } = require('ethers');
require('dotenv').config({ path: '.env.local' });

async function triggerDistribution() {
    try {
        console.log('🏛️ TRIGGERING GOVERNANCE FEE DISTRIBUTION');
        console.log('=========================================');
        
        // Check all possible RPC URL variable names
        const rpcUrl = process.env.RPC_URL || 
                      process.env.ARBITRUM_RPC_URL || 
                      process.env.ETH_RPC_URL ||
                      'https://arb1.arbitrum.io/rpc';  // Default Arbitrum RPC
        
        const privateKey = process.env.PRIVATE_KEY;
        
        console.log('📡 Using RPC URL:', rpcUrl);
        console.log('🔑 Private key available:', !!privateKey);
        
        if (!privateKey) {
            console.log('❌ PRIVATE_KEY not found in environment variables');
            console.log('💡 Available variables:', Object.keys(process.env).filter(k => k.includes('KEY')));
            return { success: false, error: 'PRIVATE_KEY not found' };
        }
        
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        
        // Clean the private key - remove any extra quotes or spaces
        let cleanPrivateKey = privateKey.trim();
        if (cleanPrivateKey.startsWith('"') && cleanPrivateKey.endsWith('"')) {
            cleanPrivateKey = cleanPrivateKey.slice(1, -1);
        }
        if (!cleanPrivateKey.startsWith('0x')) {
            cleanPrivateKey = '0x' + cleanPrivateKey;
        }
        
        console.log('🔑 Private key format:', cleanPrivateKey.substring(0, 6) + '...');
        
        const wallet = new ethers.Wallet(cleanPrivateKey, provider);
        
        console.log('👤 Your wallet address:', wallet.address);
        console.log('📍 Governance contract:', '0x76ff8359879a8d1e456538b5cd6075a12025e88f');
        
        // Check if this is the expected Harmony for Hope wallet
        const expectedAddress = '0xdE75F5168E33db23FA5601b5fc88545be7b287a4';
        if (wallet.address.toLowerCase() === expectedAddress.toLowerCase()) {
            console.log('✅ Confirmed: This is the Harmony for Hope wallet!');
        } else {
            console.log('⚠️ Warning: This is not the Harmony for Hope wallet');
            console.log('💡 Expected:', expectedAddress);
            console.log('💡 Got:', wallet.address);
        }
        
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
        console.log('🔍 Checking contract ownership...');
        try {
            const owner = await contract.owner();
            console.log('✅ Contract Owner:', owner);
            console.log('✅ You are owner:', owner.toLowerCase() === wallet.address.toLowerCase());
            
            if (owner.toLowerCase() !== wallet.address.toLowerCase()) {
                console.log('❌ You are not the owner! Cannot distribute fees.');
                return { success: false, error: 'Not owner' };
            }
        } catch (e) {
            console.log('⚠️ Could not verify ownership:', e.message);
        }
        
        // Check balance
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
        console.log('🌐 View on Arbiscan:', `https://arbiscan.io/tx/${tx.hash}`);
        
        console.log('\n🎉 SUCCESS! Check the 5 governance wallets for new distributions');
        
        return { success: true, txHash: tx.hash };
        
    } catch (error) {
        console.error('❌ Distribution failed:', error.message);
        
        if (error.message.includes('execution reverted')) {
            console.log('💡 Possible reasons:');
            console.log('  - No fees accumulated yet to distribute');
            console.log('  - Distribution already completed for current balance');
            console.log('  - Contract needs different configuration');
        }
        
        return { success: false, error: error.message };
    }
}

triggerDistribution();
