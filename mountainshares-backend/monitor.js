const express = require('express');
const { ethers } = require('ethers');
require('dotenv').config();

const app = express();

// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        // Check blockchain connection
        const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
        const blockNumber = await provider.getBlockNumber();
        
        // Check contract accessibility
        const contractAddress = "0x1F0c8a4c920E1094f85b18F681dcfB2e2b7DE076";
        const code = await provider.getCode(contractAddress);
        
        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            blockchain: {
                connected: true,
                latestBlock: blockNumber,
                contractAccessible: code !== '0x'
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

// Keep-alive endpoint for external monitoring
app.get('/ping', (req, res) => {
    res.send("I'm alive");
});

module.exports = app;
