// Payment handling for MountainShares
const API_BASE_URL = 'https://mountainshares-production.up.railway.app';

// Initialize Stripe
const stripe = Stripe('pk_live_51P0x4eJwby4IAnqFKrjn7N02DGPRorWWbVdl1KvIvnCnz3eg9MPCbIechFRuh0t4VqEOXOOxcbqhPbFSeJUyytsz000lYoj67w');

// Handle payment initiation
async function initiatePurchase(quantity, walletAddress) {
    try {
        // Show loading state
        updateStatus('Processing payment...', 'warning');

        // Create payment session
        const response = await fetch(`${API_BASE_URL}/create-payment-session`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                quantity,
                walletAddress,
                successUrl: `${window.location.origin}/success.html`,
                cancelUrl: `${window.location.origin}/cancel.html`
            })
        });

        if (!response.ok) {
            throw new Error('Failed to create payment session');
        }

        const session = await response.json();

        // Redirect to Stripe Checkout
        const result = await stripe.redirectToCheckout({
            sessionId: session.id
        });

        if (result.error) {
            throw new Error(result.error.message);
        }
    } catch (error) {
        console.error('Payment error:', error);
        updateStatus(`Payment error: ${error.message}`, 'error');
    }
}

// Verify payment and trigger token delivery
async function verifyPayment(sessionId) {
    try {
        const response = await fetch(`${API_BASE_URL}/verify-payment/${sessionId}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Payment verification failed');
        }

        const result = await response.json();
        
        if (result.status === 'success') {
            updateStatus('Payment successful! Tokens have been sent to your wallet.', 'success');
            // Additional success handling
        } else {
            throw new Error(result.message || 'Payment verification failed');
        }
    } catch (error) {
        console.error('Verification error:', error);
        updateStatus(`Verification error: ${error.message}`, 'error');
    }
}

// Update UI status
function updateStatus(message, type = 'info') {
    const statusElement = document.getElementById('status-message');
    if (statusElement) {
        statusElement.textContent = message;
        statusElement.className = `status-message status-${type}`;
    }
}

// Handle URL parameters for success/cancel scenarios
function handlePaymentReturn() {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    
    if (sessionId) {
        verifyPayment(sessionId);
    }
}

// Export functions
window.initiatePurchase = initiatePurchase;
window.handlePaymentReturn = handlePaymentReturn; 