// User Authentication and Profile Management
const auth = {
    API_URL: '/api',  // Update this with your actual API URL

    // Initialize user session
    async initSession() {
        try {
            const response = await fetch(`${this.API_URL}/users/profile`, {
                credentials: 'include'  // This is important for cookies
            });
            
            if (response.ok) {
                const user = await response.json();
                this.updateUserProfile(user);
            } else {
                const currentPage = window.location.pathname;
                if (!currentPage.includes('login.html') && !currentPage.includes('signup.html')) {
                    window.location.href = 'login.html';
                }
            }
        } catch (error) {
            console.error('Session init error:', error);
            window.location.href = 'login.html';
        }
    },

    // Update user profile display
    updateUserProfile(user) {
        const userInfoContainer = document.querySelector('.user-account-info');
        if (userInfoContainer) {
            userInfoContainer.innerHTML = `
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
        }
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
            
            if (response.ok) {
                return { success: true, user: data.user };
            }
            return { success: false, message: data.message };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'Login failed' };
        }
    },

    // Handle signup
    async signup(userData) {
        try {
            const response = await fetch(`${this.API_URL}/users/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData),
                credentials: 'include'
            });

            const data = await response.json();
            
            if (response.ok) {
                return { success: true, user: data.user };
            }
            return { success: false, message: data.message };
        } catch (error) {
            console.error('Signup error:', error);
            return { success: false, message: 'Signup failed' };
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
            window.location.href = 'login.html';
        }
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
            
            this.updateUserProfile(user);
        }
    }
};
