const express = require('express');
const router = express.Router();
const Product = require('./models/Product');

// Debug route to check products
router.get('/test', async (req, res) => {
    try {
        const products = await Product.find({}).lean();
        res.json({
            count: products.length,
            products: products
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all products
router.get('/', async (req, res) => {
    try {
        console.log('[products.getAll] Fetching products...');
        
        const products = await Product.find({ isActive: true })
            .sort({ createdAt: -1 })
            .lean();
        
        console.log('[products.getAll] Found products:', products.length);
        
        res.json({
            success: true,
            products: products,
            count: products.length
        });
    } catch (error) {
        console.error('[products.getAll] Error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch products',
            message: error.message
        });
    }
});

module.exports = router;
