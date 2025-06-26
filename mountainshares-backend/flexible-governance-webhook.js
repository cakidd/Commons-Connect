const { ethers } = require('ethers');

async function mintTokensWithFlexibleGovernance(customerWallet, tokenAmount, baseAmount) {
    try {
        console.log('🏔️ PROCESSING: TOKENS + FLEXIBLE GOVERNANCE');
        console.log('===============================================');
        
        const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

        // Calculate 2% governance fee
        const feeAmountUSD = parseFloat(baseAmount) * 0.02;
        console.log('💎 Governance fee needed:', feeAmountUSD.toFixed(4), 'USD');

        // 1. Always mint tokens to customer
        const tokenContractABI = ["function mint(address to, uint256 amount) external"];
        const tokenContract = new ethers.Contract(process.env.CONTRACT_ADDRESS, tokenContractABI, wallet);
        
        const tokenAmountWei = ethers.parseUnits(tokenAmount.toString(), 18);
        const mintTx = await tokenContract.mint(customerWallet, tokenAmountWei);
        console.log('📄 Mint TX Hash:', mintTx.hash);

        const mintReceipt = await mintTx.wait();
        console.log('✅ TOKENS MINTED! Block:', mintReceipt.blockNumber);

        // 2. Try USDC governance distribution (if available)
        const ARBITRUM_USDC = '0xA0b86a33E6441c8C7e9Fb5e04C4F3aE2F8f97ad7';
        const USDC_ABI = [
            "function transfer(address to, uint256 amount) external returns (bool)",
            "function balanceOf(address account) external view returns (uint256)"
        ];

        try {
            const usdcContract = new ethers.Contract(ARBITRUM_USDC, USDC_ABI, wallet);
            const usdcBalance = await usdcContract.balanceOf(wallet.address);
            const usdcBalanceFormatted = parseFloat(ethers.formatUnits(usdcBalance, 6));
            
            console.log('💰 Available USDC:', usdcBalanceFormatted.toFixed(6), 'USDC');

            if (usdcBalanceFormatted >= feeAmountUSD) {
                console.log('✅ Sufficient USDC - proceeding with governance distribution');
                
                const governanceWallets = [
                    { address: '0xdE75F5168E33db23FA5601b5fc88545be7b287a4', percent: 30, name: 'Harmony for Hope' },
                    { address: '0x2B686A6C1C4b40fFc748b56b6C7A06c49E361167', percent: 30, name: 'Treasury' },
                    { address: '0xD8bb25076e61B5a382e17171b48d8E0952b5b4f3', percent: 15, name: 'Development' },
                    { address: '0xf8C739a101e53F6fE4e24dF768be833ceecEFa84', percent: 15, name: 'Community Programs' },
                    { address: '0x8c09e686BDfd283BdF5f6fFfc780E62A695014F3', percent: 10, name: 'Governance' }
                ];

                const distributionTxs = [];
                const feeAmountUSDC = ethers.parseUnits(feeAmountUSD.toString(), 6);

                for (const govWallet of governanceWallets) {
                    const allocation = (feeAmountUSDC * BigInt(govWallet.percent)) / BigInt(100);
                    const allocationFormatted = parseFloat(ethers.formatUnits(allocation, 6));
                    
                    if (allocation > 0) {
                        console.log(`💰 Sending ${allocationFormatted.toFixed(6)} USDC to ${govWallet.name}`);
                        
                        const tx = await usdcContract.transfer(govWallet.address, allocation);
                        const receipt = await tx.wait();
                        
                        console.log(`✅ ${govWallet.name} confirmed! TX: ${tx.hash}`);
                        
                        distributionTxs.push({
                            name: govWallet.name,
                            amount: allocationFormatted,
                            txHash: tx.hash
                        });
                    }
                }

                return { 
                    success: true, 
                    mintTxHash: mintTx.hash,
                    governanceDistributions: distributionTxs,
                    totalUSDCDistributed: feeAmountUSD,
                    governanceMethod: 'USDC'
                };

            } else {
                console.log('⚠️ Insufficient USDC for governance distribution');
                console.log('💡 Governance will be deferred until USDC is available');
                
                return { 
                    success: true, 
                    mintTxHash: mintTx.hash,
                    governanceNote: `Deferred - need ${feeAmountUSD.toFixed(4)} USDC, have ${usdcBalanceFormatted.toFixed(6)}`,
                    governanceMethod: 'deferred',
                    feeOwed: feeAmountUSD
                };
            }

        } catch (usdcError) {
            console.log('⚠️ USDC distribution failed:', usdcError.message);
            console.log('💡 Tokens minted successfully, governance deferred');
            
            return { 
                success: true, 
                mintTxHash: mintTx.hash,
                governanceNote: 'USDC distribution failed - governance deferred',
                governanceMethod: 'deferred',
                feeOwed: feeAmountUSD
            };
        }

    } catch (error) {
        console.error('❌ PROCESSING FAILED:', error.message);
        return { success: false, error: error.message };
    }
}

module.exports = { mintTokensWithFlexibleGovernance };
