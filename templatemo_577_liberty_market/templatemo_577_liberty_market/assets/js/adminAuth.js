const ADMIN_CREDENTIALS = {
    phone: '7417915397',
    password: 'Kartik904541'
};

async function handleAdminLogin(event) {
    event.preventDefault();
    
    const phone = document.getElementById('adminPhone').value;
    const password = document.getElementById('adminPassword').value;

    try {
        const response = await fetch('/api/auth/admin/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ phone, password })
        });

        if (!response.ok) {
            throw new Error('Invalid credentials');
        }

        const data = await response.json();
        
        // Store admin auth data
        localStorage.setItem('adminLoggedIn', 'true');
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminPhone', phone);

        // Redirect to dashboard
        window.location.href = 'admin_dashboard.html';
    } catch (error) {
        alert('Login failed: ' + error.message);
    }
}

// Check admin auth status
function checkAdminAuth() {
    const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    const adminToken = localStorage.getItem('adminToken');
    
    if (!isLoggedIn || !adminToken) {
        window.location.href = 'admin_Login_page.html';
        return false;
    }
    return true;
}

// Add auth check to admin dashboard
if (window.location.pathname.includes('admin_dashboard')) {
    if (!checkAdminAuth()) {
        window.location.href = 'admin_Login_page.html';
    }
}