// Common JavaScript functions for INVESTLOOM7X

// Handle withdrawal functionality
function handleWithdrawal() {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
        // Store current URL for redirect after login
        sessionStorage.setItem('redirectAfterLogin', window.location.href);
        window.location.href = 'login.html';
        return;
    }
    
    // Show withdrawal modal
    const withdrawModal = new bootstrap.Modal(document.getElementById('withdrawModal'));
    if (withdrawModal) {
        withdrawModal.show();
    } else {
        alert('Withdrawal feature will be available soon!');
    }
}

// Add event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Initialize menu functionality
    const menuTrigger = document.querySelector('.menu-trigger');
    const sideNav = document.querySelector('.side-nav');
    
    if (menuTrigger && sideNav) {
        menuTrigger.addEventListener('click', () => {
            sideNav.classList.toggle('active');
            menuTrigger.classList.toggle('active');
        });
    }

    // Load products
    loadProducts();
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
        window.location.href = 'login.html';
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
        alert(`Thank you for purchasing ${product.name}. Your investment has been recorded.`);
    }
}