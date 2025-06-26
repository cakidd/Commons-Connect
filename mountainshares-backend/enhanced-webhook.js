const { ethers } = require('ethers');

async function mintTokensAndFundGovernance(customerWallet, tokenAmount, baseAmount) {
    try {
        console.log('🏔️ PROCESSING PAYMENT: MINT + GOVERNANCE FUNDING');
        console.log('================================================');
        console.log('👤 Customer wallet:', customerWallet);
        console.log('💰 Token amount:', tokenAmount);
        console.log('💵 Base amount:', baseAmount);

        const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

        // Calculate 2% governance fee in ETH
        const feeAmountUSD = parseFloat(baseAmount) * 0.02;
        const ethPrice = 2400; // Approximate ETH price
        const feeAmountETH = feeAmountUSD / ethPrice;
        
        console.log('💎 Governance fee:', feeAmountUSD.toFixed(4), 'USD');
        console.log('💎 Governance fee:', feeAmountETH.toFixed(6), 'ETH');

        // 1. Mint tokens to customer (existing functionality)
        const tokenContractABI = ["function mint(address to, uint256 amount) external"];
        const tokenContract = new ethers.Contract(process.env.CONTRACT_ADDRESS, tokenContractABI, wallet);
        
        const tokenAmountWei = ethers.parseUnits(tokenAmount.toString(), 18);
        const mintTx = await tokenContract.mint(customerWallet, tokenAmountWei);
        console.log('📄 Mint TX Hash:', mintTx.hash);

        const mintReceipt = await mintTx.wait();
        console.log('✅ TOKENS MINTED! Block:', mintReceipt.blockNumber);

        // 2. Send governance fee as ETH to governance contract
        if (feeAmountETH > 0.000001) { // Only if fee is meaningful
            console.log('💰 Funding governance contract with ETH...');
            
            const governanceTx = await wallet.sendTransaction({
                to: '0x76ff8359879a8d1e456538b5cd6075a12025e88f', // Governance distributor
                value: ethers.parseEther(feeAmountETH.toString())
            });
            
            console.log('📄 Governance funding TX:', governanceTx.hash);
            
            const govReceipt = await governanceTx.wait();
            console.log('✅ GOVERNANCE FUNDED! Block:', govReceipt.blockNumber);
            
            // 3. Trigger automatic distribution
            console.log('🏛️ Triggering automatic fee distribution...');
            
            const distributorABI = ["function distributeFees() external"];
            const distributorContract = new ethers.Contract(
                '0x76ff8359879a8d1e456538b5cd6075a12025e88f',
                distributorABI,
                wallet
            );
            
            const distributeTx = await distributorContract.distributeFees();
            console.log('📄 Distribution TX:', distributeTx.hash);
            
            const distReceipt = await distributeTx.wait();
            console.log('✅ FEES DISTRIBUTED TO ALL 5 WALLETS! Block:', distReceipt.blockNumber);
            
            return { 
                success: true, 
                mintTxHash: mintTx.hash,
                governanceTxHash: governanceTx.hash,
                distributeTxHash: distributeTx.hash,
                feeDistributed: feeAmountETH
            };
        } else {
            console.log('⚠️ Fee too small for ETH distribution');
            return { 
                success: true, 
                mintTxHash: mintTx.hash,
                feeDistributed: 0 
            };
        }

    } catch (error) {
        console.error('❌ ENHANCED PROCESSING FAILED:', error.message);
        return { success: false, error: error.message };
    }
}

module.exports = { mintTokensAndFundGovernance };
