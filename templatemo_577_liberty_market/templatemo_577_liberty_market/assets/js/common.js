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

// Load products from API or localStorage
function loadProducts() {
    const productContainer = document.getElementById('productContainer');
    if (!productContainer) return;

    // Sample product data - replace with your actual API call
    const products = [
        {
            id: 1,
            name: "Product 1",
            price: "100",
            image: "assets/images/market-01.jpg",
            category: "EMI"
        },
        {
            id: 2,
            name: "Product 2",
            price: "200",
            image: "assets/images/market-02.jpg",
            category: "Deposit"
        }
        // Add more products as needed
    ];

    // Clear existing content
    productContainer.innerHTML = '';

    // Create product cards
    products.forEach(product => {
        const productCard = `
            <div class="col-lg-4 col-md-6">
                <div class="item">
                    <div class="item-image">
                        <img src="${product.image}" alt="${product.name}">
                    </div>
                    <div class="item-info">
                        <h4>${product.name}</h4>
                        <span class="price">₹${product.price}</span>
                        <div class="category">${product.category}</div>
                        <button class="main-button" onclick="handleProduct(${product.id})">
                            View Details
                        </button>
                    </div>
                </div>
            </div>
        `;
        productContainer.innerHTML += productCard;
    });
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