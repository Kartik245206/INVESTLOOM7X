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
    const currentPath = window.location.pathname;
    const filename = currentPath.split('/').pop() || 'index.html';

    // Update top navigation
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
});

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

