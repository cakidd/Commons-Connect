// Add this webhook endpoint to your Vercel backend

app.post('/api/webhooks/stripe-complete', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.log('❌ Webhook error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const customerWallet = session.metadata.customerWallet;
    const tokenAmount = session.metadata.tokenAmount;

    console.log('🎉 Payment completed! Customer:', customerWallet);
    console.log('💎 Tokens to mint:', tokenAmount);
    
    // TODO: Call your smart contract to mint tokens here
  }

  res.json({ received: true });
});
