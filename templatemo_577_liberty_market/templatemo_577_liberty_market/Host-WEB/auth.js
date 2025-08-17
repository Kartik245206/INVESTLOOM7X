// Authentication Functions
const auth = {
    checkAdminAuth() {
        const isLoggedIn = localStorage.getItem('adminLoggedIn');
        const adminSecret = localStorage.getItem('ADMIN_SECRET');
        const adminPhone = localStorage.getItem('adminPhone');
        
        if (!isLoggedIn || !adminSecret || !adminPhone || adminPhone !== '7417915397') {
            localStorage.removeItem('adminLoggedIn');
            localStorage.removeItem('ADMIN_SECRET');
            localStorage.removeItem('adminPhone');
            window.location.href = 'admin_Login_page.html';
            return false;
        }
        return true;
    },

    logout() {
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('ADMIN_SECRET');
        window.location.href = 'admin_Login_page.html';
    }
};

// Check authentication on admin pages
if (window.location.pathname.includes('admin_dashboard.html')) {
    if (!auth.checkAdminAuth()) {
        console.log('Unauthorized access attempt');
    }
}
