# Stripe Webhook Setup Instructions

## 1. Login to Stripe Dashboard
```bash
# Open Stripe dashboard in your default browser
wslview https://dashboard.stripe.com/webhooks
```

## 2. Webhook Configuration Details
- **Endpoint URL**: https://mountainshares-backend-adlmd9xfn-cakidds-projects.vercel.app/api/webhooks/stripe-complete
- **Events to Listen For**:
  - checkout.session.completed
  - payment_intent.succeeded (optional)

## 3. Copy Webhook Secret
After creating the webhook, copy the webhook signing secret and add it to Vercel:
```bash
vercel env add STRIPE_WEBHOOK_SECRET
# Paste your webhook secret when prompted
```
