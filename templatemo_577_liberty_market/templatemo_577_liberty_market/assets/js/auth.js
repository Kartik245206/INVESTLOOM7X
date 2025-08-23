// User Authentication and Profile Management
const auth = {
    API_URL: '/api',  // Update this with your actual API URL

    // Initialize user session
    async initSession() {
        try {
            // Check if we have a token in localStorage first
            const token = localStorage.getItem('token');
            const currentPage = window.location.pathname.split('/').pop();
            
            // Pages that don't require authentication
            const publicPages = ['index.html', 'author.html', 'login.html', 'signup.html', ''];
            
            if (!token) {
                // If on a protected page, redirect to login
                if (!publicPages.includes(currentPage)) {
                    sessionStorage.setItem('redirectAfterLogin', window.location.href);
                    window.location.href = 'login.html';
                    return; // Stop execution to prevent UI updates before redirect
                }
                
                // No token, user is not logged in
                this.updateUIForLoggedOutUser();
                return false;
            }
            
            // Try to get user profile with the token
            const response = await fetch(`${this.API_URL}/users/profile`, {
                credentials: 'include'  // This is important for cookies
            });
            
            if (response.ok) {
                const user = await response.json();
                this.updateUserProfile(user);
                return true;
            } else {
                // Token is invalid or expired
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                this.updateUIForLoggedOutUser();
                return false;
            }
        } catch (error) {
            console.error('Session init error:', error);
            this.updateUIForLoggedOutUser();
            return false;
        }
    },
    
    // Update UI for logged out users
    updateUIForLoggedOutUser() {
        const userInfoContainers = document.querySelectorAll('.user-account-info');
        userInfoContainers.forEach(container => {
            container.innerHTML = `
                <div class="user-account-info" href="login.html">
                    <h2>Login</h2>
                </div>
            `;
        });
        
        // Update navigation links
        const navLinks = document.querySelector('.nav-links');
        if (navLinks) {
            navLinks.innerHTML = `
                <a href="index.html" class="active">Home</a>
                <a href="author.html">Explore</a>
                <a href="login.html">Login</a>
                <a href="signup.html">Sign Up</a>
            `;
        }
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
    },

    // Handle signup
    signup(userData) {
        try {
            // Get existing users
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            
            // Check if email already exists
            if (users.some(user => user.email.toLowerCase() === userData.email.toLowerCase())) {
                return { success: false, message: 'This email is already registered' };
            }

            // Check if username already exists
            if (users.some(user => user.username.toLowerCase() === userData.username.toLowerCase())) {
                return { success: false, message: 'This username is already taken' };
            }

            // Check if UPI ID already exists
            if (users.some(user => user.upiId === userData.upiId)) {
                return { success: false, message: 'This UPI ID is already registered' };
            }

            // Create new user with default values
            const newUser = {
                ...userData,
                id: Date.now(),
                balance: 0,
                transactions: [],
                emiHistory: [],
                profilePic: 'assets/images/author.jpg',
                createdAt: new Date().toISOString()
            };

            // Save to users array
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));

            // Set current user session
            localStorage.setItem('currentUser', JSON.stringify(newUser));
            localStorage.setItem('token', 'demo_token_' + Date.now()); // In real app, use JWT

            return { success: true, user: newUser };
        } catch (error) {
            console.error('Signup error:', error);
            return { 
                success: false, 
                message: 'Failed to create account. Please try again.'
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
