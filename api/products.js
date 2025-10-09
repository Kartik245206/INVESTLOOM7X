
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Middleware to check if Product model is loaded
router.use((req, res, next) => {
    try {
        if (!mongoose.models.Product) {
            console.error('❌ Product model not loaded!');
            return res.status(500).json({
                success: false,
                error: 'Product model not initialized'
            });
        }
        next();
    } catch (error) {
        console.error('❌ Middleware error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// GET all products
router.get('/', async (req, res) => {
    try {
        console.log('📦 GET /api/products - Fetching all products...');
        console.log('📊 MongoDB connection state:', mongoose.connection.readyState);
        
        const Product = mongoose.model('Product');
        console.log('✅ Product model loaded');
        
        const products = await Product.find({ isActive: true })
            .sort({ createdAt: -1 })
            .lean();
        
        console.log(`✅ Found ${products.length} products`);
        
        res.json({
            success: true,
            products: products,
            count: products.length
        });
    } catch (error) {
        console.error('❌ Error in GET /api/products:', error);
        console.error('Stack:', error.stack);
        
        res.status(500).json({
            success: false,
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? {
                stack: error.stack,
                name: error.name
            } : undefined
        });
    }
});

// GET single product by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        console.log(`📦 GET /api/products/${id} - Fetching product...`);
        
        // Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            console.log('❌ Invalid product ID format');
            return res.status(400).json({
                success: false,
                error: 'Invalid product ID format'
            });
        }
        
        const Product = mongoose.model('Product');
        const product = await Product.findById(id).lean();
        
        if (!product) {
            console.log('❌ Product not found');
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }
        
        console.log(`✅ Found product: ${product.name}`);
        
        res.json({
            success: true,
            product: product
        });
    } catch (error) {
        console.error('❌ Error in GET /api/products/:id:', error);
        console.error('Stack:', error.stack);
        
        res.status(500).json({
            success: false,
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? {
                stack: error.stack,
                name: error.name
            } : undefined
        });
    }
});

module.exports = router;
