#!/bin/bash
echo "🧪 MOUNTAINSHARES TERMINAL TEST SUITE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🛡️  100% SAFE - NO REAL PAYMENTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

SAFE_BACKEND="https://mountainshares-backend-1je8vzjoa-cakidds-projects.vercel.app"

echo ""
echo "🔍 TEST 1: Safe Backend Health"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
curl -s "$SAFE_BACKEND/health"

echo -e "\n\n🔍 TEST 2: Safe Payment Test (NO REAL MONEY)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
curl -s -X POST "$SAFE_BACKEND/test-payment" \
  -H "Content-Type: application/json" \
  -d '{"amount": 100, "customerWallet": "0xtest123", "baseAmount": 1.00, "tokensToReceive": 1.00}'

echo -e "\n\n🔍 TEST 3: Multiple Token Amounts"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
for amount in 1 5 10 50; do
    echo "Testing $amount tokens..."
    curl -s -X POST "$SAFE_BACKEND/test-payment" \
      -H "Content-Type: application/json" \
      -d "{\"amount\": $amount, \"customerWallet\": \"0xtest$amount\", \"baseAmount\": $amount, \"tokensToReceive\": $amount}" | grep -o '"testMode":[^,]*'
done

echo -e "\n\n🔍 TEST 4: Error Handling"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Testing invalid request..."
curl -s -X POST "$SAFE_BACKEND/test-payment" \
  -H "Content-Type: application/json" \
  -d '{}'

echo -e "\n\n✅ ALL TESTS COMPLETE - NO REAL PAYMENTS MADE"
echo "🛡️  Your mom's bank account is safe!"
