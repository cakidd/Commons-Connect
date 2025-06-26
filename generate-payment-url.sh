#!/bin/bash

echo "💳 Mountain Shares Payment URL Generator"
echo "======================================="

# Get amount from user or default to 1
AMOUNT=${1:-1}
WALLET=${2:-"0xtest$(date +%s)"}

echo "Generating payment for $AMOUNT tokens..."

# Create payment session
PAYMENT_RESPONSE=$(curl -s -X POST "https://mountainshares-backend-adlmd9xfn-cakidds-projects.vercel.app/create-payment-session" \
  -H "Content-Type: application/json" \
  -d "{\"amount\": $AMOUNT, \"customerWallet\": \"$WALLET\"}")

# Check if successful
if echo "$PAYMENT_RESPONSE" | grep -q '"success":true'; then
    CHECKOUT_URL=$(echo "$PAYMENT_RESPONSE" | jq -r '.url' 2>/dev/null)
    
    echo "✅ Payment session created!"
    echo "💰 Amount: $AMOUNT Mountain Shares tokens"
    echo "💵 Price: \$$(echo "$AMOUNT * 1.37" | bc 2>/dev/null || echo "1.37 each")"
    echo "🔗 Checkout URL: $CHECKOUT_URL"
    echo ""
    echo "🧪 Test card: 4242 4242 4242 4242"
    echo "⏰ Use this URL quickly - it expires in a few minutes!"
    
    # Try to open automatically
    explorer.exe "$CHECKOUT_URL" 2>/dev/null || echo "Copy URL to browser manually"
else
    echo "❌ Failed to create payment session"
    echo "$PAYMENT_RESPONSE"
fi
