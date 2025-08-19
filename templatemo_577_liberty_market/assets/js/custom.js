(function($) {
    "use strict";

    // Menu Toggle
    $('.mobile-menu-trigger').on('click', function(e) {
        e.preventDefault();
        $(this).toggleClass('active');
        $('#nav-menu').toggleClass('active');
    });

    // Close menu on window resize
    $(window).on('resize', function() {
        if ($(window).width() > 991) {
            $('.mobile-menu-trigger').removeClass('active');
            $('#nav-menu').removeClass('active');
        }
    });

    // Close menu when clicking outside
    $(document).on('click', function(e) {
        if (!$(e.target).closest('.main-nav').length) {
            $('.mobile-menu-trigger').removeClass('active');
            $('#nav-menu').removeClass('active');
        }
    });

    // Product loading function
    function loadProducts() {
        const productContainer = document.getElementById('productContainer');
        if (!productContainer) return;

        // Get products from localStorage
        const products = JSON.parse(localStorage.getItem('products') || '[]');
        
        if (products.length === 0) {
            // Add some default products if none exist
            const defaultProducts = [
                {
                    id: '1',
                    name: 'Basic Investment Plan',
                    price: 5000,
                    dailyEarning: 100,
                    category: 'basic',
                    image: 'assets/images/market-01.jpg',
                    status: 'active'
                },
                {
                    id: '2',
                    name: 'Standard Investment Plan',
                    price: 10000,
                    dailyEarning: 250,
                    category: 'standard',
                    image: 'assets/images/market-02.jpg',
                    status: 'active'
                },
                {
                    id: '3',
                    name: 'Premium Investment Plan',
                    price: 25000,
                    dailyEarning: 750,
                    category: 'premium',
                    image: 'assets/images/market-03.jpg',
                    status: 'active'
                }
            ];
            
            localStorage.setItem('products', JSON.stringify(defaultProducts));
            products.push(...defaultProducts);
        }

        // Filter only active products
        const activeProducts = products.filter(product => product.status === 'active');

        // Generate HTML for products
        productContainer.innerHTML = activeProducts.map(product => `
            <div class="col-lg-4 col-md-6 mb-4">
                <div class="currently-market-item">
                    <div class="item">
                        <div class="left-image">
                            <img src="${product.image}" alt="${product.name}">
                        </div>
                        <div class="right-content">
                            <h4>${product.name}</h4>
                            <div class="price">
                                <span>Price:</span>
                                <h6>₹${product.price}</h6>
                            </div>
                            <div class="earning">
                                <span>Daily Earning:</span>
                                <h6>₹${product.dailyEarning}</h6>
                            </div>
                            <div class="text-button">
                                <a href="details.html?id=${product.id}">View Investment</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Call loadProducts when page loads
    document.addEventListener('DOMContentLoaded', loadProducts);

    // Add filter functionality
    function filterProducts(category) {
        const products = JSON.parse(localStorage.getItem('products') || '[]');
        const filtered = category === 'all' 
            ? products 
            : products.filter(p => p.category === category && p.status === 'active');
        
        const container = document.getElementById('productContainer');
        if (!container) return;
        
        container.innerHTML = filtered.map(product => `
            <div class="col-lg-4 col-md-6 mb-4">
                <div class="currently-market-item">
                    <div class="item">
                        <div class="left-image">
                            <img src="${product.image}" alt="${product.name}">
                        </div>
                        <div class="right-content">
                            <h4>${product.name}</h4>
                            <div class="price">
                                <span>Price:</span>
                                <h6>₹${product.price}</h6>
                            </div>
                            <div class="earning">
                                <span>Daily Earning:</span>
                                <h6>₹${product.dailyEarning}</h6>
                            </div>
                            <div class="text-button">
                                <a href="details.html?id=${product.id}">View Investment</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Add this to your existing event listeners
    document.querySelectorAll('.filter-button').forEach(btn => {
        btn.addEventListener('click', () => filterProducts(btn.dataset.category));
    });

    (function () {
      'use strict';

      // Helper: safe JSON parse
      function safeParse(s, fallback = []) {
        try { return JSON.parse(s || 'null') || fallback; } catch (e) { return fallback; }
      }

      // Render products into container
      function renderProducts(products) {
        const container = document.getElementById('productContainer') || document.querySelector('.currently-market-items');
        if (!container) return;
        const html = products.map(p => `
          <div class="col-lg-4 col-md-6 mb-4">
            <div class="currently-market-item">
              <div class="item">
                <div class="left-image">
                  <img src="${p.image || 'assets/images/market-01.jpg'}" alt="${p.name}" onerror="this.src='assets/images/market-01.jpg'">
                </div>
                <div class="right-content">
                  <h4>${p.name}</h4>
                  <div class="price"><span>Price:</span><h6>₹${p.price}</h6></div>
                  <div class="earning"><span>Daily Earning:</span><h6>₹${p.dailyEarning}</h6></div>
                  <div class="text-button"><a href="details.html?id=${p.id}">View Investment</a></div>
                </div>
              </div>
            </div>
          </div>
        `).join('');
        container.innerHTML = html;
      }

      // Load published products from backend, fallback to localStorage/defaults
      async function loadPublishedProducts() {
        try {
          const res = await fetch('/api/products', { method: 'GET' });
          if (res.ok) {
            const products = await res.json();
            if (Array.isArray(products) && products.length) {
              renderProducts(products);
              // keep publishedProducts cached
              localStorage.setItem('publishedProducts', JSON.stringify(products));
              return;
            }
          }
        } catch (err) {
          console.warn('API /api/products failed, using local fallback', err);
        }

        // fallback
        let products = safeParse(localStorage.getItem('publishedProducts'), []);
        if (!products || products.length === 0) {
          products = safeParse(localStorage.getItem('products'), []);
        }
        if (!products || products.length === 0) {
          products = [
            { id: '1', name: 'Basic Plan', price: 5000, dailyEarning: 100, category: 'basic', image: 'assets/images/market-01.jpg', status: 'active' },
            { id: '2', name: 'Standard Plan', price: 10000, dailyEarning: 250, category: 'standard', image: 'assets/images/market-02.jpg', status: 'active' },
            { id: '3', name: 'Premium Plan', price: 25000, dailyEarning: 750, category: 'premium', image: 'assets/images/market-03.jpg', status: 'active' }
          ];
          localStorage.setItem('products', JSON.stringify(products));
          localStorage.setItem('publishedProducts', JSON.stringify(products));
        }
        renderProducts(products);
      }

      // Deposit: call backend, fallback to localStorage if API fails
      async function processDeposit() {
        const amountEl = document.getElementById('depositAmount');
        const txnRefEl = document.getElementById('transactionRef');
        if (!amountEl || !txnRefEl) { alert('Deposit form not ready'); return; }

        const amount = Number(amountEl.value);
        const txnRef = (txnRefEl.value || '').trim();
        if (!amount || amount < 100) { alert('Minimum deposit ₹100'); return; }
        if (!txnRef) { alert('Enter transaction reference'); return; }

        const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
        if (!currentUser?.id) { alert('Please login first'); window.location.href = 'login.html'; return; }

        const payload = { amount, txnRef, method: document.querySelector('input[name="payMethod"]:checked')?.value || 'upi' };

        try {
          const res = await fetch('/api/deposit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(payload)
          });

          if (res.ok) {
            const data = await res.json();
            // server returns updated balance
            currentUser.balance = data.balance ?? ((currentUser.balance||0) + amount);
            currentUser.deposits = currentUser.deposits || [];
            currentUser.deposits.push({ amount, txnRef, method: payload.method, status: 'completed', timestamp: new Date().toISOString() });
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            updateBalanceDisplays();
            alert(`Deposit ₹${amount} successful. Balance updated.`);
            // close modal if present
            const modal = bootstrap.Modal.getInstance(document.getElementById('depositModal'));
            if (modal) modal.hide();
            return;
          }
          throw new Error('Deposit API returned ' + res.status);
        } catch (err) {
          console.warn('Deposit API failed, saving locally', err);
          // fallback: localStorage record (mark pending)
          currentUser.deposits = currentUser.deposits || [];
          currentUser.deposits.push({ amount, txnRef, method: payload.method, status: 'pending', timestamp: new Date().toISOString() });
          // do not auto-add to balance until admin verifies, but if you want immediate add:
          currentUser.balance = (currentUser.balance || 0) + amount;
          localStorage.setItem('currentUser', JSON.stringify(currentUser));
          updateBalanceDisplays();
          alert('Deposit recorded locally (pending). Will reflect after admin verification.');
          const modal = bootstrap.Modal.getInstance(document.getElementById('depositModal'));
          if (modal) modal.hide();
        }
      }

      // Withdrawal: open profile withdrawal section or call API
      function handleWithdrawal() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
        if (!currentUser) { alert('Please login'); window.location.href = 'login.html'; return; }
        window.location.href = 'profile.html#withdraw';
      }

      async function processWithdrawal(event) {
        if (event) event.preventDefault();
        const amount = Number(document.getElementById('withdrawalAmount')?.value || 0);
        const method = document.querySelector('input[name="withdrawalMethod"]:checked')?.value || 'upi';
        const details = method === 'upi' ? { upiId: document.getElementById('upiId')?.value } :
                      { accountName: document.getElementById('accountName')?.value, accountNumber: document.getElementById('accountNumber')?.value, ifsc: document.getElementById('ifscCode')?.value };

        const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
        if (!currentUser?.id) { alert('Please login'); window.location.href = 'login.html'; return; }
        if (!amount || amount < 500) { alert('Minimum withdrawal ₹500'); return; }
        if (amount > (currentUser.balance || 0)) { alert('Insufficient balance'); return; }

        const payload = { amount, details };

        try {
          const res = await fetch('/api/withdraw', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(payload)
          });
          if (res.ok) {
            const data = await res.json();
            currentUser.balance = data.balance ?? (currentUser.balance - amount);
            currentUser.withdrawals = currentUser.withdrawals || [];
            currentUser.withdrawals.push({ amount, details, status: 'pending', timestamp: new Date().toISOString() });
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            updateBalanceDisplays();
            alert('Withdrawal requested. Admin will process it.');
            const modal = bootstrap.Modal.getInstance(document.getElementById('withdrawalModal'));
            if (modal) modal.hide();
            return;
          }
          throw new Error('Withdraw API returned ' + res.status);
        } catch (err) {
          console.warn('Withdraw API failed, using local fallback', err);
          // local fallback: still deduct balance and store pending withdraw
          currentUser.balance = (currentUser.balance || 0) - amount;
          currentUser.withdrawals = currentUser.withdrawals || [];
          currentUser.withdrawals.push({ amount, details, status: 'pending', timestamp: new Date().toISOString() });
          localStorage.setItem('currentUser', JSON.stringify(currentUser));
          updateBalanceDisplays();
          alert('Withdrawal recorded locally (pending).');
          const modal = bootstrap.Modal.getInstance(document.getElementById('withdrawalModal'));
          if (modal) modal.hide();
        }
      }

      // Update balance elements on page
      function updateBalanceDisplays() {
        const cu = JSON.parse(localStorage.getItem('currentUser') || 'null');
        const bal = (cu && cu.balance) ? Number(cu.balance) : 0;
        const el1 = document.getElementById('userBalance') || document.getElementById('userBalanceAmount');
        const el2 = document.getElementById('currentBalance') || null;
        if (el1) el1.textContent = `₹${bal.toFixed(2)}`;
        if (el2) el2.textContent = `₹${bal.toFixed(2)}`;
      }

      // Quick amount setter for deposit modal
      function setDepositAmount(value) {
        const el = document.getElementById('depositAmount');
        if (el) el.value = value;
        const confirmEl = document.getElementById('confirmAmount');
        if (confirmEl) confirmEl.textContent = value;
      }

      // Attach globally needed functions
      window.loadPublishedProducts = loadPublishedProducts;
      window.processDeposit = processDeposit;
      window.handleWithdrawal = handleWithdrawal;
      window.processWithdrawal = processWithdrawal;
      window.setDepositAmount = setDepositAmount;
      window.updateBalanceDisplays = updateBalanceDisplays;

      // init
      document.addEventListener('DOMContentLoaded', function () {
        loadPublishedProducts();
        updateBalanceDisplays();

        // wire quick-amount buttons if they exist
        document.querySelectorAll('.quick-amounts button, .quick-amounts .btn').forEach(b => {
          b.addEventListener('click', function () {
            const v = this.textContent.replace(/[^0-9]/g, '') || this.dataset.amount;
            setDepositAmount(Number(v));
          });
        });

        // wire deposit modal confirm
        const depBtn = document.getElementById('confirmDepositBtn');
        if (depBtn) depBtn.addEventListener('click', processDeposit);

        // wire withdrawal form
        const withdrawForm = document.getElementById('withdrawalForm');
        if (withdrawForm) withdrawForm.addEventListener('submit', processWithdrawal);
      });

        })(jQuery);
    })(jQuery);
