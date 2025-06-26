// Debug logging for FUNCTION_INVOCATION_FAILED
console.log("🚀 Function starting...");
console.log("Environment check:");
console.log("- STRIPE_SECRET_KEY:", process.env.STRIPE_SECRET_KEY ? "Found" : "Missing");
console.log("- NODE_ENV:", process.env.NODE_ENV);
console.log("- Timestamp:", new Date().toISOString());

// Environment variable validation
if (!process.env.STRIPE_SECRET_KEY) {
    console.error("❌ Missing STRIPE_SECRET_KEY environment variable");
    process.exit(1);
}
console.log("✅ STRIPE_SECRET_KEY found - length:", process.env.STRIPE_SECRET_KEY?.length);

const express = require('express');
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        cors: 'working',
        timestamp: new Date().toISOString()
    });
});

// Updated payment session endpoint with proper fee handling
app.post('/create-payment-session', async (req, res) => {
    const { amount, customerWallet, baseAmount, tokensToReceive } = req.body;

    try {
        console.log('Creating payment session:', { 
            amount, 
            customerWallet, 
            baseAmount, 
            tokensToReceive 
        });
        
        // Amount should already be in cents from frontend calculation
        const amountInCents = parseInt(amount);
        
        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: 'Mountain Shares Tokens',
                        description: `${tokensToReceive || Math.floor(baseAmount || amountInCents/100)} Mountain Shares tokens - West Virginia Community Currency`
                    },
                    unit_amount: amountInCents,
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: 'https://cakidd.github.io/Commons-Connect/?success=true',
            cancel_url: 'https://cakidd.github.io/Commons-Connect/?cancel=true',
            metadata: {
                customerWallet: customerWallet,
                tokenAmount: tokensToReceive || Math.floor(baseAmount || amountInCents/100),
                baseAmount: baseAmount || (amountInCents/100),
                totalPaid: amountInCents/100
            }
        });

        console.log('✅ Stripe session created:', session.id);

        // Return the checkout URL
        res.json({
            success: true,
            id: `ms_session_${Date.now()}`,
            orderid: `ms_order_${Date.now()}`,
            url: session.url
        });
    } catch (error) {
        console.error('Stripe error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Your webhook handler
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
        const baseAmount = session.metadata.baseAmount;
        const totalPaid = session.metadata.totalPaid;

        console.log('🎉 Payment completed!');
        console.log('💎 Customer wallet:', customerWallet);
        console.log('💰 Tokens to mint:', tokenAmount);
        console.log('💵 Base amount:', baseAmount);
        console.log('💳 Total paid:', totalPaid);

        // TODO: Call your smart contract to mint tokens here
    }

    res.json({ received: true });
});

// For Vercel serverless functions
module.exports = app;
