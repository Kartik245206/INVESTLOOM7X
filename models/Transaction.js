const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    amount: { type: Number, required: true },
    transactionId: { type: String, required: true, unique: true },
    upiId: { type: String, required: true },
    status: { 
        type: String, 
        required: true, 
        enum: ['PENDING', 'SUCCESS', 'FAILED'], 
        default: 'PENDING' 
    },
    createdAt: { type: Date, default: Date.now },
    completedAt: { type: Date }
});

module.exports = mongoose.model('Transaction', TransactionSchema);