const express = require('express');
const router = express.Router();
const auth = require('./auth-middleware');
const Product = require('../models/Product');

// Get all products
router.get('/products', async (req, res) => {
    try {
        console.log('Fetching products from database...');
        const products = await Product.find({});
        console.log('Found products:', products);
        
        res.json({
            success: true,
            products: products
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching products',
            error: error.message
        });
    }
});

// Add new product - Fix for undefined callback
router.post('/products', auth, async (req, res) => {
    try {
        const { name, description, price, imageUrl } = req.body;
        
        const product = new Product({
            name,
            description,
            price,
            imageUrl,
            status: 'active', // Add this line
            isActive: true    // Add this as backup
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

router.put('/:id/toggle', auth, async (req, res) => {
    try {
        const { isActive } = req.body;
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { isActive },
            { new: true }
        );
        
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        res.json(product);
    } catch (error) {
        console.error('Error toggling product status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;