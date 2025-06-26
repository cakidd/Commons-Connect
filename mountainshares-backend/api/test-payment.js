export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    const { amount, customerWallet, baseAmount, tokensToReceive } = req.body;
    
    // SIMULATE ONLY - NO REAL PAYMENT PROCESSING
    res.status(200).json({
      success: true,
      testMode: true,
      message: '🧪 TEST MODE - No real payment processed',
      paymentSession: {
        id: `test_${Date.now()}`,
        amount: parseFloat(amount),
        status: 'test_simulated',
        warning: 'THIS IS A TEST - NO MONEY CHARGED'
      }
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
