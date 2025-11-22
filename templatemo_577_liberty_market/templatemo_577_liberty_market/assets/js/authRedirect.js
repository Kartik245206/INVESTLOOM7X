// Centralized auth redirect configuration
const AUTH_PATHS = {
    LOGIN: 'auth/login.html',
    SIGNUP: 'auth/signup.html',
    PROFILE: 'profile.html',
    WALLET: 'trading-activity.html'
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