const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    dailyEarning: {
        type: Number,
        required: true,
        min: 0
    },
    duration: {
        type: Number,
        default: 100
    },
    description: {
        type: String,
        default: ''
    },
    imageUrl: {
        type: String,
        default: 'assets/images/placeholder.jpg'
    },
    image: {
        type: String,
        default: 'assets/images/placeholder.jpg'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update timestamp on save
productSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Check if model already exists to prevent OverwriteModelError
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

module.exports = Product;