const mongoose = require('mongoose');
const { connections } = require('../../config/database');

const TransactionSchema = new mongoose.Schema({
    userId: {
        type: String,  // Store user ID as string since it's from different database
        required: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    transactionId: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ['PENDING', 'COMPLETED', 'FAILED'],
        default: 'PENDING'
    },
    upiId: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    completedAt: {
        type: Date
    }
});

// Create the model using the products connection
// Fallback to default mongoose connection if connections.products is not available
module.exports = connections.products ? connections.products.model('Transaction', TransactionSchema) : mongoose.model('Transaction', TransactionSchema);
