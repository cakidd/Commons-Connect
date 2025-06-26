// Minimal function to test basic Vercel deployment
const express = require('express');
const app = express();

// Simple health check
app.get('/health', (req, res) => {
    console.log('Health check called');
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        env: {
            hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
            nodeEnv: process.env.NODE_ENV
        }
    });
});

// Simple test endpoint without Stripe
app.post('/test', (req, res) => {
    console.log('Test endpoint called');
    res.json({ 
        success: true, 
        message: 'Basic function working',
        body: req.body 
    });
});

module.exports = app;
