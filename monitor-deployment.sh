#!/bin/bash

DEPLOYMENT_URL="https://mountainshares-backend-adlmd9xfn-cakidds-projects.vercel.app"

echo "📊 Mountain Shares Backend Monitoring"
echo "===================================="

# Function to check endpoint health
check_endpoint() {
    local endpoint=$1
    local name=$2
    
    echo -n "Checking $name... "
    response=$(curl -s -w "%{http_code}" -o /tmp/response.txt "$DEPLOYMENT_URL$endpoint")
    
    if [ "$response" = "200" ]; then
        echo "✅ OK"
    else
        echo "❌ FAILED (HTTP $response)"
        cat /tmp/response.txt
    fi
}

# Monitor key endpoints
check_endpoint "/health" "Health Endpoint"

# Monitor with test payment
echo -e "\nTesting payment creation..."
curl -s -X POST "$DEPLOYMENT_URL/create-payment-session" \
    -H "Content-Type: application/json" \
    -d '{"amount": 1, "customerWallet": "0xmonitor"}' | \
    jq '.success' 2>/dev/null && echo "✅ Payment creation working" || echo "❌ Payment creation failed"

# Check recent logs
echo -e "\n📋 Recent deployment logs:"
vercel logs $DEPLOYMENT_URL --since=5m || echo "Run 'vercel logs $DEPLOYMENT_URL' to see logs"

echo -e "\n⏰ Monitoring check completed at $(date)"
