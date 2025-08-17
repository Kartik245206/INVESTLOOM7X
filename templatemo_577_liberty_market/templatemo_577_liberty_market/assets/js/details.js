// Constants
const API_CONFIG = {
    BASE_URL: window.location.hostname.includes('localhost') ? 
        'http://localhost:3000' : 'https://liberty-market.onrender.com',
    RAZORPAY_KEY: 'rzp_test_PCS9GocYLB1wd'
};

// Product Loading Functions
async function loadProductDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (!productId) {
        console.error('No product ID found');
        return;
    }

    try {
        const products = await loadProducts();
        const product = products.find(p => p.id == productId);
        if (product) {
            populateProductDetails(product);
        }
    } catch (error) {
        console.error('Error loading product:', error);
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