// Frontend Authentication Guard
const authGuard = {
    // Check if user is authenticated
    isAuthenticated() {
        return !!localStorage.getItem('token');
    },

    // Protect routes
    checkAuth() {
        if (!this.isAuthenticated()) {
            const currentPage = window.location.pathname;
            const publicPages = ['/login.html', '/signup.html', '/forgot-password.html'];
            
            if (!publicPages.some(page => currentPage.includes(page))) {
                window.location.href = 'login.html';
                return false;
            }
        }
        return true;
    },

    // Initialize authentication check
    init() {
        // Check on page load
        if (!this.checkAuth()) return;

        // Add listener for token expiration
        window.addEventListener('storage', (e) => {
            if (e.key === 'token' && !e.newValue) {
                this.checkAuth();
            }
        });

        // Check token expiration
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                if (payload.exp * 1000 < Date.now()) {
                    localStorage.removeItem('token');
                    this.checkAuth();
                }
            } catch (error) {
                console.error('Token validation error:', error);
                localStorage.removeItem('token');
                this.checkAuth();
            }
        }
    }
};

