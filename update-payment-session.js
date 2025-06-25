// Update your existing create-payment-session endpoint
// Add wallet to session metadata:

metadata: {
  wallet: customerWallet,
  amount: amount.toString()
}
