// Authentication check function
async function checkAuth() {
    try {
        const response = await fetch('/api/auth/status');
        const data = await response.json();
        return data.isAuthenticated;
    } catch (error) {
        console.error('Auth check failed:', error);
        return false;
    }
}

// Function to handle protected navigation
async function handleProtectedNavigation(destination) {
    const isAuthenticated = await checkAuth();
    
    if (isAuthenticated) {
        window.location.href = destination;
    } else {
        // Store the intended destination for redirect after login
        sessionStorage.setItem('redirectAfterLogin', destination);
        window.location.href = '/templatemo_577_liberty_market/auth/login.html';
    }
}

// Handle profile navigation
function navigateToProfile() {
    handleProtectedNavigation('/profile.html');
}

// Handle wallet navigation
function navigateToWallet() {
    handleProtectedNavigation('/profile.html');
}