const ADMIN_CREDENTIALS = {
    phone: '7417915397',
    password: 'Kartik904541'
};

function checkAdminAuth() {
    const isAdminAuthenticated = localStorage.getItem('adminAuthenticated');
    if (!isAdminAuthenticated) {
        window.location.href = 'Host-WEB/admin_Login_page.html';
        return false;
    }
    return true;
}

function adminLogin(phone, password) {
    if (phone === ADMIN_CREDENTIALS.phone && password === ADMIN_CREDENTIALS.password) {
        localStorage.setItem('adminAuthenticated', 'true');
        window.location.href = 'admin_dashboard.html';
        return true;
    }
    return false;
}