const express = require('express');
const router = express.Router();
const auth = require('./auth-middleware');
const Product = require('../models/Product');

// Get all products
router.get('/products', async (req, res) => {
    try {
        const products = await Product.find({});
        res.json({
            success: true,
            products: products
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching products' });
    }
});

// Add new product - Fix for undefined callback
router.post('/products', auth, async (req, res) => {
    try {
        const { name, description, price, imageUrl } = req.body;
        
        // Validate required fields
        if (!name || !price) {
            return res.status(400).json({ message: 'Name and price are required' });
        }

        const product = new Product({
            name,
            description,
            price,
            imageUrl
        });

        const savedProduct = await product.save();
        res.status(201).json(savedProduct);
    } catch (error) {
        console.error('Add product error:', error);
        res.status(500).json({ message: 'Error adding product' });
    }
});

// Update product
router.put('/products/:id', auth, async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error updating product' });
    }
});

// Delete product
router.delete('/products/:id', auth, async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json({ message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting product' });
    }
});

// Ensure this endpoint returns the same data as the admin endpoint

router.get('/', async (req, res) => {
    try {
        // Fetch products from database
        const products = await Product.find({ status: 'active' });
        
        // Return the same structure as admin endpoint
        return res.json({
            success: true,
            products: products
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch products'
        });
    }
});

module.exports = router;