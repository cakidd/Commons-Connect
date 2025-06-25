const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { ethers } = require('ethers');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.log('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    // Extract customer wallet from session metadata
    const customerWallet = session.metadata.wallet;
    const amount = session.amount_total / 100; // Convert from cents
    
    try {
      // Call your smart contract to mint tokens
      const provider = new ethers.JsonRpcProvider(process.env.ARBITRUM_RPC_URL);
      const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
      
      // Your Customer Purchase System contract
      const contractAddress = '0x2a36e8775EbfaAb18E25Df81EF6Eab05E026f400';
      const abi = []; // Add your contract ABI here
      
      const contract = new ethers.Contract(contractAddress, abi, wallet);
      
      // Call contract function to mint tokens
      const tx = await contract.purchaseTokens(customerWallet, amount);
      await tx.wait();
      
      console.log('Tokens minted successfully:', tx.hash);
      
      return res.status(200).json({ 
        success: true, 
        transactionHash: tx.hash 
      });
      
    } catch (error) {
      console.error('Smart contract error:', error);
      return res.status(500).json({ error: 'Token minting failed' });
    }
  }
  
  res.status(200).json({ received: true });
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
}
