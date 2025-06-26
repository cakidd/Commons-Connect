const { ethers } = require('ethers');

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Stripe-Signature');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    try {
      console.log('🎯 Stripe webhook received');
      
      const event = req.body;
      
      // Handle successful payment completion
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        
        console.log('💰 Payment completed for session:', session.id);
        
        // Extract metadata from Stripe session
        const customerWallet = session.metadata?.customerWallet;
        const tokenAmount = parseFloat(session.metadata?.tokenAmount || '1');
        const totalAmountCents = session.amount_total;
        
        console.log('👤 Customer wallet:', customerWallet);
        console.log('🪙 Tokens to mint:', tokenAmount);
        console.log('💵 Payment amount:', totalAmountCents / 100, 'USD');
        
        if (!customerWallet) {
          console.error('❌ No customer wallet in metadata');
          return res.status(400).json({ error: 'Missing customer wallet' });
        }
        
        // Execute blockchain transactions
        const result = await executeBlockchainDistribution(
          customerWallet, 
          tokenAmount, 
          totalAmountCents
        );
        
        if (result.success) {
          console.log('✅ Blockchain execution successful');
          res.status(200).json({ 
            received: true,
            blockchainResult: result,
            message: 'Payment processed and tokens minted successfully'
          });
        } else {
          console.error('❌ Blockchain execution failed:', result.error);
          res.status(500).json({ 
            received: true,
            error: 'Payment received but blockchain execution failed',
            details: result.error 
          });
        }
        
      } else {
        // Handle other webhook events
        console.log('📨 Received webhook event:', event.type);
        res.status(200).json({ received: true });
      }
      
    } catch (error) {
      console.error('❌ Webhook processing error:', error);
      res.status(500).json({ error: 'Webhook processing failed', details: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

async function executeBlockchainDistribution(customerWallet, tokenAmount, totalAmountCents) {
  try {
    console.log('🔗 Starting blockchain execution...');
    
    // Connect to blockchain
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    console.log('📍 Executing from wallet:', wallet.address);
    
    // Calculate governance fee (2% of token value)
    const tokenValueUSD = tokenAmount; // 1 token = $1 USD
    const governanceFeeUSD = tokenValueUSD * 0.02;
    
    console.log('🏛️ Governance fee:', governanceFeeUSD, 'USD');
    
    // For now, just mint tokens (governance distribution can be added later)
    // Mint MS tokens to customer using your deployed contract
    const MS_CONTRACT_ADDRESS = '0xE8A9c6fFE6b2344147D886EcB8608C5F7863B20D';
    const msContract = new ethers.Contract(
      MS_CONTRACT_ADDRESS,
      ["function mint(address to, uint256 amount) external"],
      wallet
    );
    
    // Convert token amount to wei (18 decimals)
    const tokenAmountWei = ethers.parseUnits(tokenAmount.toString(), 18);
    
    console.log('🪙 Minting', tokenAmount, 'MS tokens to', customerWallet);
    
    // Execute mint transaction
    const mintTx = await msContract.mint(customerWallet, tokenAmountWei);
    console.log('⏳ Transaction submitted:', mintTx.hash);
    
    // Wait for confirmation
    const receipt = await mintTx.wait();
    console.log('✅ Transaction confirmed in block:', receipt.blockNumber);
    
    // Return success result
    return {
      success: true,
      txHash: mintTx.hash,
      blockNumber: receipt.blockNumber,
      customerWallet,
      tokenAmount,
      governanceFeeUSD,
      arbiscanUrl: `https://arbiscan.io/tx/${mintTx.hash}`
    };
    
  } catch (error) {
    console.error('❌ Blockchain execution error:', error);
    return {
      success: false,
      error: error.message,
      customerWallet,
      tokenAmount
    };
  }
}
