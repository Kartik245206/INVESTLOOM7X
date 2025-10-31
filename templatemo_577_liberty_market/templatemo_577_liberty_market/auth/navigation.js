// Auth routes configuration
const AUTH_PATHS = {
    LOGIN: 'auth/login.html',
    SIGNUP: 'auth/signup.html',
    FORGOT_PASSWORD: 'auth/forgot-password.html',
    RESET_PASSWORD: 'auth/reset-password.html',
    VERIFY_EMAIL: 'auth/verify-email.html'
};

// Check if user is authenticated
function isAuthenticated() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return !!(token && user);
}

// Function to handle protected route navigation
function handleProtectedNavigation(route) {
    if (!isAuthenticated()) {
        window.location.href = AUTH_PATHS.LOGIN;
        return false;
    }
    return true;
}

// Initialize bottom navigation
document.addEventListener('DOMContentLoaded', function() {
    const bottomNav = document.querySelector('.bottom-nav');
    if (bottomNav) {
        bottomNav.addEventListener('click', function(e) {
            const navItem = e.target.closest('.nav-item');
            if (navItem) {
                const href = navItem.getAttribute('href');
                // Check if this is a protected route
                if (href === 'profile.html' || href === 'trading-activity.html') {
                    if (!handleProtectedNavigation(href)) {
                        e.preventDefault();
                    }
                }
            }
        });
    }
});

// Function to update navigation based on auth status
function updateNavigation() {
    const isLoggedIn = isAuthenticated();
    const userAccountInfo = document.querySelector('.user-account-info');
    const authButtons = document.querySelector('.auth-buttons');
    
    if (userAccountInfo) {
        if (isLoggedIn) {
            const user = JSON.parse(localStorage.getItem('user'));
            // Update user info display
            userAccountInfo.innerHTML = `
                <div class="balance-info">
                    <span class="balance-label">Balance:</span>
                    <span class="balance-amount" id="userBalanceAmount">₹${user.balance || 0}</span>
                </div>
                <img id="userProfilePic" src="${user.profilePic || 'assets/images/icon-02.png'}" alt="User Profile" class="profile-pic">
            `;
        } else {
            // Show login/signup buttons
            userAccountInfo.innerHTML = `
                <div class="auth-buttons">
                    <a href="${AUTH_PATHS.LOGIN}" class="btn btn-primary btn-sm">Login</a>
                    <a href="${AUTH_PATHS.SIGNUP}" class="btn btn-outline-primary btn-sm">Sign Up</a>
                </div>
            `;
        }
    }
}

// Export functions for use in other files
window.handleProtectedNavigation = handleProtectedNavigation;
window.updateNavigation = updateNavigation;
window.isAuthenticated = isAuthenticated;