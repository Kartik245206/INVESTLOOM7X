// Constants
const API_CONFIG = {
    BASE_URL: window.location.hostname.includes('localhost') ? 
        'http://localhost:3000' : 'https://liberty-market.onrender.com',
    RAZORPAY_KEY: 'rzp_test_PCS9GocYLB1wd'
};

// Check authentication on page load
document.addEventListener('DOMContentLoaded', () => {
    authGuard.init();
    if (!authGuard.isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }
    
    loadProductDetails();
    initializePayment();
});

// Product Loading Functions
async function loadProductDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (!productId) {
        console.error('No product ID found');
        return;
    }

    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/api/products/${productId}`, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load product details');
        }

        const product = await response.json();
        populateProductDetails(product);
    } catch (error) {
        console.error('Error loading product:', error);
        window.location.href = 'index.html';
    }
}

// Payment Functions
function initializePayment() {
    const paymentForm = document.getElementById('paymentForm');
    if (paymentForm) {
        paymentForm.addEventListener('submit', handlePaymentSubmit);
    }
}

// ... rest of the JavaScript functions ...

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadProductDetails();
    initializePayment();
    updateUserBalance();
});
