const mongoose = require('mongoose');
const { connections } = require('../../config/database');

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    imageUrl: {
        type: String
    },
    category: {
        type: String,
        required: true
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create the model using the products connection
// Fallback to default mongoose connection if connections.products is not available
module.exports = connections.products ? connections.products.model('Product', ProductSchema) : mongoose.model('Product', ProductSchema);
