const { ethers } = require('ethers');
require('dotenv').config({ path: '.env.local' });

async function checkContract() {
    console.log('🔍 DEBUGGING CONTRACT AND NETWORK');
    console.log('=================================');
    
    const rpcUrl = process.env.RPC_URL || 'https://arb1.arbitrum.io/rpc';
    console.log('📡 RPC URL:', rpcUrl.substring(0, 40) + '...');
    
    try {
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        
        // Test basic network connection
        const network = await provider.getNetwork();
        console.log('✅ Network connected:', network.name, 'ChainID:', network.chainId.toString());
        
        // Check your wallet balance
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        const balance = await provider.getBalance(wallet.address);
        console.log('👤 Your wallet:', wallet.address);
        console.log('💰 ETH balance:', ethers.formatEther(balance));
        
        // Test the main Mountain Shares contract from your registry
        const contractAddresses = [
            '0xF36Ebf89DF6C7ACdA6F98932Dc6804E833D1eFA1', // From registry - main token
            process.env.CONTRACT_ADDRESS, // From env
            '0xE8A9c6fFE6b2344147D886EcB8608C5F7863B20D'  // From production env we saw earlier
        ];
        
        const tokenABI = [
            "function name() view returns (string)",
            "function symbol() view returns (string)",
            "function totalSupply() view returns (uint256)"
        ];
        
        for (const addr of contractAddresses) {
            if (!addr) continue;
            
            console.log(`\n📍 Testing contract: ${addr}`);
            try {
                const contract = new ethers.Contract(addr, tokenABI, provider);
                const [name, symbol, supply] = await Promise.all([
                    contract.name(),
                    contract.symbol(), 
                    contract.totalSupply()
                ]);
                
                console.log(`✅ Contract found: ${name} (${symbol})`);
                console.log(`📊 Total supply: ${ethers.formatUnits(supply, 18)} tokens`);
                
                // This is our working contract
                console.log(`🎯 ACTIVE CONTRACT: ${addr}`);
                
                // Check customer balance on this contract
                const customerWallet = '0x1750891099089';
                const balanceABI = ["function balanceOf(address) view returns (uint256)"];
                const balanceContract = new ethers.Contract(addr, balanceABI, provider);
                const custBalance = await balanceContract.balanceOf(customerWallet);
                
                console.log(`👤 Customer ${customerWallet}:`);
                console.log(`💎 Balance: ${ethers.formatUnits(custBalance, 18)} ${symbol}`);
                
                if (custBalance > 0) {
                    console.log('🎉 TOKENS FOUND! The payment worked!');
                }
                
            } catch (contractError) {
                console.log(`❌ Contract ${addr} failed: ${contractError.message.substring(0, 60)}...`);
            }
        }
        
    } catch (error) {
        console.error('❌ Network connection failed:', error.message);
    }
}

checkContract();
