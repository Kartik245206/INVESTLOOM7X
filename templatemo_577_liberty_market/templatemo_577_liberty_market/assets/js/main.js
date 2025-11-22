// Product loading functionality (consolidated)
// Determine API base once
const API_BASE_DETECTED = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:4000'
    : 'https://investloom7x.onrender.com';

// Ensure global API base is set BEFORE any DOMContentLoaded listeners fire
window.API_BASE = window.API_BASE || API_BASE_DETECTED;

// Constants
const UPI_APPS = {
    'gpay': 'com.google.android.apps.nbu.paisa.user',
    'phonepe': 'com.phonepe.app',
    'paytm': 'net.one97.paytm'
};

const SAMPLE_PRODUCTS = [
    {
        _id: 'sample-1',
        name: 'Basic Investment Plan',
        category: 'Starter',
        price: 1000,
        dailyEarning: 50,
        duration: 100,
        description: 'Perfect for beginners looking to start their investment journey.',
        imageUrl: 'assets/images/discover-01.jpg',
        isActive: true
    },
    {
        _id: 'sample-2',
        name: 'Premium Investment Plan',
        category: 'Advanced',
        price: 5000,
        dailyEarning: 300,
        duration: 100,
        description: 'For experienced investors seeking higher returns.',
        imageUrl: 'assets/images/discover-02.jpg',
        isActive: true
    },
    {
        _id: 'sample-3',
        name: 'Elite Investment Plan',
        category: 'Professional',
        price: 10000,
        dailyEarning: 700,
        duration: 100,
        description: 'Maximum returns for professional investors.',
        imageUrl: 'assets/images/discover-03.jpg',
        isActive: true
    }
];

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM Loaded - Initializing...');

    // API base is already set globally at script load time
    const API_BASE = window.API_BASE;

    // Core initialization
    if (typeof auth !== 'undefined') {
        auth.initSession();
    }
    if (typeof initializeUI === 'function') {
        initializeUI();
    }
    if (typeof testAPIConnection === 'function') {
        testAPIConnection(API_BASE);
    }

    // Load products
    loadHomePageProducts();

    // Set up refresh every 30 seconds
    setInterval(() => loadHomePageProducts(), 30000);

    // Setup UI and user info
    handleResponsiveLayout();
    updateUserAccountInfo();

    // Event listeners
    window.addEventListener('resize', handleResponsiveLayout);

    // Set active nav item after a short delay to ensure DOM is ready
    setTimeout(setActiveNavItem, 100);
});

// UI Initialization Functions
function initializeCategoryItems() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    if (filterButtons) {
        filterButtons.forEach(button => {
            button.addEventListener('click', function () {
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
async function loadHomePageProducts(API_BASE = window.API_BASE) {
    const productContainer = document.querySelector('#productContainer');
    if (!productContainer) {
        console.error('Product container not found');
        return;
    }

    // Show loading state only if empty
    if (!productContainer.innerHTML.trim()) {
        showLoadingState(productContainer);
    }

    try {
        const primaryBase = API_BASE || window.API_BASE || API_BASE_DETECTED;
        console.log('Attempting to load products from:', primaryBase);

        // Helper with timeout
        const fetchWithTimeout = async (url, timeout = 5000) => {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), timeout);
            try {
                const res = await fetch(url, {
                    headers: { 'Accept': 'application/json' },
                    signal: controller.signal
                });
                clearTimeout(id);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            } catch (err) {
                clearTimeout(id);
                throw err;
            }
        };

        let data;
        try {
            data = await fetchWithTimeout(`${primaryBase}/api/products`);
        } catch (err1) {
            console.warn('Primary API failed:', err1);
            const fallbackBase = 'https://investloom7x.onrender.com';
            if (primaryBase !== fallbackBase) {
                try {
                    console.log('Trying fallback API...');
                    data = await fetchWithTimeout(`${fallbackBase}/api/products`);
                    window.API_BASE = fallbackBase;
                } catch (err2) {
                    console.warn('Fallback API failed:', err2);
                    throw err2; // Trigger outer catch
                }
            } else {
                throw err1;
            }
        }

        if (data && data.success && Array.isArray(data.products)) {
            console.log('Products loaded from API');
            localStorage.setItem('products', JSON.stringify(data.products));
            renderProducts(data.products, productContainer);
            return;
        }

        throw new Error('Invalid API response');

    } catch (error) {
        console.error('Failed to load products (using fallback):', error);
        // Fallback to sample products immediately
        localStorage.setItem('products', JSON.stringify(SAMPLE_PRODUCTS));
        renderProducts(SAMPLE_PRODUCTS, productContainer);
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
                    <img src="${product.imageUrl || 'assets/images/discover-01.jpg'}" alt="${product.name}" onerror="this.src='assets/images/discover-01.jpg'; this.onerror=null;" />
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
async function testAPIConnection(API_BASE = window.API_BASE) {
    try {
        const primaryBase = API_BASE || window.API_BASE || API_BASE_DETECTED;
        let baseUsed = primaryBase;
        let response;
        try {
            response = await fetch(`${primaryBase}/api/products`, { headers: { 'Accept': 'application/json' } });
        } catch (e1) {
            const fallbackBase = 'https://investloom7x.onrender.com';
            if (primaryBase !== fallbackBase) {
                baseUsed = fallbackBase;
                response = await fetch(`${fallbackBase}/api/products`, { headers: { 'Accept': 'application/json' } });
                window.API_BASE = fallbackBase;
            } else {
                throw e1;
            }
        }
        const info = {
            base: baseUsed,
            status: response.status,
            ok: response.ok,
            contentType: response.headers.get('content-type') || 'unknown'
        };
        let data = null;
        if (info.ok && (info.contentType || '').includes('application/json')) {
            data = await response.json();
        }
        console.log('API Connection Test:', { ...info, dataReceived: !!data });
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

function showErrorState(error, container, API_BASE) {
    container.innerHTML = `
        <div class="col-12 text-center">
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-circle fa-2x mb-3"></i>
                <h4>Unable to load products</h4>
                <p>${error.message}</p>
                <button onclick="loadHomePageProducts('${API_BASE}')" class="btn btn-primary mt-3">
                    <i class="fas fa-sync-alt"></i> Try Again
                </button>
            </div>
        </div>
    `;
}
