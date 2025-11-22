// Handle Google OAuth callback - extract token from URL
(function () {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const userStr = urlParams.get('user');

    if (token && userStr) {
        try {
            const user = JSON.parse(decodeURIComponent(userStr));

            // Store in localStorage
            localStorage.setItem('token', token);
            localStorage.setItem('currentUser', JSON.stringify(user));

            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);

            // Reload to update UI
            window.location.reload();
        } catch (error) {
            console.error('Error processing OAuth callback:', error);
        }
    }
})();
