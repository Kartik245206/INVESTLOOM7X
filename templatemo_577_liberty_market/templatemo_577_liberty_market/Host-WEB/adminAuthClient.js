// Client-side Admin Authentication Functions
class AdminAuth {
    constructor() {
        this.adminToken = 'admin_session_token';
        this.adminCredentials = {
            username: 'admin',
            password: 'admin123' // Change this to a secure password
        };
    }

    // Check if admin is authenticated
    checkAdminAuth() {
        const isAuthenticated = localStorage.getItem('adminAuthenticated');
        const sessionExpiry = localStorage.getItem('adminSessionExpiry');
        
        if (!isAuthenticated || !sessionExpiry) {
            this.redirectToLogin();
            return false;
        }

        // Check if session has expired
        if (new Date().getTime() > parseInt(sessionExpiry)) {
            this.logout();
            return false;
        }

        return true;
    }

    // Login function
    login(username, password) {
        if (username === this.adminCredentials.username && 
            password === this.adminCredentials.password) {
            
            // Set authentication state
            localStorage.setItem('adminAuthenticated', 'true');
            localStorage.setItem('adminUsername', username);
            
            // Set session expiry (24 hours from now)
            const expiryTime = new Date().getTime() + (24 * 60 * 60 * 1000);
            localStorage.setItem('adminSessionExpiry', expiryTime.toString());
            
            return true;
        }
        return false;
    }

    // Logout function
    logout() {
        localStorage.removeItem('adminAuthenticated');
        localStorage.removeItem('adminUsername');
        localStorage.removeItem('adminSessionExpiry');
        this.redirectToLogin();
    }

    // Redirect to login page
    redirectToLogin() {
        if (window.location.pathname !== '/Host-WEB/admin_Login_page.html' && 
            !window.location.pathname.includes('admin_Login_page.html')) {
            window.location.replace('./admin_Login_page.html');
        }
    }

    // Redirect to dashboard
    redirectToDashboard() {
        window.location.replace('./admin_dashboard.html');
    }

    // Get admin info
    getAdminInfo() {
        return {
            username: localStorage.getItem('adminUsername'),
            isAuthenticated: this.checkAdminAuth()
        };
    }
}

// Create global instance
const adminAuth = {
    // Check admin credentials
    login(username, password) {
        // Check against environment variables or hardcoded values
        const validUsername = username === 'bhadana';
        const validPassword = password === 'Kartik904541';
        
        if (validUsername && validPassword) {
            // Store admin session
            localStorage.setItem('adminLoggedIn', 'true');
            localStorage.setItem('adminPhone', username);
            localStorage.setItem('ADMIN_SECRET', 'Kartik7417');
            localStorage.setItem('adminToken', 'ADMIN_TOKEN_' + Date.now());
            return true;
        }
        return false;
    },

    // Check if admin is authenticated
    checkAdminAuth() {
        return localStorage.getItem('adminLoggedIn') === 'true' && 
               localStorage.getItem('adminPhone') === 'bhadana' &&
               localStorage.getItem('ADMIN_SECRET');
    },

    // Redirect to dashboard
    redirectToDashboard() {
        window.location.href = './admin_dashboard.html';
    },

    // Logout admin
    logout() {
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('adminPhone');
        localStorage.removeItem('ADMIN_SECRET');
        localStorage.removeItem('adminToken');
        window.location.href = './admin_Login_page.html';
    }
};

function handleAdminLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    
    if (adminAuth.login(username, password)) {
        return true;
    } else {
        return false;
    }
}

function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 3000);
}

// Add event listener for logout button
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('adminLogoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => adminAuth.logout());
    }
});

// Protect admin routes
if (window.location.pathname.includes('admin_')) {
    if (!adminAuth.checkAdminAuth() && 
        !window.location.pathname.includes('admin_Login_page.html')) {
        window.location.replace('./admin_Login_page.html');
    }
}
