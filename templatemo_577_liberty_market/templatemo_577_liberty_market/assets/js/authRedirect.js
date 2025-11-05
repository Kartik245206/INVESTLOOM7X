// Centralized auth redirect configuration
const AUTH_PATHS = {
    LOGIN: '/templatemo_577_liberty_market/auth/login.html',
    SIGNUP: '/templatemo_577_liberty_market/auth/signup.html',
    PROFILE: '/templatemo_577_liberty_market/profile.html',
    WALLET: '/templatemo_577_liberty_market/trading-activity.html'
};

// Function to handle auth redirects
function redirectToLogin(returnUrl = null) {
    if (returnUrl) {
        sessionStorage.setItem('redirectAfterLogin', returnUrl);
    }
    window.location.href = AUTH_PATHS.LOGIN;
}

function redirectToSignup() {
    window.location.href = AUTH_PATHS.SIGNUP;
}

function redirectToProfile() {
    window.location.href = AUTH_PATHS.PROFILE;
}

function redirectToWallet() {
    window.location.href = AUTH_PATHS.WALLET;
}

function getAuthRedirectPath() {
    const path = sessionStorage.getItem('redirectAfterLogin');
    sessionStorage.removeItem('redirectAfterLogin');
    return path || AUTH_PATHS.PROFILE;
}

// Export for use in other files
window.AUTH_PATHS = AUTH_PATHS;
window.redirectToLogin = redirectToLogin;
window.redirectToSignup = redirectToSignup;
window.redirectToProfile = redirectToProfile;
window.redirectToWallet = redirectToWallet;
window.getAuthRedirectPath = getAuthRedirectPath;