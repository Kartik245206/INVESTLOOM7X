// Navigation Functions
async function checkAuthStatus() {
    try {
        const response = await fetch('/api/auth/status', { credentials: 'include' });
        if (!response.ok) {
            return false;
        }
        const ct = response.headers.get('content-type') || '';
        if (!ct.includes('application/json')) {
            return false;
        }
        const data = await response.json();
        return !!data.isAuthenticated;
    } catch (error) {
        return false;
    }
}

async function handleProtectedNavigation(destination) {
    const isAuthenticated = await checkAuthStatus();
    
    if (isAuthenticated) {
        window.location.href = destination;
    } else {
        // Use the centralized redirect function
        redirectToLogin(destination);
    }
}

async function initializeNavigation() {
    const userSection = document.getElementById('userSection');
    const authButtons = document.getElementById('authButtons');
    const isAuthenticated = await checkAuthStatus();

    if (isAuthenticated) {
        if (userSection) userSection.style.display = 'block';
        if (authButtons) authButtons.style.display = 'none';
        
        // Load user data
        try {
            const response = await fetch('/api/auth/user');
            const userData = await response.json();
            
            // Update UI with user data
            document.getElementById('userName').textContent = userData.name || 'User';
            document.getElementById('userBalance').textContent = `₹${userData.balance?.toFixed(2) || '0.00'}`;
            if (userData.avatar) {
                document.getElementById('userAvatar').src = userData.avatar;
            }
        } catch (error) {
            console.error('Failed to load user data:', error);
        }
    } else {
        if (userSection) userSection.style.display = 'none';
        if (authButtons) authButtons.style.display = 'flex';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Function to handle protected navigation
    async function checkAuthAndNavigate(destination) {
        try {
            const response = await fetch('/api/auth/status');
            const data = await response.json();
            
            if (data.isAuthenticated) {
                window.location.href = destination;
            } else {
                sessionStorage.setItem('redirectAfterLogin', destination);
                window.location.href = '/templatemo_577_liberty_market/auth/login.html';
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            window.location.href = '/templatemo_577_liberty_market/auth/login.html';
        }
    }

    // Handle user dropdown
    const avatarBtn = document.getElementById('avatarBtn');
    const userDropdown = document.getElementById('userDropdown');
    
    if (avatarBtn && userDropdown) {
        avatarBtn.addEventListener('click', () => {
            userDropdown.classList.toggle('show');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!avatarBtn.contains(e.target) && !userDropdown.contains(e.target)) {
                userDropdown.classList.remove('show');
            }
        });
    }

    // Handle protected links
    const protectedRoutes = {
        'profile.html': true,
        'wallet.html': true,
        'transactions.html': true,
        'trading-activity.html': true
    };

    // Add click handlers for protected navigation links (skip bottom nav)
    document.querySelectorAll('a').forEach(link => {
        const href = link.getAttribute('href');
        const isBottomNav = link.closest('.bottom-nav') !== null;
        const isProtected = href && protectedRoutes[href.split('/').pop()];
        const markedProtected = link.getAttribute('data-protected') === 'true';
        if (!isBottomNav && (isProtected || markedProtected)) {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                try {
                    handleProtectedNavigation(href);
                } catch (err) {
                    window.location.href = href;
                }
            });
        }
    });

    // Handle logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                await fetch('/api/auth/logout', { method: 'POST' });
                window.location.href = '/';
            } catch (error) {
                console.error('Logout failed:', error);
            }
        });
    }

    // Initialize side navigation if available
    try {
        if (typeof window.initializeSideNav === 'function') {
            window.initializeSideNav();
        }
    } catch (e) {}

    // Force show main navigation
    const mainNav = document.getElementById('mainNavMenu');
    if (mainNav) {
        mainNav.style.display = 'flex';
        mainNav.style.opacity = '1';
        mainNav.style.visibility = 'visible';
    }

    // Set active nav item based on current page
    const currentPath = window.location.pathname;
    const currentPage = currentPath.split('/').pop() || 'index.html';
    
    document.querySelectorAll('.nav-button').forEach(button => {
        const href = button.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });

    // Side Navigation Toggle
    const navHandle = document.getElementById('navHandle');
    const sideNav = document.querySelector('.side-nav');
    const sideNavOverlay = document.getElementById('sideNavOverlay');
    const body = document.body;

    if (sideNav) {
        sideNav.classList.add('nav-initialized');
    }

    if (navHandle) {
        navHandle.addEventListener('click', function() {
            sideNav.classList.toggle('active');
            navHandle.classList.toggle('active');
            body.classList.toggle('nav-expanded');
            if (sideNavOverlay) {
                sideNavOverlay.style.display = sideNav.classList.contains('active') ? 'block' : 'none';
            }
        });
    }

    if (sideNavOverlay) {
        sideNavOverlay.addEventListener('click', function() {
            sideNav.classList.remove('active');
            navHandle.classList.remove('active');
            body.classList.remove('nav-expanded');
            sideNavOverlay.style.display = 'none';
        });
    }
});

    // Navigation Links
    const sideNavLinks = document.querySelectorAll('.side-nav .nav-link');
    
    sideNavLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            sideNavLinks.forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Get the route from data attribute
            const route = this.getAttribute('data-route');
            
            // Handle navigation based on route
            switch(route) {
                case 'Home':
                    window.location.href = 'index.html';
                    break;
                case 'Profile':
                    window.location.href = 'profile.html';
                    break;
                case 'Admin':
                    window.location.href = 'Host-WEB/admin_dashboard.html';
                    break;
                case 'Login':
                    window.location.href = 'login.html';
                    break;
                case 'Signup':
                    window.location.href = 'signup.html';
                    break;
                default:
                    console.log('Unknown route:', route);
            }
        });
    });

    // Set active navigation based on current page
    const currentPath2 = window.location.pathname;
    const currentPage2 = currentPath2.split('/').pop();

    sideNavLinks.forEach(link => {
        const route = link.getAttribute('data-route');
        if (route && currentPage2.includes(route.toLowerCase())) {
            link.classList.add('active');
        }
    });
    
    // Logout handler
    document.getElementById('logoutButton')?.addEventListener('click', function() {
        // Clear user session
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
        
        // Redirect to login page
        window.location.href = 'login.html';
    });

    // Logout handler
    function handleLogout() {
        // Clear user session
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
        
        // Redirect to login page
        window.location.href = 'login.html';
    }
    
    // Set active link based on current page
    const currentPage = window.location.pathname.split('/').pop();
    sideNavLinks.forEach(link => {
        const route = link.getAttribute('data-route');
        if (currentPage.includes(route)) {
            link.classList.add('active');
        }
    });
    
    // Remove any existing click handlers before adding new ones
    document.querySelectorAll('.side-nav a').forEach(link => {
        link.removeEventListener('click', handleNavigation);
        link.addEventListener('click', handleNavigation);
    });
/**
 * Handles navigation routing for side navigation menu links.
 * Prevents default link behavior and redirects to appropriate pages based on the route.
 * Supports admin authentication checking and logout functionality.
 * 
 * @param {Event} e - The click event object from the navigation link
 * @returns {void} This function does not return a value
 */
function handleNavigation(e) {
    e.preventDefault();
    const route = e.currentTarget.getAttribute('data-route') || e.currentTarget.id;

    switch(route) {
        case 'Home':
            window.location.href = 'index.html';
            break;
        case 'Profile':
            window.location.href = 'profile.html';
            break;
        case 'Admin':
            // Check if adminAuth is available
            if (typeof adminAuth !== 'undefined') {
                if (adminAuth.checkAdminAuth()) {
                    window.location.href = 'Host-WEB/admin_Login_page.html';
                } else {
                    window.location.href = 'Host-WEB/admin_Login_page.html';
                }
            } else {
                // Fallback if adminAuth is not loaded
                const isAdminAuthenticated = localStorage.getItem('adminAuthenticated');
                if (isAdminAuthenticated === 'true') {
                    window.location.href = 'Host-WEB/admin_Login_page.html';
                } else {
                    window.location.href = 'Host-WEB/admin_Login_page.html';
                }
            }
            break;
        case 'Login':
            window.location.href = 'login.html';
            break;
        case 'Signup':
            window.location.href = 'signup.html';
            break;
        case 'Logout':
            handleLogout();
            break;
        default:
            console.error('Unknown route:', route);
    }
}


// Add this to your logout function
function handleLogout() {
    // Clear user session
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    
    // Clear admin session if exists
    if (typeof adminAuth !== 'undefined') {
        adminAuth.logout();
    } else {
        localStorage.removeItem('adminAuthenticated');
        localStorage.removeItem('adminUsername');
        localStorage.removeItem('adminSessionExpiry');
    }
    
    // Redirect to home
    window.location.href = 'index.html';
}

// Close mobile menu when clicking outside
document.addEventListener('click', function(event) {
    const sideNav = document.querySelector('.side-nav');
    const menuTrigger = document.querySelector('.menu-trigger');
    if (!sideNav || !menuTrigger) return;
    if (sideNav.classList.contains('active') &&
        !sideNav.contains(event.target) &&
        !menuTrigger.contains(event.target)) {
        sideNav.classList.remove('active');
        menuTrigger.classList.remove('active');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const avatarBtn = document.getElementById('avatarBtn');
    const userDropdown = document.getElementById('userDropdown');
    const userSection = document.getElementById('userSection');
    const authButtons = document.getElementById('authButtons');
    const userName = document.getElementById('userName');
    const userBalance = document.getElementById('userBalance');
    const logoutBtn = document.getElementById('logoutBtn');

    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userToken = localStorage.getItem('userToken');

    if (isLoggedIn && userToken) {
        if (userSection) userSection.style.display = 'block';
        if (authButtons) authButtons.style.display = 'none';
        fetchUserData();
        setInterval(fetchUserBalance, 30000);
    } else {
        if (userSection) userSection.style.display = 'none';
        if (authButtons) authButtons.style.display = 'block';
    }

    // Toggle dropdown
    if (avatarBtn && userDropdown) {
        avatarBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle('show');
        });
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (avatarBtn && userDropdown && !avatarBtn.contains(e.target)) {
            userDropdown.classList.remove('show');
        }
    });

    // Handle logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }

    // Fetch user data from API
    async function fetchUserData() {
        try {
            const response = await fetch('/api/auth/user', {
                headers: {
                    'Authorization': `Bearer ${userToken}`
                }
            });
            const data = await response.json();
            
            if (userName) userName.textContent = data.name;
            if (data.avatar) {
                const avatar = document.getElementById('userAvatar');
                if (avatar) avatar.src = data.avatar;
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    }

    // Fetch user balance
    async function fetchUserBalance() {
        try {
            const response = await fetch('/api/transactions/balance', {
                headers: {
                    'Authorization': `Bearer ${userToken}`
                }
            });
            const data = await response.json();
            if (userBalance) userBalance.textContent = `₹${data.balance.toFixed(2)}`;
        } catch (error) {
            console.error('Error fetching balance:', error);
        }
    }

    // Handle logout
    function logout() {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userToken');
        window.location.href = 'login.html';
    }
});


document.addEventListener('DOMContentLoaded', function() { 
    const sideNav = document.querySelector('.side-nav'); 
    const navHandle = document.getElementById('navHandle'); 
    const sideNavOverlay = document.getElementById('sideNavOverlay'); 

    let touchStart = 0; 
    let touchEnd = 0; 

    // Swipe only works on overlay (not whole document) 
    if (sideNavOverlay) { 
        sideNavOverlay.addEventListener('touchstart', e => { 
            touchStart = e.changedTouches[0].screenX; 
        }); 

        sideNavOverlay.addEventListener('touchend', e => { 
            touchEnd = e.changedTouches[0].screenX; 
            handleSwipe(); 
        }); 
    } 

    function handleSwipe() { 
        const swipeLength = touchEnd - touchStart; 
        if (Math.abs(swipeLength) > 50) { 
            if (swipeLength < 0) { 
                // Swipe left → close menu 
                sideNav.classList.remove('active'); 
                sideNavOverlay.style.display = 'none'; 
            } 
        } 
    } 

    // Arrow button toggles menu 
    navHandle?.addEventListener('click', () => { 
        sideNav.classList.toggle('active'); 
        sideNavOverlay.style.display = sideNav.classList.contains('active') ? 'block' : 'none'; 
    }); 
});

// Side navigation functionality
document.addEventListener('DOMContentLoaded', function () {
    const sideNav = document.querySelector('.side-nav');
    const navHandle = document.getElementById('navHandle');
    const sideNavOverlay = document.getElementById('sideNavOverlay');
    if (!sideNav || !navHandle || !sideNavOverlay) {
        return;
    }
    const navIcon = navHandle.querySelector('i');

    // Function to toggle side nav
    function toggleSideNav(forceClose = false) {
        if (forceClose) {
            sideNav.classList.remove('active');
            sideNavOverlay.style.display = 'none';
            navIcon.classList.remove('{{');
            navIcon.classList.add('}}');
            return;
        }

        sideNav.classList.toggle('active');
        const isActive = sideNav.classList.contains('active');

        sideNavOverlay.style.display = isActive ? 'block' : 'none';
        if (navIcon) {
            navIcon.classList.toggle('{{', !isActive);
            navIcon.classList.toggle('}}', isActive);
        }
    }

    // Click on arrow button
    navHandle.addEventListener('click', () => toggleSideNav());

    // Click on overlay (close only)
    sideNavOverlay.addEventListener('click', () => toggleSideNav(true));
});

// Main Header Navigation (for mobile view)
const mobileMenuButton = document.querySelector('.menu-trigger');
const navigation = document.querySelector('.header-area .nav');

if (mobileMenuButton) {
    mobileMenuButton.addEventListener('click', function() {
        this.classList.toggle('active');
        navigation.classList.toggle('active');
    });
}

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (navigation && mobileMenuButton && !navigation.contains(e.target) && !mobileMenuButton.contains(e.target)) {
        navigation.classList.remove('active');
        mobileMenuButton.classList.remove('active');
    }
});

// Side Navigation Functionality
const sideNav = document.querySelector('.side-nav');
const sideNavToggle = document.querySelector('.side-nav-toggle'); // Use the correct toggle button
const sideNavOverlay = document.querySelector('.side-nav-overlay');

if (sideNav && sideNavToggle && sideNavOverlay) {
    const navIcon = sideNavToggle.querySelector('i');

    // Function to toggle the side navigation
    function toggleSideNav(forceClose = false) {
        const isActive = sideNav.classList.contains('active');

        if (forceClose || isActive) {
            sideNav.classList.remove('active');
            sideNavToggle.classList.remove('active');
            sideNavOverlay.style.display = 'none';
            if (navIcon) navIcon.textContent = '}}';
        } else {
            sideNav.classList.add('active');
            sideNavToggle.classList.add('active');
            sideNavOverlay.style.display = 'block';
            if (navIcon) navIcon.textContent = '{{';
        }
    }

    // Event listener for the toggle button
    sideNavToggle.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent the document click listener from firing
        toggleSideNav();
    });

    // Event listener for the overlay to close the nav
    sideNavOverlay.addEventListener('click', () => {
        toggleSideNav(true);
    });

    // Add active class to clicked nav link
    document.querySelectorAll('.side-nav .nav-link').forEach(link => {
        link.addEventListener('click', function() {
            document.querySelectorAll('.side-nav .nav-link').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// Add padding to body to account for fixed header
const headerArea = document.querySelector('.header-area');
if (headerArea) {
    document.body.style.paddingTop = headerArea.offsetHeight + 'px';
}

document.addEventListener('DOMContentLoaded', function() {
    const mainNav = document.getElementById('mainNavMenu');
    if (mainNav) {
        mainNav.style.display = 'flex';
        mainNav.style.opacity = '1';
        mainNav.style.visibility = 'visible';
    }

    // Set active nav button based on current page
    const currentPath = window.location.pathname;
    const navButtons = document.querySelectorAll('.nav-button');
    
    navButtons.forEach(button => {
        if (button.getAttribute('href') === currentPath.split('/').pop()) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
});

// Prevent any accidental hiding of the menu
window.addEventListener('load', function() {
    const mainNav = document.getElementById('mainNavMenu');
    if (mainNav) {
        mainNav.style.display = 'flex';
        mainNav.style.opacity = '1';
        mainNav.style.visibility = 'visible';
    }
});

// Main Navigation Menu Fix
document.addEventListener('DOMContentLoaded', function() {
    const mainNavMenu = document.getElementById('mainNavMenu');
    
    if (mainNavMenu) {
        // Ensure the menu is properly displayed after DOM is loaded
        mainNavMenu.style.opacity = '0';
        
        // Short timeout to ensure styles are applied
        setTimeout(() => {
            mainNavMenu.style.opacity = '1';
            mainNavMenu.style.visibility = 'visible';
            mainNavMenu.style.display = 'flex';
        }, 50);
    }
    
    // Rest of your existing navigation code...
});

// Navigation Functions
document.addEventListener('DOMContentLoaded', function() {
    // Initialize navigation
    initializeNavigation();
    
    // Set active nav button based on current page
    const currentPath = window.location.pathname;
    const currentPage = currentPath.split('/').pop() || 'index.html';
    
    document.querySelectorAll('.nav-button').forEach(button => {
        const href = button.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
});

// Fix sideNavLinks undefined error
function initializeNavigation() {
    if (sideNavLinks) {
        sideNavLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const target = this.getAttribute('href');
                document.querySelector(target).scrollIntoView({ behavior: 'smooth' });
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', initializeNavigation);
