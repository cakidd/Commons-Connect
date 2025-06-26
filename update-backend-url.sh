#!/bin/bash
OLD_URL="mountainshares-backend-.*\.vercel\.app"
NEW_URL="mountainshares-backend-adlmd9xfn-cakidds-projects.vercel.app"

echo "🔄 Updating backend URLs in frontend files..."

# Update JavaScript files
find . -name "*.js" -type f -exec sed -i "s|https://$OLD_URL|https://$NEW_URL|g" {} \;

# Update HTML files  
find . -name "*.html" -type f -exec sed -i "s|https://$OLD_URL|https://$NEW_URL|g" {} \;

# Update JSON config files
find . -name "*.json" -type f -exec sed -i "s|https://$OLD_URL|https://$NEW_URL|g" {} \;

echo "✅ Backend URL updated in all frontend files"
