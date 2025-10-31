// User Authentication and Profile Management
const auth = {
    // Replace localhost URL with your Render URL
    API_URL: window.location.hostname === 'localhost' ? 'http://localhost:4000/api' : 'https://investloom7x.onrender.com/api',
    
    // Initialize user session
    async initSession() {
        try {
            const token = localStorage.getItem('token');
            const currentPage = window.location.pathname.split('/').pop();
            const publicPages = ['index.html', 'author.html', 'login.html', 'signup.html', ''];
            
            if (!token) {
                if (!publicPages.includes(currentPage)) {
                    sessionStorage.setItem('redirectAfterLogin', window.location.href);
                    window.location.href = 'login.html';
                    return;
                }
                this.updateUIForLoggedOutUser();
                return false;
            }
            
            // Verify token and get user profile
            const response = await fetch(`${this.API_URL}/users/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                this.logout();
                return false;
            }
            
            const data = await response.json();
            this.updateUserProfile(data.user);
            return true;
        } catch (error) {
            console.error('Session init error:', error);
            this.logout();
            return false;
        }
    },
    
    // Update UI for logged out users
    updateUIForLoggedOutUser() {
        // Clear user data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Update navigation links
        const navLinks = document.querySelector('.nav-links');
        if (navLinks) {
            navLinks.innerHTML = `
            <li><a href="index.html" class="nav-link active">
                <i class="fas fa-home"></i>
                <span>Home</span>
            </a></li>
            <li><a href="Host-WEB/admin_Login_page.html" class="nav-link">
                <i class="fas fa-user-shield"></i>
                <span>Admin</span>
            </a></li>
            <li><a href="auth/login.html" class="nav-link">
                <i class="fas fa-sign-in-alt"></i>
                <span>Login</span>
            </a></li>
            <li><a href="auth/signup.html" class="nav-link">
                <i class="fas fa-user-plus"></i>
                <span>Sign Up</span>
            </a></li>
            `;
        }
        
        // Hide user-specific elements
        document.querySelectorAll('.user-only').forEach(el => el.style.display = 'none');
        // Show guest elements
        document.querySelectorAll('.guest-only').forEach(el => el.style.display = 'block');
        
        // Update user info containers
        const userInfoContainers = document.querySelectorAll('.user-account-info');
        userInfoContainers.forEach(container => {
            container.innerHTML = `
                <a href="index.html" class="logo">
                    <img src="assets/images/logo.png" alt="INVESTLOOM7X">
                </a>
            `;
        });
    },
    
    // Update user profile display
    updateUserProfile(user) {
        if (!user) return;
        
        // Store current user data
        localStorage.setItem('user', JSON.stringify(user));
        
        // Show user-specific elements
        document.querySelectorAll('.user-only').forEach(el => el.style.display = 'block');
        // Hide guest elements
        document.querySelectorAll('.guest-only').forEach(el => el.style.display = 'none');
        
        // Update user information in UI
        document.querySelectorAll('.user-account-info').forEach(container => {
            container.innerHTML = `
                <div class="user-profile-pic">
                    <img src="${user.profilePic || 'assets/images/author.jpg'}" alt="${user.username}">
                </div>
                <div class="user-info">
                    <div class="username">${user.username}</div>
                    <div class="user-balance-info">
                        <div class="balance-amount">₹${user.balance || 0}</div>
                        <div class="balance-label">Available Balance</div>
                    </div>
                </div>
            `;
        });
    },
    
    // Handle login
    async login(email, password) {
        try {
            console.log('Attempting login to:', `${this.API_URL}/auth/login`);
            const response = await fetch(`${this.API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ email, password }),
                mode: 'cors',
                credentials: 'include'
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Invalid credentials');
            }
            
            // Store authentication data
            this.saveAuthData(data.token, data.user);
            
            // Handle redirect after login
            const redirectUrl = sessionStorage.getItem('redirectAfterLogin');
            if (redirectUrl) {
                sessionStorage.removeItem('redirectAfterLogin');
                window.location.href = redirectUrl;
            } else {
                window.location.href = 'index.html';
            }
            
            return { success: true, user: data.user };
        } catch (error) {
            console.error('Login error:', error);
            return { 
                success: false, 
                message: error.message || 'Login failed. Please check your credentials.'
            };
        }
    },
    
    // Save authentication data consistently
    saveAuthData(token, user) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        // Add a timestamp for session expiry check
        localStorage.setItem('loginTimestamp', Date.now().toString());
    },

    // Update user profile display
    updateUserProfile(user) {
        const userInfoContainers = document.querySelectorAll('.user-account-info');
        userInfoContainers.forEach(container => {
            container.innerHTML = `
                <div class="user-profile-pic">
                    <img src="${user.profilePic || 'assets/images/author.jpg'}" alt="${user.username}">
                </div>
                <div class="user-info">
                    <div class="username">${user.username}</div>
                    <div class="user-balance-info">
                        <div class="balance-amount">₹${user.balance || 0}</div>
                        <div class="balance-label">Available Balance</div>
                    </div>
                </div>
            `;
        });
    },

    // Handle login
    async login(email, password) {
        try {
            const response = await fetch(`${this.API_URL}/users/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password }),
                credentials: 'include'
            });

            const data = await response.json();
            
            if (response.ok && data.token) {
                // Store token and user data
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                // Check if there's a redirect URL stored
                const redirectUrl = sessionStorage.getItem('redirectAfterLogin');
                if (redirectUrl) {
                    sessionStorage.removeItem('redirectAfterLogin');
                    window.location.href = redirectUrl;
                } else {
                    // Redirect to homepage
                    window.location.href = 'index.html';
                }
                return { success: true, user: data.user };
            }
            return { success: false, message: data.message };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'Login failed' };
        }
    },  // Added comma here

    // Handle signup
    async signup(userData) {
        try {
            const response = await fetch(`${this.API_URL}/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData),
                credentials: 'include'
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to create account');
            }

            // Store authentication data if token is provided
            if (data.token) {
                this.saveAuthData(data.token, data.user);
                // Redirect to home page after successful signup
                window.location.href = 'index.html';
            }

            return { 
                success: true, 
                message: 'Account created successfully!',
                user: data.user 
            };
        } catch (error) {
            console.error('Signup error:', error);
            return { 
                success: false, 
                message: error.message || 'Failed to create account. Please try again.'
            };
        }
    },

    // Handle logout
    async logout() {
        try {
            await fetch(`${this.API_URL}/users/logout`, {
                method: 'POST',
                credentials: 'include'
            });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear local storage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Update UI for logged out state
            this.updateUIForLoggedOutUser();
            // Redirect to home page
            window.location.href = 'index.html';
        }
    },
    
    // Check if user is logged in
    isLoggedIn() {
        return !!localStorage.getItem('token');
    },
    
    // Redirect to login if not authenticated
    requireAuth() {
        if (!this.isLoggedIn()) {
            // Store the current URL to redirect back after login
            sessionStorage.setItem('redirectAfterLogin', window.location.href);
            window.location.href = 'login.html';
            return false;
        }
        return true;
    },

    // Update user balance
    async updateBalance(amount, type, description) {
        try {
            const response = await fetch(`${this.API_URL}/users/balance`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ amount, type, description }),
                credentials: 'include'
            });

            if (response.ok) {
                const user = await response.json();
                this.updateUserProfile(user);
                return { success: true };
            }
            
            const data = await response.json();
            return { success: false, message: data.message };
        } catch (error) {
            console.error('Balance update error:', error);
            return { success: false, message: 'Failed to update balance' };
        }
    }
};

// Remove or modify the authentication check
function checkAuth() {
    // Allow access to profile without login
    if (window.location.pathname.includes('profile.html')) {
        return true;
    }
    
    // Only check auth for protected pages
    const protectedPages = ['details.html', 'admin_dashboard.html'];
    const currentPage = window.location.pathname.split('/').pop();
    
    if (protectedPages.includes(currentPage)) {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = 'login.html';
            return false;
        }
    }
    return true;
}

// Add this at the start of each protected page
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
});

// Initialize auth on page load
document.addEventListener('DOMContentLoaded', () => {
    auth.initSession();
    
    // Set up login form handler if we're on the login page
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            const email = document.getElementById('emailInput').value;
            const password = document.getElementById('passwordInput').value;
            
            const result = await auth.login(email, password);
            if (!result.success) {
                alert(result.message);
            }
        });
    }
});
