// Update your frontend payment function to use the new backend
const BACKEND_URL = 'https://mountainshares-backend-adlmd9xfn-cakidds-projects.vercel.app';

async function purchaseTokens(amount, walletAddress) {
    try {
        const response = await fetch(`${BACKEND_URL}/create-payment-session`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount: amount,
                customerWallet: walletAddress
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Redirect to Stripe checkout
            window.location.href = data.url;
        } else {
            console.error('Payment session creation failed:', data.error);
        }
    } catch (error) {
        console.error('Error creating payment session:', error);
    }
}
