import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  // Read body (works in prod and `vercel dev`)
  let body = req.body && Object.keys(req.body).length ? req.body : null;
  if (!body) body = JSON.parse(await req.text?.() || '{}');

  const { quantity = 1, customerEmail, walletAddress } = body;
  const q = parseInt(quantity, 10) || 1;

  if (!customerEmail || !walletAddress)
    return res
      .status(400)
      .json({ error: 'Missing customerEmail or walletAddress' });

  // Pricing – driven by q
  const tokenCost     = +(q * 1.0).toFixed(2);
  const governanceFee = +(tokenCost * 0.02).toFixed(2);
  const subtotal      = tokenCost + governanceFee;
  const stripeFee     = Math.ceil(((subtotal * 0.022) + 0.30) * 100) / 100;
  const total         = +(subtotal + stripeFee).toFixed(2);

  // Real Stripe Checkout
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    customer_email: customerEmail,
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: { name: 'MountainShare Token' },
        unit_amount: Math.round(tokenCost * 100),   // cents
      },
      quantity: q,
    }],
    success_url: `${process.env.ORIGIN || 'https://mountback.vercel.app'}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:  `${process.env.ORIGIN || 'https://mountback.vercel.app'}/cancel`,
  });

  return res.status(200).json({
    id: session.id,
    url: session.url,
    amount: total,
    breakdown: { tokenCost, governanceFee, stripeFee, total },
  });
}      // <- single closing brace, nothing after
