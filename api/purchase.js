const express = require('express');
const router = express.Router();
const auth = require('./auth-middleware');
const Transaction = require('../models/Transaction');
const Product = require('./models/Product');

// Initiate payment
router.post('/initiate', auth, async (req, res) => {
    try {
        const { productId, amount, transactionId, upiId } = req.body;
        
        // Create pending transaction
        await Transaction.create({
            userId: req.user.id,
            productId,
            amount,
            transactionId,
            status: 'PENDING',
            upiId,
            createdAt: new Date()
        });

        res.json({ success: true, transactionId });
    } catch (error) {
        console.error('Payment initiation failed:', error);
        res.status(500).json({ error: 'Failed to initiate payment' });
    }
});

// Check payment status
router.get('/status/:transactionId', auth, async (req, res) => {
    try {
        const { transactionId } = req.params;
        const transaction = await Transaction.findOne({ transactionId });
        
        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        if (transaction.status === 'SUCCESS') {
            return res.json({ status: 'SUCCESS' });
        }
        
        return res.json({ status: transaction.status });

    } catch (error) {
        console.error('Status check failed:', error);
        res.status(500).json({ error: 'Failed to check payment status' });
    }
});

// Handle purchase request - Fixed callback function syntax
router.post('/purchase', auth, async (req, res) => {
    try {
        const { productId, amount } = req.body;
        const userId = req.user.id;

        if (!productId || !amount) {
            return res.status(400).json({
                success: false,
                message: 'Product ID and amount are required'
            });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        const transaction = new Transaction({
            userId,
            productId,
            amount,
            status: 'completed'
        });

        await transaction.save();

        res.status(200).json({
            success: true,
            message: 'Purchase successful',
            transaction: transaction
        });

    } catch (error) {
        console.error('Purchase error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

module.exports = router;