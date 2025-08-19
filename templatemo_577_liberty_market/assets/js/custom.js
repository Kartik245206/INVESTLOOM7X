(function($) {
    "use strict";

    // Menu Toggle
    $('.mobile-menu-trigger').on('click', function(e) {
        e.preventDefault();
        $(this).toggleClass('active');
        $('#nav-menu').toggleClass('active');
    });

    // Close menu on window resize
    $(window).on('resize', function() {
        if ($(window).width() > 991) {
            $('.mobile-menu-trigger').removeClass('active');
            $('#nav-menu').removeClass('active');
        }
    });

    // Close menu when clicking outside
    $(document).on('click', function(e) {
        if (!$(e.target).closest('.main-nav').length) {
            $('.mobile-menu-trigger').removeClass('active');
            $('#nav-menu').removeClass('active');
        }
    });

    // Product loading function
    function loadProducts() {
        const productContainer = document.getElementById('productContainer');
        if (!productContainer) return;

        // Get products from localStorage
        const products = JSON.parse(localStorage.getItem('products') || '[]');
        
        if (products.length === 0) {
            // Add some default products if none exist
            const defaultProducts = [
                {
                    id: '1',
                    name: 'Basic Investment Plan',
                    price: 5000,
                    dailyEarning: 100,
                    category: 'basic',
                    image: 'assets/images/market-01.jpg',
                    status: 'active'
                },
                {
                    id: '2',
                    name: 'Standard Investment Plan',
                    price: 10000,
                    dailyEarning: 250,
                    category: 'standard',
                    image: 'assets/images/market-02.jpg',
                    status: 'active'
                },
                {
                    id: '3',
                    name: 'Premium Investment Plan',
                    price: 25000,
                    dailyEarning: 750,
                    category: 'premium',
                    image: 'assets/images/market-03.jpg',
                    status: 'active'
                }
            ];
            
            localStorage.setItem('products', JSON.stringify(defaultProducts));
            products.push(...defaultProducts);
        }

        // Filter only active products
        const activeProducts = products.filter(product => product.status === 'active');

        // Generate HTML for products
        productContainer.innerHTML = activeProducts.map(product => `
            <div class="col-lg-4 col-md-6 mb-4">
                <div class="currently-market-item">
                    <div class="item">
                        <div class="left-image">
                            <img src="${product.image}" alt="${product.name}">
                        </div>
                        <div class="right-content">
                            <h4>${product.name}</h4>
                            <div class="price">
                                <span>Price:</span>
                                <h6>₹${product.price}</h6>
                            </div>
                            <div class="earning">
                                <span>Daily Earning:</span>
                                <h6>₹${product.dailyEarning}</h6>
                            </div>
                            <div class="text-button">
                                <a href="details.html?id=${product.id}">View Investment</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Call loadProducts when page loads
    document.addEventListener('DOMContentLoaded', loadProducts);

    // Add filter functionality
    function filterProducts(category) {
        const products = JSON.parse(localStorage.getItem('products') || '[]');
        const filtered = category === 'all' 
            ? products 
            : products.filter(p => p.category === category && p.status === 'active');
        
        const container = document.getElementById('productContainer');
        if (!container) return;
        
        container.innerHTML = filtered.map(product => `
            <div class="col-lg-4 col-md-6 mb-4">
                <div class="currently-market-item">
                    <div class="item">
                        <div class="left-image">
                            <img src="${product.image}" alt="${product.name}">
                        </div>
                        <div class="right-content">
                            <h4>${product.name}</h4>
                            <div class="price">
                                <span>Price:</span>
                                <h6>₹${product.price}</h6>
                            </div>
                            <div class="earning">
                                <span>Daily Earning:</span>
                                <h6>₹${product.dailyEarning}</h6>
                            </div>
                            <div class="text-button">
                                <a href="details.html?id=${product.id}">View Investment</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Add this to your existing event listeners
    document.querySelectorAll('.filter-button').forEach(btn => {
        btn.addEventListener('click', () => filterProducts(btn.dataset.category));
    });
})(jQuery);
