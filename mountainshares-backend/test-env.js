// Test environment variable access in Vercel function context
console.log('Testing environment variables...');
console.log('STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? 'Found' : 'Missing');
console.log('STRIPE_SECRET_KEY length:', process.env.STRIPE_SECRET_KEY?.length);
console.log('NODE_ENV:', process.env.NODE_ENV);

// Test Stripe initialization
try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    console.log('✅ Stripe initialized successfully');
} catch (error) {
    console.error('❌ Stripe initialization failed:', error.message);
}
