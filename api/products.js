
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Get Product model
const Product = mongoose.model('Product');

// GET all products
router.get('/', async (req, res) => {
    try {
        console.log('📦 Fetching all products...');
        
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
        console.error('❌ Error fetching products:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch products',
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// GET single product by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        console.log(`📦 Fetching product with ID: ${id}`);
        
        // Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid product ID format'
            });
        }
        
        const product = await Product.findById(id).lean();
        
        if (!product) {
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
        console.error('❌ Error fetching product:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch product',
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

module.exports = router;
