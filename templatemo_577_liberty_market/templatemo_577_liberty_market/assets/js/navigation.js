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

