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
        let products;
        
        try {
            // Try to fetch from database
            products = await Product.find({ isActive: true })
                .sort({ createdAt: -1 })
                .lean();
        } catch (dbError) {
            console.warn('Database error, returning sample products:', dbError.message);
            // Return sample products if database fails
            products = [
                {
                    _id: '1',
                    name: 'Basic Investment Plan',
                    category: 'Starter',
                    price: 1000,
                    dailyEarning: 50,
                    duration: 100,
                    description: 'Perfect for beginners looking to start their investment journey.',
                    imageUrl: '/assets/images/discover-01.jpg',
                    isActive: true
                },
                {
                    _id: '2',
                    name: 'Premium Investment Plan',
                    category: 'Advanced',
                    price: 5000,
                    dailyEarning: 300,
                    duration: 100,
                    description: 'For experienced investors seeking higher returns.',
                    imageUrl: '/assets/images/discover-02.jpg',
                    isActive: true
                },
                {
                    _id: '3',
                    name: 'Elite Investment Plan',
                    category: 'Professional',
                    price: 10000,
                    dailyEarning: 700,
                    duration: 100,
                    description: 'Maximum returns for professional investors.',
                    imageUrl: '/assets/images/discover-03.jpg',
                    isActive: true
                }
            ];
        }

        // Fix image paths
        const productsWithImages = products.map(product => ({
            ...product,
            imageUrl: product.imageUrl && product.imageUrl.startsWith('/') 
                ? product.imageUrl.substring(1) 
                : (product.imageUrl || 'assets/images/discover-01.jpg')
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
