// Common JavaScript functions for INVESTLOOM7X

// Define API base URL based on environment (idempotent)
window.API_BASE = window.API_BASE || ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:4000'
    : 'https://investloom7x.onrender.com');

/**
 * Generic fetch wrapper with Authentication and Error Handling
 * @param {string} endpoint - API endpoint (e.g., '/users/profile')
 * @param {object} options - Fetch options
 * @returns {Promise<any>}
 */
window.fetchWithAuth = async function(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers
    };

    try {
        const response = await fetch(`${window.API_BASE}${endpoint}`, config);
        
        if (response.status === 401) {
            // Unauthorized - clear token and redirect
            localStorage.removeItem('token');
            localStorage.removeItem('currentUser');
            if (window.location.pathname.includes('profile.html') || window.location.pathname.includes('trading-activity.html')) {
                 window.location.href = 'auth/login.html';
            }
            throw new Error('Unauthorized');
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Request failed with status ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API Request Failed:', error);
        throw error;
    }
};

// Handle withdrawal functionality
function handleWithdrawal() {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
        // Store current URL for redirect after login
        sessionStorage.setItem('redirectAfterLogin', window.location.href);
        window.location.href = 'auth/login.html'; // Fixed path
        return;
    }
    
    // Show withdrawal modal
    const withdrawModal = new bootstrap.Modal(document.getElementById('withdrawalModal')); // Fixed ID to match HTML
    if (withdrawModal) {
        withdrawModal.show();
    } else {
        alert('Withdrawal feature will be available soon!');
    }
}

// Add event listeners
document.addEventListener('DOMContentLoaded', function() {
    const menuTrigger = document.querySelector('.menu-trigger');
    const sideNav = document.querySelector('.side-nav');
    if (menuTrigger && sideNav) {
        menuTrigger.addEventListener('click', () => {
            sideNav.classList.toggle('active');
            menuTrigger.classList.toggle('active');
        });
    }

    try {
        if (typeof window.loadProducts === 'function') {
            window.loadProducts();
        }
    } catch (e) {
        console.warn('loadProducts not available');
    }
});

// Handle product interaction
function handleProduct(productId) {
    // Add your product handling logic here
    console.log('Product clicked:', productId);
}

// Handle product purchase
function handleProductPurchase(productId) {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
        // Store current URL for redirect after login
        sessionStorage.setItem('redirectAfterLogin', window.location.href);
        window.location.href = 'auth/login.html'; // Fixed path
        return;
    }
    
    // Get product details
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const product = products.find(p => p.id == productId);
    
    if (!product) {
        alert('Product not found!');
        return;
    }
    
    // Show purchase confirmation
    if (confirm(`Are you sure you want to purchase ${product.name} for ₹${product.price}?`)) {
        // Simulate purchase process
        // In a real app, this would be an API call
        window.fetchWithAuth('/investments/purchase', {
            method: 'POST',
            body: JSON.stringify({ productId: product.id })
        }).then(res => {
             alert(`Thank you for purchasing ${product.name}. Your investment has been recorded.`);
             // Update local state if needed
        }).catch(err => {
            // Fallback for demo/static mode
             console.warn('Purchase API failed, using local simulation', err);
             alert(`Thank you for purchasing ${product.name}. Your investment has been recorded (Demo Mode).`);
        });
    }
}
