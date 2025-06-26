#!/bin/bash

echo "🔐 Environment Variable Management"
echo "================================="

echo "1. List current environment variables:"
vercel env ls

echo -e "\n2. Add new environment variable:"
echo "Usage: vercel env add VARIABLE_NAME"
echo "Example: vercel env add STRIPE_WEBHOOK_SECRET"

echo -e "\n3. Update existing environment variable:"
echo "Usage: vercel env rm VARIABLE_NAME && vercel env add VARIABLE_NAME"

echo -e "\n4. Pull environment variables for local testing:"
vercel env pull .env.local
echo "Environment variables saved to .env.local"
