const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    dailyEarning: { type: Number, required: true },
    duration: { type: Number, default: 100 },
    category: { type: String, default: 'Investment' },
    description: { type: String },
    imageUrl: { type: String },
    image: { type: String },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', ProductSchema);