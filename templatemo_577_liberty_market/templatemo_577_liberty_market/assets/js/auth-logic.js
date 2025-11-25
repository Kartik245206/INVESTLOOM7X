/**
 * Auth Logic
 * Extracted from auth/login.html to enable strict CSP
 */

function handleGoogleLogin() {
    const apiBase = window.API_BASE || 'https://investloom7x.onrender.com';
    window.location.href = `${apiBase}/api/auth/google`;
}

function showAlert(message, type) {
    const alertDiv = document.getElementById('alertMessage');
    if (alertDiv) {
        alertDiv.className = `alert alert-${type}`;
        alertDiv.textContent = message;
        alertDiv.style.display = 'block';
    } else {
        alert(message);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    // Handle Google Login Button
    const googleBtn = document.querySelector('.google-btn');
    if (googleBtn) {
        googleBtn.addEventListener('click', handleGoogleLogin);
    }

    // Handle regular login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const emailInput = document.getElementById('email');
            const passwordInput = document.getElementById('password');

            if (!emailInput || !passwordInput) return;

            const email = emailInput.value;
            const password = passwordInput.value;

            try {
                const apiBase = window.API_BASE || 'https://investloom7x.onrender.com';
                const response = await fetch(`${apiBase}/api/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('currentUser', JSON.stringify(data.user));

                    const redirectTo = sessionStorage.getItem('redirectAfterLogin');
                    if (redirectTo) {
                        sessionStorage.removeItem('redirectAfterLogin');
                        window.location.href = redirectTo;
                    } else {
                        window.location.href = '../profile.html';
                    }
                } else {
                    showAlert(data.error || 'Login failed', 'danger');
                }
            } catch (error) {
                console.error('Login error:', error);
                showAlert('An error occurred. Please try again.', 'danger');
            }
        });
    }
});
