const express = require('express');
const router = express.Router();
const authMiddleware = require('./auth-middleware');
const Transaction = require('../models/Transaction');
const { verifyUPIPayment } = require('../utils/upiVerification');

// Initiate payment
router.post('/initiate', authMiddleware, async (req, res) => {
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
router.get('/status/:transactionId', authMiddleware, async (req, res) => {
    try {
        const { transactionId } = req.params;
        
        // Get transaction from database
        const transaction = await Transaction.findOne({ transactionId });
        
        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        // Verify UPI payment status
        const paymentStatus = await verifyUPIPayment(transactionId);
        
        if (paymentStatus.success) {
            // Update transaction status
            transaction.status = 'SUCCESS';
            transaction.completedAt = new Date();
            await transaction.save();

            // Add investment to user's portfolio
            await addInvestmentToUser(req.user.id, transaction.productId);
            
            return res.json({ status: 'SUCCESS' });
        }
        
        return res.json({ status: transaction.status });

    } catch (error) {
        console.error('Status check failed:', error);
        res.status(500).json({ error: 'Failed to check payment status' });
    }
});

// Handle purchase request
router.post('/purchase', authMiddleware, async (req, res) => {
    try {
        // Add your purchase logic here
        const { productId, quantity } = req.body;
        
        // Validate request
        if (!productId || !quantity) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Add purchase processing logic here
        
        res.status(200).json({ message: 'Purchase successful' });
    } catch (error) {
        console.error('Purchase error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;