// URLs configuration
const AUTH_URLS = {
    LOGIN: 'auth/login.html',
    SIGNUP: 'auth/signup.html',
    FORGOT_PASSWORD: 'auth/forgot-password.html',
    RESET_PASSWORD: 'auth/reset-password.html',
    VERIFY_EMAIL: 'auth/verify-email.html'
};

// Export the URLs for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AUTH_URLS;
} else {
    window.AUTH_URLS = AUTH_URLS;
}