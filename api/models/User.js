const mongoose = require('mongoose');
const { connections } = require('../../config/database');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 30
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    phoneNumber: {
        type: String,
        required: true,
        trim: true,
        match: [/^\+?[\d\s-]{10,}$/, 'Please enter a valid phone number']
    },
    upiId: {
        type: String,
        trim: true,
        sparse: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastLogin: {
        type: Date,
        default: Date.now
    },
    accountType: {
        type: String,
        enum: ['google', 'email'],
        required: true
    },
    isVerified: {
        type: Boolean,
        default: false
    }
});

// Update last login time
UserSchema.methods.updateLastLogin = function() {
    this.lastLogin = Date.now();
    return this.save();
};

// Create the model using the users connection
// Fallback to default mongoose connection if connections.users is not available
module.exports = connections.users ? connections.users.model('User', UserSchema) : mongoose.model('User', UserSchema);
