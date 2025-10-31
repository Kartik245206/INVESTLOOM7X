const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
    },
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters long'],
        maxlength: [30, 'Username cannot exceed 30 characters']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters long'],
        select: false // Password will not be included in query results by default
    },
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
        maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
        maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    phone: {
        type: String,
        trim: true,
        match: [/^\+?[\d\s-]{10,}$/, 'Please enter a valid phone number']
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    lastLogin: Date,
    failedLoginAttempts: {
        type: Number,
        default: 0
    },
    accountLocked: {
        type: Boolean,
        default: false
    },
    lockUntil: Date,
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended'],
        default: 'active'
    },
    profilePicture: {
        type: String,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for better query performance
UserSchema.index({ email: 1 });
UserSchema.index({ username: 1 });

// Password hashing middleware
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to check password
UserSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};

// Generate email verification token
UserSchema.methods.generateEmailVerificationToken = function() {
    this.emailVerificationToken = crypto.randomBytes(32).toString('hex');
    this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    return this.emailVerificationToken;
};

// Generate password reset token
UserSchema.methods.generatePasswordResetToken = function() {
    this.resetPasswordToken = crypto.randomBytes(32).toString('hex');
    this.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    return this.resetPasswordToken;
};

// Instance method to check if account is locked
UserSchema.methods.isAccountLocked = function() {
    return this.accountLocked && this.lockUntil && this.lockUntil > Date.now();
};

// Instance method to increment failed login attempts
UserSchema.methods.incrementLoginAttempts = async function() {
    // If previous lock has expired, restart count
    if (this.lockUntil && this.lockUntil < Date.now()) {
        this.failedLoginAttempts = 1;
        this.accountLocked = false;
        this.lockUntil = undefined;
    } else {
        this.failedLoginAttempts += 1;
        
        // Lock account if failed attempts reach 5
        if (this.failedLoginAttempts >= 5) {
            this.accountLocked = true;
            this.lockUntil = Date.now() + 30 * 60 * 1000; // Lock for 30 minutes
        }
    }
    
    await this.save();
};

// Reset login attempts
UserSchema.methods.resetLoginAttempts = async function() {
    this.failedLoginAttempts = 0;
    this.accountLocked = false;
    this.lockUntil = undefined;
    await this.save();
};

module.exports = mongoose.model('User', UserSchema);