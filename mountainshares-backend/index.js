// Mountain Shares backend with USD→USDC→Governance conversion
console.log("🚀 USD→USDC Conversion system starting...");

const express = require('express');
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');
const { processPaymentWithUSDCConversion } = require('./usdc-conversion-webhook');
require('dotenv').config();

const app = express();

app.use('/api/webhooks/stripe-complete', express.raw({ type: 'application/json' }));
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        cors: 'working', 
        timestamp: new Date().toISOString(),
        governance: 'usd-to-usdc-conversion-enabled',
        features: ['token-minting', 'uniswap-integration', 'governance-distribution']
    });
});

app.post('/create-payment-session', async (req, res) => {
    try {
        const { amount, customerWallet, baseAmount, tokensToReceive } = req.body;
        
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: `${Math.round(tokensToReceive || (amount/136))} Mountain Shares Token${Math.round(tokensToReceive || (amount/136)) > 1 ? 's' : ''}`,
                        description: `West Virginia Community Currency + USD→USDC Governance`
                    },
                    unit_amount: amount,
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: 'https://cakidd.github.io/Commons-Connect/?success=true',
            cancel_url: 'https://cakidd.github.io/Commons-Connect/?cancel=true',
            metadata: {
                customerWallet: customerWallet,
                tokenAmount: tokensToReceive || (amount/136),
                baseAmount: baseAmount || (amount/136),
                totalPaid: (amount/100)
            }
        });

        res.json({
            success: true,
            id: `ms_session_${Date.now()}`,
            orderid: `ms_order_${Date.now()}`,
            url: session.url
        });

    } catch (error) {
        console.error('❌ Payment session creation failed:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/webhooks/stripe-complete', async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
        console.log('✅ USD→USDC webhook verified:', event.type);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const customerWallet = session.metadata.customerWallet;
        const tokenAmount = parseFloat(session.metadata.tokenAmount);
        const baseAmount = session.metadata.baseAmount;

        console.log('🎉 USD→USDC GOVERNANCE PAYMENT COMPLETED!');
        console.log('💎 Customer wallet:', customerWallet);
        console.log('💰 Tokens to mint:', tokenAmount);
        console.log('💵 Base amount:', baseAmount);
        console.log('💱 Will convert to USDC for governance');

        const result = await processPaymentWithUSDCConversion(customerWallet, tokenAmount, baseAmount);
        
        if (result.success) {
            console.log('✅ Complete success!');
            if (result.method === 'USD→USDC→Governance') {
                console.log('🎉 FULL AUTOMATION: Tokens + USDC governance distributed!');
            } else {
                console.log('⏸️ Tokens minted, governance deferred:', result.governanceNote);
            }
        }
    }

    res.json({ received: true });
});

module.exports = app;
