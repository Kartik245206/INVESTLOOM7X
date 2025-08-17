// Payment and Transaction Handler
const paymentHandler = {
    async processPayment(productId, amount) {
        try {
            // Verify admin's UPI details
            const adminUpi = await this.getAdminUpiDetails();
            if (!adminUpi) {
                throw new Error('Admin UPI details not found');
            }

            // Create transaction record
            const transaction = {
                productId,
                amount,
                userId: localStorage.getItem('userId'),
                status: 'pending',
                timestamp: new Date().toISOString()
            };

            // Save initial transaction
            const savedTx = await this.saveTransaction(transaction);

            // Show UPI payment interface
            await this.showUpiInterface(adminUpi, amount, savedTx.id);

            return savedTx;
        } catch (error) {
            console.error('Payment processing error:', error);
            throw error;
        }
    },

    async verifyPayment(transactionId) {
        try {
            // Poll for payment status
            let attempts = 0;
            const maxAttempts = 30;
            
            const checkStatus = async () => {
                if (attempts >= maxAttempts) {
                    throw new Error('Payment verification timeout');
                }

                const status = await this.getTransactionStatus(transactionId);
                if (status === 'completed') {
                    return true;
                } else if (status === 'failed') {
                    throw new Error('Payment failed');
                }

                attempts++;
                await new Promise(resolve => setTimeout(resolve, 2000));
                return checkStatus();
            };

            return await checkStatus();
        } catch (error) {
            console.error('Payment verification error:', error);
            throw error;
        }
    },

    async updateUserBalance(userId, productDetails) {
        try {
            const response = await fetch('/api/user/balance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId,
                    dailyAmount: productDetails.price,
                    totalAmount: productDetails.totalAmount,
                    duration: productDetails.duration
                })
            });

            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error);
            }

            // Update UI
            this.updateBalanceDisplay(result.newBalance);
            return result;
        } catch (error) {
            console.error('Balance update error:', error);
            throw error;
        }
    },

    // UI Helper Methods
    showUpiInterface(upiId, amount, txId) {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'payment-modal';
            modal.innerHTML = `
                <div class="payment-content">
                    <h3>Pay ₹${amount}</h3>
                    <div class="qr-code">
                        <img src="/generate-qr?upi=${upiId}&amount=${amount}&tx=${txId}" alt="Payment QR">
                    </div>
                    <div class="upi-id">UPI: ${upiId}</div>
                    <div class="payment-options">
                        <button onclick="window.open('upi://pay?pa=${upiId}&am=${amount}&tn=TX${txId}')">
                            Pay with UPI App
                        </button>
                    </div>
                    <div class="status-message">
                        Waiting for payment confirmation...
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            // Handle payment completion
            this.verifyPayment(txId)
                .then(() => {
                    modal.remove();
                    resolve(true);
                })
                .catch(error => {
                    modal.remove();
                    throw error;
                });
        });
    },

    updateBalanceDisplay(newBalance) {
        const balanceElement = document.querySelector('.balance-amount');
        if (balanceElement) {
            balanceElement.textContent = `₹${newBalance}`;
        }
    }
};
