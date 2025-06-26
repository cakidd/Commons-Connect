#!/bin/bash

echo "🌐 Frontend Integration Testing"
echo "==============================="

# Check if frontend is using HTTPS (required for Stripe)
echo "1️⃣ Checking frontend URL configuration..."
if [ -f "index.html" ]; then
    echo "Found index.html - checking for backend references..."
    grep -n "mountainshares-backend" index.html || echo "No backend references found in HTML"
fi

# Check JavaScript files for API calls
echo -e "\n2️⃣ Checking JavaScript API integration..."
find . -name "*.js" -exec grep -l "create-payment-session" {} \; | while read file; do
    echo "Found API integration in: $file"
    grep -n "create-payment-session" "$file"
done

# Test CORS headers
echo -e "\n3️⃣ Testing CORS configuration..."
curl -I "https://mountainshares-backend-adlmd9xfn-cakidds-projects.vercel.app/health" | grep -i cors || echo "No CORS headers visible"

echo -e "\n✅ Frontend integration check complete"
