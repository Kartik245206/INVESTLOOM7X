// Constants
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
function initializeCategoryItems() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    if (filterButtons) {
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Remove active class from all buttons
                filterButtons.forEach(btn => btn.classList.remove('active'));
                // Add active class to clicked button
                this.classList.add('active');
                
                const filter = this.getAttribute('data-filter');
                filterProducts(filter);
            });
        });
    }
}

function filterProducts(filter) {
    const products = document.querySelectorAll('#productContainer .col-lg-4');
    products.forEach(product => {
        const category = product.querySelector('.author h6').textContent.toLowerCase();
        if (filter === 'all' || category === filter.toLowerCase()) {
            product.style.display = '';
        } else {
            product.style.display = 'none';
        }
    });
}

function initializeUI() {
    initializeCategoryItems();
    loadHomePageProducts();
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
    const productContainer = document.querySelector('#productContainer');
    if (!productContainer) {
        console.error('Product container not found');
        return;
    }

    try {
        showLoadingState(productContainer);
        
        // Use the common API_BASE URL
        const response = await fetch(`${API_BASE}/api/products`);
        const data = await response.json();
        
        console.log('Products API Response:', data);

        if (!data.success || !data.products) {
            throw new Error('Invalid product data received');
        }

        renderProducts(data.products, productContainer);
    } catch (error) {
        console.error('Failed to load products:', error);
        showErrorState(error, productContainer);
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
            <p class="mt-3">Loading investment plans...</p>
        </div>
    `;
}

function showErrorState(error, container) {
    container.innerHTML = `
        <div class="col-12 text-center">
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-circle fa-2x mb-3"></i>
                <h4>Unable to load products</h4>
                <p>${error.message}</p>
                <button onclick="loadHomePageProducts()" class="btn btn-primary mt-3">
                    <i class="fas fa-sync-alt"></i> Try Again
                </button>
            </div>
        </div>
    `;
}