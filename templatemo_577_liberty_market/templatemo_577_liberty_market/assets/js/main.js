// Constants
const API_BASE = 'https://investloom7x.onrender.com';
const UPI_APPS = {
    'gpay': 'com.google.android.apps.nbu.paisa.user',
    'phonepe': 'com.phonepe.app',
    'paytm': 'net.one97.paytm'
};

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Core initialization
    auth.initSession();
    initializeUI();
    testAPIConnection();
    
    // Load and refresh products
    loadHomePageProducts();
    setInterval(loadHomePageProducts, 30000);
    
    // Setup UI and user info
    handleResponsiveLayout();
    updateUserAccountInfo();
    setActiveNavItem();
    
    // Event listeners
    window.addEventListener('resize', handleResponsiveLayout);
});

// UI Initialization Functions
function initializeUI() {
    initializeCategoryItems();
    initializePaymentOptions();
    initializeSideNav();
}

function setActiveNavItem() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.bottom-nav a').forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === currentPage);
    });
}

function handleResponsiveLayout() {
    const isMobile = window.innerWidth <= 768;
    const productContainer = document.querySelector('.currently-market-items');
    
    if (productContainer) {
        productContainer.style.gridTemplateColumns = isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))';
        productContainer.style.gap = isMobile ? '10px' : '15px';
        productContainer.style.padding = isMobile ? '0 10px' : '0';
    }
}

// User Account Functions
function updateUserAccountInfo() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const userAccountInfo = document.querySelector('.user-account-info');
    
    if (!userAccountInfo) return;
    
    if (currentUser) {
        userAccountInfo.style.display = 'flex';
        userAccountInfo.style.cursor = 'pointer';
        
        const userProfilePic = document.getElementById('userProfilePic');
        if (userProfilePic && currentUser.profilePic) {
            userProfilePic.src = currentUser.profilePic;
        }
        
        const userBalanceAmount = document.getElementById('userBalanceAmount');
        if (userBalanceAmount) {
            userBalanceAmount.textContent = '₹' + (currentUser.balance || 0);
        }
        
        userAccountInfo.addEventListener('click', () => window.location.href = 'profile.html');
    } else {
        userAccountInfo.style.display = 'none';
    }
}

// Product Loading Functions
async function loadHomePageProducts() {
    const marketProductsContainer = document.querySelector('.market-products #productContainer');
    if (!marketProductsContainer) {
        console.error('Product container not found');
        return;
    }
    
    try {
        showLoadingState(marketProductsContainer);
        
        // Add debug logging
        console.log('Fetching products...');
        const response = await fetch('/api/products');
        const data = await response.json();
        console.log('Products received:', data);
        
        if (!data.success || !data.products) {
            throw new Error('Invalid response format');
        }
        
        renderProducts(data.products, marketProductsContainer);
    } catch (error) {
        console.error('Failed to load products:', error);
        showErrorState(error, marketProductsContainer);
    }
}

function renderProducts(products, container) {
    if (!products || products.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center">
                <p>No products available at the moment.</p>
            </div>`;
        return;
    }

    const productHTML = products.map(product => `
        <div class="col-lg-4 col-md-6">
            <div class="item">
                <div class="left-image">
                    <img src="${product.imageUrl}" alt="${product.name}" />
                </div>
                <div class="right-content">
                    <h4>${product.name}</h4>
                    <span class="author">
                        <h6>${product.category}</h6>
                    </span>
                    <div class="line-dec"></div>
                    <span class="bid">
                        Price<br><strong>₹${product.price.toLocaleString()}</strong><br>
                        Daily Earning<br><strong>₹${product.dailyEarning.toLocaleString()}</strong>
                    </span>
                    <div class="main-button">
                        <a href="details.html?id=${product._id}">View Details</a>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    container.innerHTML = productHTML;
}

// API Functions
async function testAPIConnection() {
    try {
        const response = await fetch(`${API_BASE}/api/products`);
        const data = await response.json();
        console.log('API Connection Test:', {
            status: response.status,
            ok: response.ok,
            dataReceived: !!data
        });
    } catch (error) {
        console.error('API Connection Test Failed:', error);
    }
}

// Helper Functions
function showLoadingState(container) {
    container.innerHTML = `
        <div class="col-12 text-center">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading products...</span>
            </div>
        </div>
    `;
}

function showErrorState(error, container) {
    container.innerHTML = `
        <div class="col-12 text-center text-danger">
            <i class="fas fa-exclamation-triangle fa-3x mb-3"></i>
            <h4>Error loading products</h4>
            <p>${error.message}</p>
        </div>
    `;
}