const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Get all active products (public endpoint)
router.get('/products', async (req, res) => {
    try {
        const products = await Product.find({ status: 'active' })
            .sort({ createdAt: -1 })
            .select('-__v');
        
        res.json({
            success: true,
            products: products,
            count: products.length
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching products',
            products: []
        });
    }
});

// Get single product by ID
router.get('/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        res.json({
            success: true,
            product: product
        });
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching product'
        });
    }
});

module.exports = router;