// Add this to your Vercel backend create-payment-session endpoint

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Update your existing endpoint to include Stripe checkout
const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  line_items: [{
    price_data: {
      currency: 'usd',
      product_data: {
        name: 'MountainShares Tokens',
        description: 'West Virginia Community Currency'
      },
      unit_amount: 137, // $1.37 in cents
    },
    quantity: amount,
  }],
  mode: 'payment',
  success_url: 'https://cakidd.github.io/Commons-Connect/?success=true',
  cancel_url: 'https://cakidd.github.io/Commons-Connect/?cancel=true',
  metadata: {
    customerWallet: customerWallet,
    tokenAmount: amount
  }
});

// Return the checkout URL
res.json({
  success: true,
  id: `ms_session_${Date.now()}`,
  orderid: `ms_order_${Date.now()}`,
  url: session.url  // This makes frontend redirect work
});
