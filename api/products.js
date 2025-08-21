const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const authMiddleware = require('./auth-middleware');

// Get all products
router.get('/', async (req, res) => {
    try {
        const products = await Product.find({ status: 'active' });
        res.json({ products });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin routes
router.post('/', authMiddleware, async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id, 
            req.body,
            { new: true }
        );
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;