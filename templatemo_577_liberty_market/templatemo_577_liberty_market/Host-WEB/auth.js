// Authentication Functions
const auth = {
    checkAdminAuth() {
        const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
        const adminSecret = localStorage.getItem('ADMIN_SECRET');
        const adminPhone = localStorage.getItem('adminPhone');
        
        // Check all required credentials
        if (!isLoggedIn || !adminSecret || adminPhone !== '7417915397') {
            this.clearAdminSession();
            return false;
        }
        return true;
    },

    clearAdminSession() {
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('ADMIN_SECRET');
        localStorage.removeItem('adminPhone');
        window.location.replace('admin_Login_page.html');
    },

    logout() {
        this.clearAdminSession();
    }
};

// Check authentication on admin pages
if (window.location.pathname.includes('admin_dashboard.html')) {
    if (!auth.checkAdminAuth()) {
        console.log('Unauthorized access attempt');
    }
}

