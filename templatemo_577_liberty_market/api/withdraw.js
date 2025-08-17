const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// In-memory transaction log (replace with database in production)
const transactionLog = new Map();

// Withdrawal request handler
router.post('/withdraw', async (req, res) => {
    try {
        const { userId, amount, upiId, timestamp } = req.body;

        // Input validation
        if (!userId || !amount || !upiId || !timestamp) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Generate unique transaction ID
        const transactionId = uuidv4();

        // Log transaction request
        const transaction = {
            id: transactionId,
            userId,
            amount,
            upiId,
            timestamp,
            status: 'pending',
            completedAt: null
        };

        transactionLog.set(transactionId, transaction);

        // Simulate UPI transaction processing
        // In production, integrate with actual UPI service
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Update transaction status
        transaction.status = 'completed';
        transaction.completedAt = new Date().toISOString();
        transactionLog.set(transactionId, transaction);

        // Return success response
        return res.json({
            success: true,
            message: 'Withdrawal processed successfully',
            transactionId,
            amount,
            timestamp: transaction.completedAt
        });

    } catch (error) {
        console.error('Withdrawal processing error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Transaction status endpoint
router.get('/withdraw/status/:transactionId', (req, res) => {
    const { transactionId } = req.params;
    const transaction = transactionLog.get(transactionId);

    if (!transaction) {
        return res.status(404).json({
            success: false,
            message: 'Transaction not found'
        });
    }

    return res.json({
        success: true,
        transaction
    });
});

module.exports = router;