/**
 * Home Page Logic
 * Extracted from index.html to enable strict CSP
 */

document.addEventListener('DOMContentLoaded', function () {
    // Guard against missing auth module in static preview
    if (typeof auth !== 'undefined' && typeof auth.initSession === 'function') {
        auth.initSession();
    }

    initializeUI();
    handleResponsiveLayout();
    window.addEventListener('resize', handleResponsiveLayout);
    updateUserAccountInfo();
    setActiveNavItem();

    // Initialize event listeners for static elements
    attachGlobalEventListeners();
});

function attachGlobalEventListeners() {
    // Deposit Modal Buttons
    const depositAmountInput = document.getElementById('depositAmount');
    if (depositAmountInput) {
        // Quick amount buttons
        const quickAmountBtns = document.querySelectorAll('.quick-amounts button');
        quickAmountBtns.forEach(btn => {
            btn.addEventListener('click', function () {
                // Extract amount from text (e.g. "₹500" -> 500)
                const amount = parseInt(this.textContent.replace(/[^0-9]/g, ''));
                setAmount(amount);
            });
        });

        // Confirm Deposit Button
        const confirmBtn = document.querySelector('#depositModal .btn-primary');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', confirmDeposit);
        }
    }

    // Navigation Links
    const navLinks = document.querySelectorAll('.bottom-nav a');
    navLinks.forEach(link => {
        // Handle protected navigation
        if (link.getAttribute('onclick') && link.getAttribute('onclick').includes('handleProtectedNavigation')) {
            link.removeAttribute('onclick'); // Remove inline handler
            link.addEventListener('click', function (e) {
                e.preventDefault();
                const href = this.getAttribute('href');
                const target = href !== '#' ? href : 'profile.html'; // Default fallback
                handleProtectedNavigation(target);
            });
        }
    });

    // Four Buttons Section (EMI, Deposit, Withdraw, Balance)
    const iconButtons = document.querySelectorAll('.item.small-item .icon-button a');
    iconButtons.forEach(btn => {
        const onclick = btn.getAttribute('onclick');
        if (onclick) {
            btn.removeAttribute('onclick');
            if (onclick.includes('showEMICalculator')) {
                btn.addEventListener('click', (e) => { e.preventDefault(); showEMICalculator(); });
            } else if (onclick.includes('showDepositModal')) {
                btn.addEventListener('click', (e) => { e.preventDefault(); showDepositModal(); });
            } else if (onclick.includes('handleWithdrawal')) {
                btn.addEventListener('click', (e) => { e.preventDefault(); handleWithdrawal(); });
            } else if (onclick.includes('showBalance')) {
                btn.addEventListener('click', (e) => { e.preventDefault(); showBalance(); });
            }
        }
    });
}

// Initialize UI components
function initializeUI() {
    // Add click event listeners to category items
    document.querySelectorAll('.categories .item').forEach(item => {
        item.addEventListener('click', function () {
            const h4 = this.querySelector('h4');
            if (!h4) return;

            const action = h4.textContent.toLowerCase();

            switch (action) {
                case 'emi':
                    showEMICalculator();
                    break;
                case 'deposit':
                    showDepositModal();
                    break;
                case 'withdraw':
                    handleWithdrawal();
                    break;
                case 'balance':
                    showBalance();
                    break;
            }
        });
    });

    // Add click event listeners to payment options
    document.querySelectorAll('.payment-option').forEach(option => {
        option.addEventListener('click', function () {
            const method = this.getAttribute('data-app');
            selectPayment(method);
        });
    });

    // Initialize side navigation
    document.querySelectorAll('.side-nav-item').forEach(item => {
        item.addEventListener('click', function () {
            // Check if this was the logout button
            // We can't rely on onclick attribute anymore, so we check text or class
            if (this.textContent.trim().toLowerCase().includes('logout') ||
                this.querySelector('.fa-sign-out-alt')) {
                logout();
            }
        });
    });
}

// Logout function
function logout() {
    // Clear user data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('currentUser');

    // Redirect to login page
    window.location.href = 'auth/login.html';
}

// Show EMI calculator
function showEMICalculator() {
    // Implement EMI calculator functionality
    alert('EMI Calculator will be shown here');
}

function handleWithdrawal() {
    // Implement withdrawal functionality
    window.location.href = 'profile.html';
}

// Show deposit modal
function showDepositModal() {
    const modalEl = document.getElementById('depositModal');
    if (modalEl && window.bootstrap) {
        const depositModal = new bootstrap.Modal(modalEl);
        depositModal.show();
    }
}

// Show balance
function showBalance() {
    window.location.href = 'profile.html';
}

function viewProductDetails(productId) {
    window.location.href = `details.html?id=${productId}`;
}

function setAmount(amount) {
    const input = document.getElementById('depositAmount');
    const display = document.getElementById('confirmAmount');

    if (input) input.value = amount;
    if (display) display.textContent = amount;
}

let paymentCheckInterval;
let transactionId;

function selectPayment(method) {
    document.querySelectorAll('.payment-option').forEach(option => {
        option.classList.remove('active');
    });

    const selectedOption = document.querySelector(`.payment-option[data-app="${method}"]`);
    if (selectedOption) selectedOption.classList.add('active');

    const amountInput = document.getElementById('depositAmount');
    const amount = amountInput ? (amountInput.value || 0) : 0;

    const confirmAmount = document.getElementById('confirmAmount');
    if (confirmAmount) confirmAmount.textContent = amount;

    const instructions = document.getElementById('paymentInstructions');
    if (instructions) instructions.classList.remove('d-none');

    localStorage.setItem('selectedPaymentMethod', method);
}

function generateTransactionId() {
    return 'TXN_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Note: This function was in the original code but not called explicitly in the snippet provided.
// Keeping it for completeness if it's used by other parts.
function launchUPIApp(amount, paymentMethod) {
    const merchantUpiId = 'kum444kartik@okicici';
    const merchantName = 'InvestLoom7x';
    transactionId = generateTransactionId();

    const upiUrl = `upi://pay?pa=${merchantUpiId}&pn=${merchantName}&am=${amount}&tr=${transactionId}&cu=INR`;
    const link = document.createElement('a');
    link.href = upiUrl;
    link.click();

    startPaymentStatusCheck(transactionId, amount);
}

function confirmDeposit() {
    // This function was referenced in onclick but implementation was missing or implicit in original
    // Adding implementation based on context
    const amountInput = document.getElementById('depositAmount');
    const amount = amountInput ? parseFloat(amountInput.value) : 0;

    if (!amount || amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }

    // In a real app, this would verify payment
    // For this demo/template, we simulate success
    handleSuccessfulPayment(amount);
}

function startPaymentStatusCheck(txnId, amount) {
    let attempts = 0;
    const maxAttempts = 60;

    paymentCheckInterval = setInterval(() => {
        attempts++;
        checkPaymentStatus(txnId).then(status => {
            if (status === 'SUCCESS') {
                clearInterval(paymentCheckInterval);
                handleSuccessfulPayment(amount);
            } else if (status === 'FAILED') {
                clearInterval(paymentCheckInterval);
                handleFailedPayment();
            } else if (attempts >= maxAttempts) {
                clearInterval(paymentCheckInterval);
                handlePaymentTimeout();
            }
        });
    }, 2000);
}

async function checkPaymentStatus(txnId) {
    return new Promise(resolve => {
        const random = Math.random();
        if (random > 0.7) resolve('SUCCESS');
        else if (random > 0.4) resolve('PENDING');
        else resolve('FAILED');
    });
}

function handleSuccessfulPayment(amount) {
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        alert('Please log in to continue');
        return;
    }

    const currentBalance = parseFloat(currentUser.balance || 0);
    const newBalance = currentBalance + amount;
    currentUser.balance = newBalance;

    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    const transaction = {
        type: 'deposit',
        amount: amount,
        date: new Date().toISOString(),
        status: 'completed',
        transactionId: transactionId || generateTransactionId(),
        paymentMethod: localStorage.getItem('selectedPaymentMethod') || 'manual'
    };

    let transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    transactions.push(transaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));

    const balanceDisplay = document.getElementById('userBalanceAmount');
    if (balanceDisplay) balanceDisplay.textContent = `₹${newBalance}`;

    const modalEl = document.getElementById('depositModal');
    if (modalEl && window.bootstrap) {
        const depositModal = bootstrap.Modal.getInstance(modalEl);
        if (depositModal) depositModal.hide();
    }

    alert(`Successfully deposited ₹${amount}. Your new balance is ₹${newBalance}`);

    resetDepositForm();
}

function handleFailedPayment() {
    alert('Payment failed. Please try again.');
    resetDepositForm();
}

function handlePaymentTimeout() {
    alert('Payment timeout. Please try again.');
    resetDepositForm();
}

function resetDepositForm() {
    const amountInput = document.getElementById('depositAmount');
    if (amountInput) amountInput.value = '';

    const instructions = document.getElementById('paymentInstructions');
    if (instructions) instructions.classList.add('d-none');

    document.querySelectorAll('.payment-option').forEach(option => {
        option.classList.remove('active');
    });
    localStorage.removeItem('selectedPaymentMethod');
}

function setActiveNavItem() {
    // Set active nav item based on current page
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.bottom-nav a');

    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Placeholder for handleResponsiveLayout if it's not defined in common.js
if (typeof handleResponsiveLayout === 'undefined') {
    window.handleResponsiveLayout = function () {
        // Logic moved from common.js or implemented here if missing
        // Assuming it exists in common.js as per original file includes
    };
}

// Placeholder for updateUserAccountInfo if it's not defined
if (typeof updateUserAccountInfo === 'undefined') {
    window.updateUserAccountInfo = function () {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser) {
            const balanceEl = document.getElementById('userBalanceAmount');
            if (balanceEl) balanceEl.textContent = `₹${currentUser.balance || 0}`;

            const profilePic = document.getElementById('userProfilePic');
            if (profilePic && currentUser.profilePic) profilePic.src = currentUser.profilePic;
        }
    };
}

// Placeholder for handleProtectedNavigation
if (typeof handleProtectedNavigation === 'undefined') {
    window.handleProtectedNavigation = function (target) {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = 'auth/login.html';
        } else {
            window.location.href = target;
        }
    };
}
