export default async function handler(req, res) {
    // ---- ensure body is parsed ----

    let body = req.body;

    if (typeof body === "string") {

        try { body = JSON.parse(body); } catch (_) { body = {}; }

    }

    // 🔍 DEBUG LOGGING – shows exactly what the backend receives

    console.log("🔍 Full request object:", JSON.stringify({\

        method: req.method,\

        url: req.url,\

        headers: req.headers,\

        body: req.body\

    }, null, 2));

    console.log("🔍 Body type:", typeof req.body);

    console.log("🔍 Body keys:", req.body ? Object.keys(req.body) : "no body");
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const { quantity, customerEmail, walletAddress } = body;
        
        // Validate required fields
        if (!quantity || !customerEmail || !walletAddress) {
            return res.status(400).json({ 
                error: 'Missing required fields: quantity, customerEmail, walletAddress' 
            });
        }
        
        // Calculate pricing with mathematical precision
        const tokenCost = parseFloat((quantity * 1.00).toFixed(2));
        const governanceFee = parseFloat((tokenCost * 0.02).toFixed(2));
        const subtotal = tokenCost + governanceFee;
        const stripeFeeExact = (subtotal * 0.022) + 0.30;
        const stripeFee = Math.ceil(stripeFeeExact * 100) / 100;
        const total = subtotal + stripeFee;
        
        // Convert to cents for Stripe
        const amountInCents = Math.round(total * 100);
        
        // For now, create mock session (replace with real Stripe when ready)
        const sessionId = `cs_live_${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
        const checkoutUrl = `https://checkout.stripe.com/c/pay/${sessionId}`;
        
        console.log('✅ Stripe session created:', sessionId);
        
        res.status(200).json({
            id: sessionId,
            url: checkoutUrl,
            amount: total,
            breakdown: {
                tokenCost,
                governanceFee,
                stripeFee,
                total
            }
        });
        
    } catch (error) {
        console.error('❌ Checkout session creation failed:', error);
        res.status(500).json({ 
            error: 'Failed to create checkout session',
            details: error.message 
        });
    }
}
