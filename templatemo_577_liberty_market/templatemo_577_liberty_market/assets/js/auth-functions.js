// Authentication utility functions
async function checkAuthStatus() {
    try {
        const response = await fetch('/api/auth/status', {
            credentials: 'include' // Important for sending cookies
        });
        if (!response.ok) {
            throw new Error('Auth check failed');
        }
        const data = await response.json();
        return data.isAuthenticated;
    } catch (error) {
        console.error('Auth check failed:', error);
        return false;
    }
}

async function handleProtectedNavigation(destination) {
    try {
        const isAuthenticated = await checkAuthStatus();
        
        if (isAuthenticated) {
            window.location.href = destination;
        } else {
            // Store intended destination
            sessionStorage.setItem('redirectAfterLogin', destination);
            window.location.href = '/templatemo_577_liberty_market/auth/login.html';
        }
    } catch (error) {
        console.error('Navigation error:', error);
        window.location.href = '/templatemo_577_liberty_market/auth/login.html';
    }
}

// Export functions to global scope
window.checkAuthStatus = checkAuthStatus;
window.handleProtectedNavigation = handleProtectedNavigation;