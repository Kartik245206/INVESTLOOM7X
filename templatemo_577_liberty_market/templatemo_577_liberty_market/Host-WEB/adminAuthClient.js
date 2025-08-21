// Client-side Admin Authentication Functions
const adminAuth = {
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
        window.location.replace('./admin_Login_page.html');
    },

    logout() {
        this.clearAdminSession();
    }
};

// Function to handle admin login (client-side simulation)
function adminLogin(phone, password) {
    const ADMIN_PHONE = '7417915397';
    const ADMIN_PASSWORD = 'Kartik904541';

    if (phone === ADMIN_PHONE && password === ADMIN_PASSWORD) {
        localStorage.setItem('adminLoggedIn', 'true');
        localStorage.setItem('ADMIN_SECRET', 'some_secret_token'); // Simulate a token
        localStorage.setItem('adminPhone', ADMIN_PHONE);
        window.location.href = './admin_dashboard.html';
        return true;
    } else {
        return false;
    }
}

// Immediate authentication check for admin dashboard
if (window.location.pathname.includes('admin_dashboard.html')) {
    if (!adminAuth.checkAdminAuth()) {
        console.log('Unauthorized access attempt');
    }
}