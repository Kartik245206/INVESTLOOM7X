// Navigation Functions
function toggleMobileMenu() {
    const menuTrigger = document.querySelector('.menu-trigger');
    const sideNav = document.querySelector('.side-nav');
    const body = document.body;

    menuTrigger.classList.toggle('active');
    sideNav.classList.toggle('active');
    body.classList.toggle('menu-active');
}

// Add active class to current page in navigation
document.addEventListener('DOMContentLoaded', function() {
    // Get current page path
    const currentPath = window.location.pathname;
    

    const navLinks = document.querySelectorAll('.nav li a');
    navLinks.forEach(link => {
        if (link.getAttribute('href').includes(filename)) {
            link.classList.add('active');
        }
    });

    // Update side navigation
    const sideNavItems = document.querySelectorAll('.side-nav-item');
    sideNavItems.forEach(item => {
        const targetPath = item.getAttribute('onclick').match(/'([^']+)'/)[1];
        if (targetPath.includes(filename)) {
            item.classList.add('active');
        }
    });

    const sideNavLinks = document.querySelectorAll('.side-nav a');
    
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
                case 'dashboard':
                    window.location.href = 'index.html';
                    break;
                case 'profile':
                    window.location.href = 'profile.html';
                    break;
                case 'admin':
                    window.location.href = 'Host-WEB/admin_dashboard.html';
                    break;
                case 'logout':
                    handleLogout();
                    break;
                default:
                    console.error('Unknown route:', route);
            }
        });
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
});

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
                    window.location.href = 'Host-WEB/admin_dashboard.html';
                } else {
                    window.location.href = 'Host-WEB/admin_Login_page.html';
                }
            } else {
                // Fallback if adminAuth is not loaded
                const isAdminAuthenticated = localStorage.getItem('adminAuthenticated');
                if (isAdminAuthenticated === 'true') {
                    window.location.href = 'Host-WEB/admin_dashboard.html';
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
    
    if (sideNav.classList.contains('active') && 
        !sideNav.contains(event.target) && 
        !menuTrigger.contains(event.target)) {
        toggleMobileMenu();
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

    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userToken = localStorage.getItem('userToken');

    if (isLoggedIn && userToken) {
        userSection.style.display = 'block';
        authButtons.style.display = 'none';
        
        // Fetch user data
        fetchUserData();
        // Start balance update interval
        setInterval(fetchUserBalance, 30000); // Update every 30 seconds
    } else {
        userSection.style.display = 'none';
        authButtons.style.display = 'block';
    }

    // Toggle dropdown
    avatarBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        userDropdown.classList.toggle('show');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!avatarBtn.contains(e.target)) {
            userDropdown.classList.remove('show');
        }
    });

    // Handle logout
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        logout();
    });

    // Fetch user data from API
    async function fetchUserData() {
        try {
            const response = await fetch('/api/auth/user', {
                headers: {
                    'Authorization': `Bearer ${userToken}`
                }
            });
            const data = await response.json();
            
            userName.textContent = data.name;
            if (data.avatar) {
                document.getElementById('userAvatar').src = data.avatar;
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
            userBalance.textContent = `₹${data.balance.toFixed(2)}`;
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
        navIcon.classList.toggle('{{', !isActive);
        navIcon.classList.toggle('}}', isActive);
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

