
const API_CONFIG = {
    BASE_URL: 'https://investloom7x.onrender.com',
    ENDPOINTS: {
        PRODUCTS: '/api/products',
        AUTH: '/api/auth',
        PURCHASE: '/api/purchase',
        WITHDRAW: '/api/withdraw',
        TRANSACTIONS: '/api/transactions',
        ADMIN: '/api/admin'
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API_CONFIG;
}

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
