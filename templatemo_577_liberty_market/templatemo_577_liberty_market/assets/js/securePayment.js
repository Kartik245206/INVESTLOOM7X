// Secure Payment Handler
const securePayment = {
    // Track payment state
    paymentState: {
        ongoing: false,
        transactionId: null
    },

    // Initialize payment session
    async initPayment(amount, planId) {
        if (!authGuard.isAuthenticated()) {
            window.location.href = 'login.html';
            return { success: false, message: 'Authentication required' };
        }

        if (this.paymentState.ongoing) {
            return { success: false, message: 'Payment already in progress' };
        }

        try {
            // Generate transaction ID
            this.paymentState.transactionId = 'TXN_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            this.paymentState.ongoing = true;

            // Verify user session before proceeding
            const sessionValid = await this.verifySession();
            if (!sessionValid) {
                this.resetPaymentState();
                window.location.href = 'login.html';
                return { success: false, message: 'Session expired' };
            }

            // Initialize payment with backend
            const response = await fetch('/api/payment/initialize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                },
                body: JSON.stringify({
                    amount,
                    planId,
                    transactionId: this.paymentState.transactionId
                })
            });

            const data = await response.json();
            if (!data.success) {
                this.resetPaymentState();
                return { success: false, message: data.message };
            }

            return {
                success: true,
                orderId: data.orderId,
                transactionId: this.paymentState.transactionId
            };
        } catch (error) {
            console.error('Payment initialization error:', error);
            this.resetPaymentState();
            return { success: false, message: 'Payment initialization failed' };
        }
    },

    // Verify payment status
    async verifyPayment(orderId, paymentId, signature) {
        if (!this.paymentState.ongoing || !this.paymentState.transactionId) {
            return { success: false, message: 'Invalid payment state' };
        }

        try {
            const response = await fetch('/api/payment/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                },
                body: JSON.stringify({
                    orderId,
                    paymentId,
                    signature,
                    transactionId: this.paymentState.transactionId
                })
            });

            const data = await response.json();
            if (data.success) {
                // Only update UI after backend confirmation
                await this.updateUserBalance();
            }

            this.resetPaymentState();
            return data;
        } catch (error) {
            console.error('Payment verification error:', error);
            this.resetPaymentState();
            return { success: false, message: 'Payment verification failed' };
        }
    },

    // Handle payment cancellation
    async handlePaymentCancel() {
        if (this.paymentState.ongoing) {
            try {
                await fetch('/api/payment/cancel', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + localStorage.getItem('token')
                    },
                    body: JSON.stringify({
                        transactionId: this.paymentState.transactionId
                    })
                });
            } catch (error) {
                console.error('Payment cancellation error:', error);
            }
        }
        this.resetPaymentState();
    },

    // Reset payment state
    resetPaymentState() {
        this.paymentState.ongoing = false;
        this.paymentState.transactionId = null;
    },

    // Verify user session
    async verifySession() {
        try {
            const response = await fetch('/api/users/verify-session', {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            });
            return response.ok;
        } catch {
            return false;
        }
    },

    // Update user balance (only after server confirmation)
    async updateUserBalance() {
        try {
            const response = await fetch('/api/users/profile', {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            });
            
            if (response.ok) {
                const userData = await response.json();
                const balanceElement = document.getElementById('userBalanceAmount');
                if (balanceElement) {
                    balanceElement.textContent = '₹' + userData.balance;
                }
            }
        } catch (error) {
            console.error('Balance update error:', error);
        }
    }
};

