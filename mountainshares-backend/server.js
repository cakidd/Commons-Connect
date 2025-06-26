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
