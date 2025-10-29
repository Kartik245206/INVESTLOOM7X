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
        const products = await Product.find({ isActive: true })
            .sort({ createdAt: -1 })
            .lean();

        // Fix image paths
        const productsWithImages = products.map(product => ({
            ...product,
            imageUrl: product.imageUrl.startsWith('/') 
                ? product.imageUrl.substring(1) 
                : product.imageUrl
        }));

        res.json({
            success: true,
            products: productsWithImages,
            count: products.length
        });
    } catch (error) {
        console.error('Product fetch error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Debug route for frontend
router.get('/debug/frontend', async (req, res) => {
    try {
        const debugInfo = {
            environment: process.env.NODE_ENV,
            api: {
                url: req.protocol + '://' + req.get('host'),
                endpoints: {
                    products: '/api/products',
                    debug: '/api/debug'
                }
            },
            request: {
                headers: req.headers,
                originalUrl: req.originalUrl
            }
        };
        res.json(debugInfo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
