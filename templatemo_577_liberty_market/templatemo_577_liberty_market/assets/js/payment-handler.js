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

async function initiateUPIPayment(app) {
    try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');
        const products = JSON.parse(localStorage.getItem('products') || '[]');
        const product = products.find(p => p.id == productId);

        // Generate unique transaction ID
        const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Create server-side transaction record
        const initResponse = await fetch('/api/purchase/initiate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                productId,
                amount: product.total,
                transactionId,
                upiId: '7417915397@ybl' // Merchant UPI ID
            })
        });

        if (!initResponse.ok) {
            throw new Error('Failed to initiate payment');
        }

        // Store transaction ID
        localStorage.setItem('pendingTransaction', transactionId);

        // Create UPI deep link with merchant UPI ID
        const upiURL = {
            gpay: `upi://pay?pa=7417915397@ybl&pn=INVESTLOOM7X&am=${product.total}&tr=${transactionId}&cu=INR`,
            phonepe: `phonepe://pay?pa=7417915397@ybl&pn=INVESTLOOM7X&am=${product.total}&tr=${transactionId}&cu=INR`,
            paytm: `paytmmp://pay?pa=7417915397@ybl&pn=INVESTLOOM7X&am=${product.total}&tr=${transactionId}&cu=INR`
        };

        // Open UPI app
        window.location.href = upiURL[app];

        // Show verification modal
        showVerificationModal(transactionId);

    } catch (error) {
        console.error('Payment initiation failed:', error);
        alert('Failed to initiate payment. Please try again.');
    }
}

function showVerificationModal(transactionId) {
    const modalHTML = `
    <div class="modal fade" id="verificationModal">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Payment Verification</h5>
                </div>
                <div class="modal-body text-center">
                    <div class="verification-status">
                        <div class="spinner-border text-primary"></div>
                        <p class="mt-3">Verifying Payment...</p>
                        <small class="text-muted">Transaction ID: ${transactionId}</small>
                    </div>
                </div>
            </div>
        </div>
    </div>`;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = new bootstrap.Modal(document.getElementById('verificationModal'));
    modal.show();

    // Start polling for payment status
    pollPaymentStatus(transactionId);
}

async function pollPaymentStatus(transactionId) {
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds timeout
    
    const pollInterval = setInterval(async () => {
        try {
            attempts++;
            
            const response = await fetch(`/api/purchase/status/${transactionId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const data = await response.json();

            if (data && data.status === 'completed') {
                clearInterval(pollInterval);

                // Hide and remove verification modal if present
                const modalEl = document.getElementById('verificationModal');
                if (modalEl) {
                    const bsModal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
                    bsModal.hide();
                    modalEl.remove();
                }

                localStorage.removeItem('pendingTransaction');
                alert('Payment successful. Thank you!');
                // Optionally refresh or update user state here
                return;
            }

            if (data && data.status === 'failed') {
                clearInterval(pollInterval);

                const modalEl = document.getElementById('verificationModal');
                if (modalEl) {
                    const bsModal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
                    bsModal.hide();
                    modalEl.remove();
                }

                localStorage.removeItem('pendingTransaction');
                alert('Payment failed. Please try again or contact support.');
                return;
            }

            if (attempts >= maxAttempts) {
                clearInterval(pollInterval);

                const modalEl = document.getElementById('verificationModal');
                if (modalEl) {
                    const bsModal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
                    bsModal.hide();
                    modalEl.remove();
                }

                localStorage.removeItem('pendingTransaction');
                alert('Payment verification timed out. Please check your transaction status later.');
                return;
            }

            // otherwise continue polling (no explicit action required here)

        } catch (err) {
            clearInterval(pollInterval);

            const modalEl = document.getElementById('verificationModal');
            if (modalEl) {
                const bsModal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
                bsModal.hide();
                modalEl.remove();
            }

            localStorage.removeItem('pendingTransaction');
            console.error('Error while polling payment status:', err);
            alert('An error occurred while verifying payment. Please try again later.');
        }
    }, 2000);
}

function selectPaymentMethod(method) {
    if (method === 'upi') {
        showNoticeModal();
    }
}

function showNoticeModal() {
    const noticeHTML = `
    <div class="modal fade" id="noticeModal">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header bg-warning">
                    <h5 class="modal-title text-dark">⚠️ Important Notice</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="notice-content">
                        <h6 class="text-danger mb-3">Please Read Carefully</h6>
                        
                        <div class="notice-points">
                            <p>1. This is a competitive investment product where you'll be matched with another user.</p>
                            
                            <p>2. Only TWO users can participate in this battle for returns.</p>
                            
                            <p>3. The winning conditions are:</p>
                            <ul>
                                <li>Higher deposit amount than opponent</li>
                                <li>Longer survival in the investment period</li>
                                <li>Active daily check-ins</li>
                            </ul>
                            
                            <p>4. The winning user will receive:</p>
                            <ul>
                                <li>Original investment amount</li>
                                <li>Additional 25% bonus returns</li>
                                <li>Opponent's forfeited amount (if they quit early)</li>
                            </ul>

                            <p class="text-danger">5. WARNING: Early withdrawal will result in:</p>
                            <ul class="text-danger">
                                <li>Immediate forfeit of invested amount</li>
                                <li>Transfer of benefits to opponent</li>
                                <li>Account penalty for 7 days</li>
                            </ul>
                            
                            <div class="mt-4">
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="agreeCheck">
                                    <label class="form-check-label" for="agreeCheck">
                                        I understand and agree to these competitive terms
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button onclick="handleAgreement()" id="continueBtn" class="btn btn-primary" disabled>
                        Agree & Continue
                    </button>
                </div>
            </div>
        </div>
    </div>`;

    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', noticeHTML);
    
    // Show modal
    const noticeModal = new bootstrap.Modal(document.getElementById('noticeModal'));
    noticeModal.show();

    // Handle checkbox
    document.getElementById('agreeCheck').addEventListener('change', function(e) {
        document.getElementById('continueBtn').disabled = !e.target.checked;
    });
}

function handleAgreement() {
    // Close notice modal
    bootstrap.Modal.getInstance(document.getElementById('noticeModal')).hide();
    
    // Show UPI apps selection
    showUPIAppsModal();
}

function showUPIAppsModal() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const product = products.find(p => p.id == productId);

    const upiModalHTML = `
    <div class="modal fade" id="upiModal">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Select UPI App</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="upi-apps">
                        <div class="amount-display mb-4">
                            <h6>Amount to Pay</h6>
                            <h3 class="text-primary">₹${product.total}</h3>
                        </div>
                        <div class="upi-app-grid">
                            <button onclick="initiateUPIPayment('gpay')" class="app-btn">
                                <img src="assets/images/gpay.png" alt="Google Pay">
                                <span>Google Pay</span>
                            </button>
                            <button onclick="initiateUPIPayment('phonepe')" class="app-btn">
                                <img src="assets/images/phonepe.png" alt="PhonePe">
                                <span>PhonePe</span>
                            </button>
                            <button onclick="initiateUPIPayment('paytm')" class="app-btn">
                                <img src="assets/images/paytm.png" alt="Paytm">
                                <span>Paytm</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>`;

    document.body.insertAdjacentHTML('beforeend', upiModalHTML);
    new bootstrap.Modal(document.getElementById('upiModal')).show();
}

