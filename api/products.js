
const express = require('express');
const router = express.Router();
const Product = require('./models/Product');

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
            message: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Get product by ID
router.get('/:id', async (req, res) => {
    try {
        console.log('[products.getById] Fetching product:', req.params.id);
        
        const product = await Product.findById(req.params.id).lean();
        
        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }
        
        res.json({
            success: true,
            product: product
        });
    } catch (error) {
        console.error('[products.getById] Error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch product',
            message: error.message
        });
    }
});

module.exports = router;
