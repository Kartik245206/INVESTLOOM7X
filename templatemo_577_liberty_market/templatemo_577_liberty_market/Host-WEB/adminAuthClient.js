// Client-side Admin Authentication Functions
const adminAuth = {
    checkAdminAuth() {
        const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
        const adminToken = localStorage.getItem('adminToken');
        const adminSecret = localStorage.getItem('ADMIN_SECRET');
        
        // Check all required credentials
        if (!isLoggedIn || !adminToken || !adminSecret) {
            this.clearAdminSession();
            return false;
        }
        return true;
    },

    clearAdminSession() {
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('ADMIN_SECRET');
        localStorage.removeItem('adminPhone');
        window.location.replace('./admin_Login_page.html');
    },

    logout() {
        this.clearAdminSession();
    }
};

async function handleAdminLogin(event) {
    event.preventDefault();
    
    const phone = document.getElementById('adminPhone').value;
    const password = document.getElementById('adminPassword').value;

    // Basic validation
    if (!phone || !password) {
        alert('Please enter both phone number and password');
        return;
    }

    try {
        const response = await fetch('/api/admin/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                phone,
                password 
            })
        });

        if (!response.ok) {
            throw new Error('Invalid credentials');
        }

        const data = await response.json();
        
        // Store auth data
        localStorage.setItem('adminLoggedIn', 'true');
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('ADMIN_SECRET', data.adminSecret);
        localStorage.setItem('adminPhone', phone);

        // Redirect to dashboard
        window.location.href = 'admin_dashboard.html';
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed: ' + error.message);
    }
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