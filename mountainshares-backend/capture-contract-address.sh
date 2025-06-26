#!/bin/bash
echo "📝 CAPTURE CONTRACT ADDRESS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "After deploying in Remix IDE, paste your contract address:"
read -p "Contract Address: " CONTRACT_ADDR

# Validate address format
if [[ $CONTRACT_ADDR =~ ^0x[a-fA-F0-9]{40}$ ]]; then
    echo "✅ Valid contract address format"
    
    # Update .env.production with the contract address
    sed -i '/CONTRACT_ADDRESS=/d' .env.production
    echo "CONTRACT_ADDRESS=$CONTRACT_ADDR" >> .env.production
    
    echo "🔗 Contract address saved to .env.production"
    echo "🧪 Testing contract connection..."
    
    # Test the integration
    node integrate-governance-contract.js
    
else
    echo "❌ Invalid address format. Please use format: 0x..."
fi
