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
    
    // Clear existing products
    productContainer.innerHTML = '';
    
    // Get products from localStorage or API
    let products = JSON.parse(localStorage.getItem('products') || '[]');
    
    // If no products in localStorage, add sample products
    if (products.length === 0) {
        products = [
            {
                id: 1001,
                image: 'assets/images/featured-01.jpg',
                name: 'Tester Plan',
                category: 'iPhone',
                price: '30',
                total: '100',
                categoryClass: 'msc',
                Plans: 'Tester Plan'
            },
            {
                id: 1002,
                image: 'assets/images/featured-02.jpg',
                name: 'VIP 1 Plan',
                category: 'Smartwatch',
                price: '20000',
                total: '55000',
                categoryClass: 'dig',
                Plans: 'VIP 1 Plan'
            }
        ];
        localStorage.setItem('products', JSON.stringify(products));
    }
    
    // Display products
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'col-lg-6 col-md-6';
        productCard.innerHTML = `
            <div class="item">
                <div class="left-image">
                    <img src="${product.image}" alt="${product.name}" style="border-radius: 20px; min-width: 195px;">
                </div>
                <div class="right-content">
                    <h4>${product.name}</h4>
                    <div class="price">
                        <span>Investment: ₹${product.price}</span>
                        <span>Returns: ₹${product.total}</span>
                    </div>
                    <div class="info">
                        <span>Category: ${product.category}</span>
                    </div>
                    <div class="text-center">
                        <button class="btn btn-primary buy-now" data-product-id="${product.id}">Buy Now</button>
                    </div>
                </div>
            </div>
        `;
        productContainer.appendChild(productCard);
    });
    
    // Add event listeners to Buy Now buttons
    document.querySelectorAll('.buy-now').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-product-id');
            handleProductPurchase(productId);
        });
    });
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