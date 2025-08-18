const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    fullName: String,
    phone: String,
    upiId: String,
    balance: {
        type: Number,
        default: 0
    },
    profilePic: {
        type: String,
        default: 'assets/images/author.jpg'
    },
    transactions: [{
        type: {
            type: String,
            enum: ['credit', 'debit']
        },
        amount: Number,
        description: String,
        date: {
            type: Date,
            default: Date.now
        }
    }],
    emiHistory: [{
        productId: String,
        amount: Number,
        installments: Number,
        paidInstallments: {
            type: Number,
            default: 0
        },
        status: {
            type: String,
            enum: ['active', 'completed', 'defaulted'],
            default: 'active'
        },
        startDate: {
            type: Date,
            default: Date.now
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

