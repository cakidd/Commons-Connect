const express = require('express');
const { ethers } = require('ethers');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config({ path: '.env.production' });

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Stripe only if API key is available and valid
let stripe;
try {
    if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.startsWith('sk_')) {
        stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        console.log('✅ Stripe initialized successfully');
    } else {
        console.log('⚠️  No valid Stripe API key found');
    }
} catch (error) {
    console.log('❌ Stripe initialization failed:', error.message);
}

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Blockchain setup
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Your deployed contract addresses
const COMPLETE_PAYMENT_PROCESSOR = "0x1F0c8a4c920E1094f85b18F681dcfB2e2b7DE076";
const SETTLEMENT_TREASURY = "0x5574A3EcCFd6e9Af35F0B204f148D021be5b9C95";
const GOVERNANCE_CONTRACT = "0x57fC62371582F9Ba976887658fd44AE86fa0298a";

// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        const blockNumber = await provider.getBlockNumber();
        const contractCode = await provider.getCode(COMPLETE_PAYMENT_PROCESSOR);
        
        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            blockchain: {
                connected: true,
                latestBlock: blockNumber,
                contractAccessible: contractCode !== '0x'
            },
            stripe: {
                configured: !!stripe,
                keyType: process.env.STRIPE_SECRET_KEY ? 
                    (process.env.STRIPE_SECRET_KEY.startsWith('sk_live_') ? 'live' : 'test') : 'none'
            },
            contracts: {
                paymentProcessor: COMPLETE_PAYMENT_PROCESSOR,
                settlementTreasury: SETTLEMENT_TREASURY,
                governance: GOVERNANCE_CONTRACT
            },
            server: {
                uptime: process.uptime(),
                memory: process.memoryUsage()
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'unhealthy',
            error: error.message
        });
    }
});

// Payment processing endpoint
app.post('/process-payment', async (req, res) => {
    try {
        if (!stripe) {
            return res.status(503).json({ 
                error: 'Stripe not configured - payment processing unavailable' 
            });
        }
        
        const { amount, customerEmail, paymentMethodId } = req.body;
        
        console.log('🔄 Processing payment for:', customerEmail, 'Amount:', amount);
        
        res.json({
            success: true,
            message: 'MountainShares payment processor ready',
            contracts: {
                paymentProcessor: COMPLETE_PAYMENT_PROCESSOR,
                settlementTreasury: SETTLEMENT_TREASURY,
                governance: GOVERNANCE_CONTRACT
            },
            stripeConfigured: true
        });
        
    } catch (error) {
        console.error('Payment processing error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Keep-alive endpoint
app.get('/ping', (req, res) => {
    res.send("MountainShares Payment Server - I'm alive! 🏔️");
});

// Contract info endpoint
app.get('/contracts', (req, res) => {
    res.json({
        paymentProcessor: COMPLETE_PAYMENT_PROCESSOR,
        settlementTreasury: SETTLEMENT_TREASURY,
        governance: GOVERNANCE_CONTRACT,
        mountainSharesToken: "0xE8A9c6fFE6b2344147D886EcB8608C5F7863B20D"
    });
});

app.listen(PORT, () => {
    console.log(`🚀 MountainShares Payment Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔄 Keep-alive: http://localhost:${PORT}/ping`);
    console.log(`💳 Stripe configured: ${!!stripe}`);
    console.log(`🏔️ Ready to process MountainShares payments!`);
});

// Serve static frontend files
app.use(express.static('public'));

// Serve frontend at root path
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Enhanced payment processing endpoint
app.post('/process-payment', async (req, res) => {
    try {
        if (!stripe) {
            return res.status(503).json({ 
                error: 'Stripe not configured - payment processing unavailable' 
            });
        }
        
        const { amount, quantity, customerEmail, walletAddress } = req.body;
        
        console.log('🔄 Processing enhanced payment:', {
            amount,
            quantity,
            customerEmail,
            walletAddress: walletAddress?.substring(0, 6) + '...'
        });
        
        // Calculate amounts
        const tokenCost = quantity * 1.00;
        const governanceFee = quantity * 0.02;
        const processingFee = 0.35;
        
        // Here you would integrate with Stripe Checkout
        // and your blockchain contracts
        
        res.json({
            success: true,
            message: 'Enhanced payment processor ready',
            details: {
                quantity,
                tokenCost,
                governanceFee,
                processingFee,
                totalAmount: amount,
                walletAddress,
                contracts: {
                    paymentProcessor: COMPLETE_PAYMENT_PROCESSOR,
                    settlementTreasury: SETTLEMENT_TREASURY,
                    governance: GOVERNANCE_CONTRACT
                }
            }
        });
        
    } catch (error) {
        console.error('Enhanced payment processing error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Create Stripe Checkout session
app.post('/create-checkout-session', async (req, res) => {
    try {
        const { amount, quantity, customerEmail, walletAddress } = req.body;
        
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: `${quantity} MountainShares Token${quantity > 1 ? 's' : ''}`,
                        description: 'West Virginia Digital Currency with Governance Fee Distribution',
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

        res.json({ url: session.url });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create Stripe Checkout session
app.post('/create-checkout-session', async (req, res) => {
    try {
        const { amount, quantity, customerEmail, walletAddress } = req.body;

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: `${quantity} MountainShares Token${quantity > 1 ? 's' : ''}`,
                        description: 'West Virginia Digital Currency with Governance Fee Distribution',
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

        res.json({ url: session.url });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Success and cancel pages
app.get('/success', (req, res) => {
    res.send(`
        <html>
            <head><title>Payment Successful - MountainShares</title></head>
            <body style="font-family: Arial; text-align: center; padding: 50px;">
                <h1>🎉 Payment Successful!</h1>
                <p>Your MountainShares tokens are being processed.</p>
                <p>Session ID: ${req.query.session_id}</p>
                <a href="/">Return to MountainShares</a>
            </body>
        </html>
    `);
});

app.get('/cancel', (req, res) => {
    res.send(`
        <html>
            <head><title>Payment Cancelled - MountainShares</title></head>
            <body style="font-family: Arial; text-align: center; padding: 50px;">
                <h1>❌ Payment Cancelled</h1>
                <p>Your payment was cancelled. No charges were made.</p>
                <a href="/">Return to MountainShares</a>
            </body>
        </html>
    `);
});
