// User Authentication and Profile Management
const auth = {
    // Initialize user session
    initSession() {
        const currentUser = this.getCurrentUser();
        if (currentUser) {
            this.updateUserProfile(currentUser);
        } else {
            window.location.href = 'login.html';
        }
    },

    // Get current logged in user
    getCurrentUser() {
        const userData = localStorage.getItem('currentUser');
        return userData ? JSON.parse(userData) : null;
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
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const user = users.find(u => u.email === email && u.password === password);
            
            if (user) {
                localStorage.setItem('currentUser', JSON.stringify(user));
                return { success: true, user };
            }
            return { success: false, message: 'Invalid email or password' };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'Login failed' };
        }
    },

    // Handle signup
    async signup(userData) {
        try {
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            
            // Check if user already exists
            if (users.some(u => u.email === userData.email)) {
                return { success: false, message: 'Email already registered' };
            }

            // Create new user
            const newUser = {
                ...userData,
                id: Date.now(),
                balance: 0,
                createdAt: new Date().toISOString()
            };

            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            localStorage.setItem('currentUser', JSON.stringify(newUser));

            return { success: true, user: newUser };
        } catch (error) {
            console.error('Signup error:', error);
            return { success: false, message: 'Signup failed' };
        }
    },

    // Handle logout
    logout() {
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    },

    // Update user balance
    updateBalance(amount) {
        const user = this.getCurrentUser();
        if (user) {
            user.balance = (parseFloat(user.balance) || 0) + parseFloat(amount);
            localStorage.setItem('currentUser', JSON.stringify(user));
            
            // Update users array
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const updatedUsers = users.map(u => u.id === user.id ? user : u);
            localStorage.setItem('users', JSON.stringify(updatedUsers));
            
            this.updateUserProfile(user);
        }
    }
};
