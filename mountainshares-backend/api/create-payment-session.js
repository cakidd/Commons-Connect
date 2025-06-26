export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    try {
      const { amount, customerWallet, baseAmount, tokensToReceive } = req.body;
      
      // Validate required fields
      if (!amount || !customerWallet || !baseAmount || !tokensToReceive) {
        return res.status(400).json({
          error: 'Missing required fields: amount, customerWallet, baseAmount, tokensToReceive'
        });
      }

      // Create payment session response
      const paymentSession = {
        id: `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        amount: parseFloat(amount),
        customerWallet,
        baseAmount: parseFloat(baseAmount),
        tokensToReceive: parseFloat(tokensToReceive),
        status: 'created',
        created: new Date().toISOString(),
        checkoutUrl: `https://checkout.stripe.com/session/${Date.now()}`
      };

      res.status(200).json({
        success: true,
        paymentSession
      });
    } catch (error) {
      console.error('Payment session creation error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
