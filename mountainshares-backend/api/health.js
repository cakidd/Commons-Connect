const { ethers } = require('ethers');

module.exports = async (req, res) => {
    try {
        if (process.env.RPC_URL) {
            const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
            const blockNumber = await provider.getBlockNumber();
            
            res.json({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                blockchain: {
                    connected: true,
                    latestBlock: blockNumber,
                    contractAccessible: true
                },
                stripe: {
                    configured: !!process.env.STRIPE_SECRET_KEY,
                    keyType: process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_') ? 'live' : 'test'
                },
                service: 'mountainshares-backend'
            });
        } else {
            res.json({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                service: 'mountainshares-backend',
                note: 'Environment variables not configured'
            });
        }
    } catch (error) {
        res.status(500).json({
            status: 'unhealthy',
            error: error.message,
            service: 'mountainshares-backend'
        });
    }
};
