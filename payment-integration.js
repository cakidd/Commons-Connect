// Mountain Shares Payment Integration
const BACKEND_URL = 'https://mountainshares-backend-adlmd9xfn-cakidds-projects.vercel.app';

// Function to purchase Mountain Shares tokens
async function purchaseMountainShares(amount, walletAddress) {
    try {
        console.log(`Purchasing ${amount} Mountain Shares tokens...`);
        
        // Show loading state
        const button = document.getElementById('purchase-button');
        if (button) {
            button.textContent = 'Creating payment session...';
            button.disabled = true;
        }
        
        // Create payment session
        const response = await fetch(`${BACKEND_URL}/create-payment-session`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount: parseInt(amount),
                customerWallet: walletAddress || `0x${Date.now()}`
            })
        });
        
        const data = await response.json();
        
        if (data.success && data.url) {
            console.log('Payment session created:', data.id);
            // Redirect to Stripe checkout
            window.location.href = data.url;
        } else {
            throw new Error(data.error || 'Failed to create payment session');
        }
        
    } catch (error) {
        console.error('Payment error:', error);
        alert('Payment setup failed: ' + error.message);
        
        // Reset button
        const button = document.getElementById('purchase-button');
        if (button) {
            button.textContent = 'Buy Mountain Shares';
            button.disabled = false;
        }
    }
}

// Function to add payment button to page
function addPaymentButton() {
    const paymentHTML = `
        <div id="mountain-shares-payment" style="
            background: linear-gradient(135deg, #2c5530 0%, #4a7c5a 100%);
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
            text-align: center;
            color: white;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        ">
            <h3>🏔️ Purchase Mountain Shares Tokens</h3>
            <p>Support West Virginia's Community Currency</p>
            
            <div style="margin: 15px 0;">
                <label for="token-amount">Number of tokens:</label>
                <select id="token-amount" style="margin: 0 10px; padding: 5px;">
                    <option value="1">1 token ($1.37)</option>
                    <option value="5">5 tokens ($6.85)</option>
                    <option value="10">10 tokens ($13.70)</option>
                    <option value="25">25 tokens ($34.25)</option>
                    <option value="50">50 tokens ($68.50)</option>
                    <option value="100">100 tokens ($137.00)</option>
                </select>
            </div>
            
            <div style="margin: 15px 0;">
                <label for="wallet-address">Your wallet address (optional):</label><br>
                <input type="text" id="wallet-address" placeholder="0x..." style="
                    width: 300px; 
                    padding: 8px; 
                    margin-top: 5px; 
                    border: none; 
                    border-radius: 5px;
                ">
            </div>
            
            <button id="purchase-button" onclick="startPurchase()" style="
                background: #ff6b35;
                color: white;
                border: none;
                padding: 12px 30px;
                font-size: 16px;
                border-radius: 5px;
                cursor: pointer;
                transition: background 0.3s;
            ">
                🚀 Buy Mountain Shares
            </button>
        </div>
    `;
    
    // Add to page
    document.body.insertAdjacentHTML('beforeend', paymentHTML);
}

// Function called by button click
function startPurchase() {
    const amount = document.getElementById('token-amount').value;
    const walletAddress = document.getElementById('wallet-address').value;
    
    purchaseMountainShares(amount, walletAddress);
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Mountain Shares payment system loaded');
    // Automatically add payment button if not already present
    if (!document.getElementById('mountain-shares-payment')) {
        addPaymentButton();
    }
});
