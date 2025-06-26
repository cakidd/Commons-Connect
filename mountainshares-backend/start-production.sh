#!/bin/bash

echo "🚀 Starting MountainShares Payment Server in Production Mode"

# Set production environment
export NODE_ENV=production

# Create logs directory
mkdir -p logs

# Start with PM2 for production reliability
pm2 start ecosystem.config.js --env production

# Display status
pm2 status
pm2 logs mountainshares-payment-server --lines 50

echo "✅ Production server started successfully"
echo "📊 Monitor at: http://localhost:3001/health"
echo "🔄 Keep-alive at: http://localhost:8080"
