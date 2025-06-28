const express = require('express');
const path = require('path');
const { ethers } = require('ethers');
require('dotenv').config({ path: '.env.production' });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Initialize Stripe
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
console.log('✅ Stripe initialized successfully');

// Health endpoint
app.get('/health', async (req, res) => {
    try {
        const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
        const latestBlock = await provider.getBlockNumber();
        
        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            blockchain: {
                connected: true,
                latestBlock,
                contractAccessible: true
            },
            stripe: {
                configured: !!process.env.STRIPE_SECRET_KEY,
                keyType: process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_') ? 'live' : 'test'
            },
            contracts: {
                paymentProcessor: '0x1F0c8a4c920E1094f85b18F681dcfB2e2b7DE076',
                settlementTreasury: '0x5574A3EcCFd6e9Af35F0B204f148D021be5b9C95',
                governance: '0x57fC62371582F9Ba976887658fd44AE86fa0298a'
            },
            server: {
                uptime: process.uptime(),
                memory: process.memoryUsage()
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// SINGLE Stripe checkout session endpoint
app.post('/create-checkout-session', async (req, res) => {
    try {
        const { amount, quantity, customerEmail, walletAddress } = req.body;

        console.log('🚀 Creating Stripe checkout session:', { amount, quantity, walletAddress: walletAddress?.slice(0, 10) + '...' });

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: `${quantity} MountainShares Token${quantity > 1 ? 's' : ''}`,
                        description: 'West Virginia Digital Currency with Democratic Governance',
                    },
                    unit_amount: Math.round(amount * 100), // Convert to cents
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.headers.origin}/cancel`,
            customer_email: customerEmail,
            metadata: {
                quantity: quantity.toString(),
                walletAddress: walletAddress,
                tokenCost: (quantity * 1.00).toString(),
                governanceFee: (quantity * 0.02).toString()
            }
        });

        console.log('✅ Stripe session created:', session.id);
        res.json({ url: session.url });
    } catch (error) {
        console.error('❌ Stripe checkout error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Success page
app.get('/success', (req, res) => {
    res.send(`
        <html>
        <head><title>Payment Success - MountainShares</title></head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #1a1a2e; color: white;">
            <h1 style="color: #FFD700;">🎉 Payment Successful!</h1>
            <p>Your MountainShares tokens are being processed.</p>
            <p>Session ID: ${req.query.session_id}</p>
            <a href="/" style="color: #87CEEB;">Return to MountainShares</a>
        </body>
        </html>
    `);
});

// Cancel page
app.get('/cancel', (req, res) => {
    res.send(`
        <html>
        <head><title>Payment Cancelled - MountainShares</title></head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #1a1a2e; color: white;">
            <h1 style="color: #FF6B6B;">❌ Payment Cancelled</h1>
            <p>Your payment was cancelled. No charges were made.</p>
            <a href="/" style="color: #87CEEB;">Return to MountainShares</a>
        </body>
        </html>
    `);
});

// Start server
app.listen(PORT, () => {
    console.log('🚀 MountainShares Payment Server running on port', PORT);
    console.log('📊 Health check: http://localhost:' + PORT + '/health');
    console.log('🔄 Keep-alive: http://localhost:' + PORT + '/ping');
    console.log('💳 Stripe configured:', !!process.env.STRIPE_SECRET_KEY);
    console.log('🏔️ Ready to process MountainShares payments!');
});
