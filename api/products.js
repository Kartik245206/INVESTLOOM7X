
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// GET all products
router.get('/', async (req, res) => {
    try {
        const products = await Product.find({ isActive: true });
        res.json({
            success: true,
            products: products
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch products'
        });
    }
});

// GET single product
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }
        res.json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch product'
        });
    }
});

module.exports = router;
