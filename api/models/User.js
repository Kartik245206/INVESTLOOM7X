const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    upi: { type: String },
    bank: {
        accountNumber: String,
        ifsc: String,
        bankName: String
    },
    cards: [{ brand: String, last4: String, token: String }]
}, { _id: false });

const UserSchema = new mongoose.Schema({
    name: { type: String },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String },
    googleId: { type: String, index: true, sparse: true },
    payments: PaymentSchema,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);