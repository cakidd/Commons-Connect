#!/bin/bash

BACKEND_URL="https://mountainshares-backend-adlmd9xfn-cakidds-projects.vercel.app"

echo "🧪 Testing Complete Payment Flow"
echo "================================"

# Test 1: Health Check
echo "1️⃣ Health Check..."
HEALTH=$(curl -s "$BACKEND_URL/health")
echo "Response: $HEALTH"

if echo "$HEALTH" | grep -q "healthy"; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend health check failed"
    exit 1
fi

# Test 2: Create Payment Session
echo -e "\n2️⃣ Creating Payment Session..."
PAYMENT_RESPONSE=$(curl -s -X POST "$BACKEND_URL/create-payment-session" \
    -H "Content-Type: application/json" \
    -d '{"amount": 5, "customerWallet": "0x1234567890abcdef"}')

echo "Payment Response:"
echo "$PAYMENT_RESPONSE" | jq '.' 2>/dev/null || echo "$PAYMENT_RESPONSE"

if echo "$PAYMENT_RESPONSE" | grep -q "checkout.stripe.com"; then
    echo "✅ Payment session created successfully"
    CHECKOUT_URL=$(echo "$PAYMENT_RESPONSE" | jq -r '.url' 2>/dev/null)
    echo "🔗 Checkout URL: $CHECKOUT_URL"
else
    echo "❌ Payment session creation failed"
fi

# Test 3: Test different amounts
echo -e "\n3️⃣ Testing Different Payment Amounts..."
for amount in 1 10 50; do
    echo "Testing amount: $amount tokens"
    curl -s -X POST "$BACKEND_URL/create-payment-session" \
        -H "Content-Type: application/json" \
        -d "{\"amount\": $amount, \"customerWallet\": \"0xtest$amount\"}" | \
        jq '.success, .url' 2>/dev/null || echo "Test completed"
done

echo -e "\n✅ Payment flow testing complete!"
