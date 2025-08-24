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
    const pageName = currentPath.split('/').pop() || 'index.html';

    // Update side navigation HTML with active states
    const sideNav = document.querySelector('.side-nav');
    if (sideNav) {
        sideNav.innerHTML = `
            <a href="index.html" class="nav-link ${pageName === 'index.html' ? 'active' : ''}">
                <i class="fas fa-home"></i>
                <span>Home</span>
            </a>
            <a href="profile.html" class="nav-link ${pageName === 'profile.html' ? 'active' : ''}">
                <i class="fas fa-user"></i>
                <span>Profile</span>
            </a>
            <a href="details.html" class="nav-link ${pageName === 'details.html' ? 'active' : ''}">
                <i class="fas fa-info-circle"></i>
                <span>Details</span>
            </a>
        `;
    }

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
    
    // Add click handlers for all navigation items
    document.querySelectorAll('.side-nav a').forEach(link => {
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
            // Check admin authentication first
            const isAdminAuthenticated = localStorage.getItem('adminAuthenticated');
            if (!isAdminAuthenticated) {
                window.location.href = 'Host-WEB/admin_Login_page.html';
            } else {
                window.location.href = 'Host-WEB/admin_dashboard.html';
            }
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
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    localStorage.removeItem('adminAuthenticated'); // Also clear admin authentication
    window.location.href = 'login.html';
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
    const mobileMenuButton = document.createElement('div');
    mobileMenuButton.className = 'mobile-menu-button';
    mobileMenuButton.innerHTML = '☰';
    document.querySelector('.header-area .main-nav').prepend(mobileMenuButton);

    const navigation = document.querySelector('.navigation');
    const closeButton = document.createElement('div');
    closeButton.className = 'close-nav';
    closeButton.innerHTML = '×';
    navigation.prepend(closeButton);

    mobileMenuButton.addEventListener('click', () => {
        navigation.classList.add('active');
    });

    closeButton.addEventListener('click', () => {
        navigation.classList.remove('active');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!navigation.contains(e.target) && !mobileMenuButton.contains(e.target)) {
            navigation.classList.remove('active');
        }
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const menuTrigger = document.querySelector('.menu-trigger');
    const sideNav = document.querySelector('.side-nav');
    const nav = document.querySelector('.nav');
    let touchStart = 0;
    let touchEnd = 0;

    // Menu button click handler
    menuTrigger?.addEventListener('click', function() {
        this.classList.toggle('active');
        sideNav.classList.toggle('active');
        nav.classList.toggle('active');
    });

    // Click outside to close
    document.addEventListener('click', function(e) {
        if (!sideNav.contains(e.target) && 
            !menuTrigger.contains(e.target)) {
            sideNav.classList.remove('active');
            nav.classList.remove('active');
            menuTrigger.classList.remove('active');
        }
    });

    // Touch events for mobile swipe
    document.addEventListener('touchstart', e => {
        touchStart = e.changedTouches[0].screenX;
    });

    document.addEventListener('touchend', e => {
        touchEnd = e.changedTouches[0].screenX;
        handleSwipe();
    });

    function handleSwipe() {
        const swipeLength = touchEnd - touchStart;
        if (Math.abs(swipeLength) > 50) {
            if (swipeLength > 0) {
                // Swipe right - open menu
                sideNav.classList.add('active');
            } else {
                // Swipe left - close menu
                sideNav.classList.remove('active');
            }
        }
    }
});

// Side navigation functionality
const sideNav = document.querySelector('.side-nav');
const sideNavToggle = document.getElementById('sideNavToggle');
const sideNavOverlay = document.getElementById('sideNavOverlay');
const toggleIcon = sideNavToggle?.querySelector('i');

function toggleSideNav(forceClose = false) {
    if (forceClose) {
        sideNav?.classList.remove('active');
        sideNavOverlay.style.display = 'none';
        toggleIcon?.classList.remove('fa-arrow-left');
        toggleIcon?.classList.add('fa-arrow-right');
        return;
    }

    sideNav?.classList.toggle('active');
    sideNavOverlay.style.display = sideNav.classList.contains('active') ? 'block' : 'none';


    if (sideNav.classList.contains('active')) {
        toggleIcon.classList.remove('fa-arrow-right');
        toggleIcon.classList.add('fa-arrow-left');
    } else {
        toggleIcon.classList.remove('fa-arrow-left');
         toggleIcon.classList.add('fa-arrow-right');
    }
}

sideNavToggle?.addEventListener('click', () => toggleSideNav());
sideNavOverlay?.addEventListener('click', () => toggleSideNav(true));
    // Navigation toggle using navHandle
const navHandle = document.getElementById('navHandle');
    
if (navHandle) {
    navHandle.addEventListener('click', () => {
        const sideNavElement = document.querySelector('.side-nav');
        if (sideNavElement) {
            sideNavElement.classList.toggle('active');
    
                // Change arrow
            if (sideNavElement.classList.contains('active')) {
                navHandle.textContent = "{{"; // open ho gaya
            } else {
                navHandle.textContent = "}}"; // close ho gaya
            }
        }
    });
}
    
    // Add padding to body to account for fixed header
    document.body.style.paddingTop = document.querySelector('.header-area').offsetHeight + 'px';

document.addEventListener('DOMContentLoaded', function() {
    const sideNav = document.querySelector('.side-nav');
    const sideNavToggle = document.getElementById('sideNavToggle');
    
    if (sideNavToggle) {
        sideNavToggle.addEventListener('click', function() {
            sideNav.classList.toggle('active');
            
            // Update toggle icon
            const icon = this.querySelector('i');
            if (sideNav.classList.contains('active')) {
                icon.classList.remove('fa-arrow-right');
                icon.classList.add('fa-arrow-left');
                sideNav.style.left = '0';
            } else {
                icon.classList.remove('fa-arrow-left');
                icon.classList.add('fa-arrow-right');
                sideNav.style.left = '-180px';
            }
        });
    }

    // Add click handlers to nav links
    document.querySelectorAll('.side-nav .nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            // Remove active class from all links
            document.querySelectorAll('.side-nav .nav-link').forEach(l => {
                l.classList.remove('active');
            });
            // Add active class to clicked link
            this.classList.add('active');
        });
    });
});




