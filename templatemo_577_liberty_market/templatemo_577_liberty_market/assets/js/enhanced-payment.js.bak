// Enhanced Payment Handler with Multiple Payment Methods
const enhancedPayment = {
    // Payment Methods Configuration
    paymentMethods: {
        UPI: {
            apps: [
                { id: 'gpay', name: 'Google Pay', icon: 'assets/images/gpay.svg' },
                { id: 'phonepe', name: 'PhonePe', icon: 'assets/images/phonepe.svg' },
                { id: 'paytm', name: 'Paytm', icon: 'assets/images/paytm.svg' }
            ],
            validateId: (upiId) => {
                const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z]+$/;
                return upiRegex.test(upiId);
            }
        },
        CARD: {
            types: ['credit', 'debit'],
            networks: ['visa', 'mastercard', 'rupay'],
            validateCard: (cardNumber) => {
                // Luhn algorithm for card validation
                let sum = 0;
                let isEven = false;
                for (let i = cardNumber.length - 1; i >= 0; i--) {
                    let digit = parseInt(cardNumber[i]);
                    if (isEven) {
                        digit *= 2;
                        if (digit > 9) {
                            digit -= 9;
                        }
                    }
                    sum += digit;
                    isEven = !isEven;
                }
                return sum % 10 === 0;
            }
        },
        NET_BANKING: {
            banks: [
                { id: 'sbi', name: 'State Bank of India' },
                { id: 'hdfc', name: 'HDFC Bank' },
                { id: 'icici', name: 'ICICI Bank' },
                { id: 'axis', name: 'Axis Bank' },
                { id: 'kotak', name: 'Kotak Mahindra Bank' }
            ]
        }
    },

    // Payment State Management
    paymentState: {
        ongoing: false,
        transactionId: null,
        method: null,
        amount: 0,
        timestamp: null,
        retryCount: 0,
        maxRetries: 3
    },

    // Security Measures
    security: {
        generateNonce: () => {
            return Array.from(crypto.getRandomValues(new Uint8Array(16)))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');
        },
        generateOrderId: () => {
            return 'ORD_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        },
        hashData: async (data) => {
            const msgBuffer = new TextEncoder().encode(JSON.stringify(data));
            const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
            return Array.from(new Uint8Array(hashBuffer))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');
        }
    },

    // Initialize Payment
    async initializePayment(amount, method, options = {}) {
        if (!this.validatePaymentRequest(amount, method)) {
            throw new Error('Invalid payment request');
        }

        if (this.paymentState.ongoing) {
            throw new Error('Another payment is in progress');
        }

        try {
            // Set initial payment state
            const transactionId = await this.createTransaction(amount, method);
            this.setPaymentState(transactionId, method, amount);

            // Generate security parameters
            const nonce = this.security.generateNonce();
            const orderId = this.security.generateOrderId();
            
            // Create payment request data
            const paymentData = {
                transactionId,
                orderId,
                amount,
                method,
                nonce,
                timestamp: Date.now(),
                ...options
            };

            // Hash payment data for integrity
            const dataHash = await this.security.hashData(paymentData);

            // Initialize payment with backend
            const response = await this.sendPaymentRequest('/api/payment/initialize', {
                ...paymentData,
                hash: dataHash
            });

            if (!response.success) {
                throw new Error(response.message || 'Payment initialization failed');
            }

            return {
                success: true,
                orderId,
                paymentId: response.paymentId,
                method: response.method,
                redirectUrl: response.redirectUrl
            };

        } catch (error) {
            this.resetPaymentState();
            throw error;
        }
    },

    // Process Payment
    async processPayment(paymentDetails) {
        if (!this.paymentState.ongoing) {
            throw new Error('No active payment session');
        }

        try {
            // Validate payment details based on method
            if (!this.validatePaymentDetails(paymentDetails)) {
                throw new Error('Invalid payment details');
            }

            // Add security measures
            const securePaymentData = {
                ...paymentDetails,
                nonce: this.security.generateNonce(),
                timestamp: Date.now(),
                transactionId: this.paymentState.transactionId
            };

            // Process payment with backend
            const response = await this.sendPaymentRequest('/api/payment/process', securePaymentData);

            if (response.success) {
                await this.handleSuccessfulPayment(response);
                return {
                    success: true,
                    transactionId: this.paymentState.transactionId,
                    message: 'Payment successful'
                };
            } else {
                throw new Error(response.message || 'Payment processing failed');
            }

        } catch (error) {
            if (this.canRetryPayment()) {
                return await this.retryPayment(paymentDetails);
            }
            throw error;
        }
    },

    // Verify Payment
    async verifyPayment(orderId, paymentId) {
        if (!this.paymentState.ongoing) {
            throw new Error('No active payment session');
        }

        try {
            const verificationData = {
                orderId,
                paymentId,
                transactionId: this.paymentState.transactionId,
                nonce: this.security.generateNonce(),
                timestamp: Date.now()
            };

            const response = await this.sendPaymentRequest('/api/payment/verify', verificationData);

            if (response.success) {
                await this.updateUserWallet(response.amount);
                this.resetPaymentState();
                return {
                    success: true,
                    message: 'Payment verified successfully'
                };
            } else {
                throw new Error(response.message || 'Payment verification failed');
            }

        } catch (error) {
            this.handlePaymentError(error);
            throw error;
        }
    },

    // Helper Methods
    validatePaymentRequest(amount, method) {
        return (
            amount > 0 &&
            typeof amount === 'number' &&
            Object.keys(this.paymentMethods).includes(method)
        );
    },

    validatePaymentDetails(details) {
        switch (this.paymentState.method) {
            case 'UPI':
                return this.paymentMethods.UPI.validateId(details.upiId);
            case 'CARD':
                return this.paymentMethods.CARD.validateCard(details.cardNumber);
            case 'NET_BANKING':
                return this.paymentMethods.NET_BANKING.banks
                    .some(bank => bank.id === details.bankId);
            default:
                return false;
        }
    },

    async sendPaymentRequest(endpoint, data) {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        return await response.json();
    },

    setPaymentState(transactionId, method, amount) {
        this.paymentState = {
            ongoing: true,
            transactionId,
            method,
            amount,
            timestamp: Date.now(),
            retryCount: 0
        };
    },

    resetPaymentState() {
        this.paymentState = {
            ongoing: false,
            transactionId: null,
            method: null,
            amount: 0,
            timestamp: null,
            retryCount: 0
        };
    },

    canRetryPayment() {
        return this.paymentState.retryCount < this.paymentState.maxRetries;
    },

    async retryPayment(paymentDetails) {
        this.paymentState.retryCount++;
        return await this.processPayment(paymentDetails);
    },

    async createTransaction(amount, method) {
        // Create transaction record in local storage
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        const transactionId = 'TXN_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        transactions.push({
            id: transactionId,
            amount,
            method,
            status: 'initiated',
            timestamp: new Date().toISOString()
        });

        localStorage.setItem('transactions', JSON.stringify(transactions));
        return transactionId;
    },

    async handleSuccessfulPayment(response) {
        // Update transaction status
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        const transaction = transactions.find(t => t.id === this.paymentState.transactionId);
        
        if (transaction) {
            transaction.status = 'completed';
            transaction.completedAt = new Date().toISOString();
            localStorage.setItem('transactions', JSON.stringify(transactions));
        }

        // Update user balance
        await this.updateUserWallet(this.paymentState.amount);
    },

    async updateUserWallet(amount) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser) {
            currentUser.balance = (parseFloat(currentUser.balance) || 0) + parseFloat(amount);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));

            // Update UI if balance element exists
            const balanceElement = document.getElementById('userBalanceAmount');
            if (balanceElement) {
                balanceElement.textContent = '₹' + currentUser.balance.toFixed(2);
            }
        }
    },

    handlePaymentError(error) {
        console.error('Payment error:', error);
        this.resetPaymentState();
    }
};

// Payment UI Handler
const paymentUI = {
    showPaymentMethods() {
        const modal = document.createElement('div');
        modal.className = 'payment-modal';
        modal.innerHTML = `
            <div class="payment-content">
                <h3>Select Payment Method</h3>
                <div class="payment-methods">
                    <div class="payment-section">
                        <h4>UPI</h4>
                        <div class="upi-apps">
                            ${enhancedPayment.paymentMethods.UPI.apps.map(app => `
                                <div class="payment-option" data-method="UPI" data-app="${app.id}">
                                    <img src="${app.icon}" alt="${app.name}">
                                    <span>${app.name}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div class="payment-section">
                        <h4>Cards</h4>
                        <div class="card-options">
                            ${enhancedPayment.paymentMethods.CARD.networks.map(network => `
                                <div class="payment-option" data-method="CARD" data-network="${network}">
                                    <img src="assets/images/${network}.svg" alt="${network}">
                                    <span>${network.charAt(0).toUpperCase() + network.slice(1)}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div class="payment-section">
                        <h4>Net Banking</h4>
                        <select class="bank-select">
                            <option value="">Select Bank</option>
                            ${enhancedPayment.paymentMethods.NET_BANKING.banks.map(bank => `
                                <option value="${bank.id}">${bank.name}</option>
                            `).join('')}
                        </select>
                    </div>
                </div>
                <button class="close-modal">×</button>
            </div>
        `;

        document.body.appendChild(modal);
        this.attachPaymentEventListeners(modal);
    },

    attachPaymentEventListeners(modal) {
        modal.querySelector('.close-modal').onclick = () => {
            modal.remove();
            enhancedPayment.handlePaymentCancel();
        };

        modal.querySelectorAll('.payment-option').forEach(option => {
            option.onclick = async () => {
                const method = option.dataset.method;
                const app = option.dataset.app;
                const network = option.dataset.network;

                try {
                    switch(method) {
                        case 'UPI':
                            await this.handleUPIPayment(app);
                            break;
                        case 'CARD':
                            await this.handleCardPayment(network);
                            break;
                    }
                } catch (error) {
                    this.showError(error.message);
                }
            };
        });

        modal.querySelector('.bank-select').onchange = async (e) => {
            if (e.target.value) {
                await this.handleNetBankingPayment(e.target.value);
            }
        };
    },

    async handleUPIPayment(app) {
        const upiForm = document.createElement('div');
        upiForm.innerHTML = `
            <div class="upi-form">
                <input type="text" placeholder="Enter UPI ID" id="upiId">
                <button id="verifyUpi">Pay Now</button>
            </div>
        `;

        document.querySelector('.payment-content').appendChild(upiForm);

        document.getElementById('verifyUpi').onclick = async () => {
            const upiId = document.getElementById('upiId').value;
            if (!enhancedPayment.paymentMethods.UPI.validateId(upiId)) {
                this.showError('Invalid UPI ID');
                return;
            }

            try {
                await enhancedPayment.processPayment({ method: 'UPI', upiId, app });
                this.showSuccess('Payment successful!');
            } catch (error) {
                this.showError(error.message);
            }
        };
    },

    showError(message) {
        const alert = document.createElement('div');
        alert.className = 'payment-alert error';
        alert.textContent = message;
        document.body.appendChild(alert);
        setTimeout(() => alert.remove(), 3000);
    },

    showSuccess(message) {
        const alert = document.createElement('div');
        alert.className = 'payment-alert success';
        alert.textContent = message;
        document.body.appendChild(alert);
        setTimeout(() => alert.remove(), 3000);
    }
};

// Add styles for payment UI
const style = document.createElement('style');
style.textContent = `
    .payment-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }

    .payment-content {
        background: #fff;
        padding: 20px;
        border-radius: 10px;
        width: 90%;
        max-width: 500px;
        position: relative;
    }

    .payment-methods {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    .payment-section {
        border: 1px solid #ddd;
        padding: 15px;
        border-radius: 8px;
    }

    .upi-apps, .card-options {
        display: flex;
        gap: 15px;
        flex-wrap: wrap;
    }

    .payment-option {
        display: flex;
        flex-direction: column;
        align-items: center;
        cursor: pointer;
        padding: 10px;
        border: 1px solid #eee;
        border-radius: 8px;
        transition: all 0.3s;
    }

    .payment-option:hover {
        background: #f5f5f5;
        border-color: #7453fc;
    }

    .payment-option img {
        width: 40px;
        height: 40px;
        object-fit: contain;
    }

    .bank-select {
        width: 100%;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 5px;
    }

    .close-modal {
        position: absolute;
        top: 10px;
        right: 10px;
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
    }

    .payment-alert {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 5px;
        color: #fff;
        z-index: 1001;
        animation: slideIn 0.3s ease-out;
    }

    .payment-alert.error {
        background: #ff4444;
    }

    .payment-alert.success {
        background: #00C851;
    }

    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    .upi-form {
        margin-top: 20px;
        display: flex;
        gap: 10px;
    }

    .upi-form input {
        flex: 1;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 5px;
    }

    .upi-form button {
        padding: 10px 20px;
        background: #7453fc;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
    }

    .upi-form button:hover {
        background: #5b42c7;
    }
`;

document.head.appendChild(style);
