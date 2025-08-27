const ADMIN_CREDENTIALS = {
    username: 'bhadana',
    password: 'Kartik904541'
};

async function handleAdminLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('adminPhone').value; // यह element का name phone है लेकिन value username है
    const password = document.getElementById('adminPassword').value;

    console.log('Sending login data:', { username, password }); // Debug के लिए

    try {
        const response = await fetch('/api/auth/admin/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                username: username, // username field भेजें
                password: password 
            })
        });

        const data = await response.json();
        console.log('Server response:', data); // Debug के लिए
        
        if (!response.ok) {
            throw new Error(data.error || 'Invalid credentials');
        }

        if (data.success && data.token && data.adminSecret) {
            localStorage.setItem('adminLoggedIn', 'true');
            localStorage.setItem('adminToken', data.token);
            localStorage.setItem('ADMIN_SECRET', data.adminSecret);
            localStorage.setItem('adminUsername', username);

            window.location.href = 'admin_dashboard.html';
        } else {
            throw new Error('Invalid response from server');
        }
    } catch (error) {
        console.error('Login error:', error);
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