const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateToken, verifyToken } = require('../middleware/auth');

// Register User
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, fullName, phone, upiId } = req.body;

        // Check if user already exists
        let user = await User.findOne({ $or: [{ email }, { username }] });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create new user
        user = new User({
            username,
            email,
            password,
            fullName,
            phone,
            upiId
        });

        await user.save();

        // Generate token
        const token = generateToken(user._id);

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.json({
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                balance: user.balance,
                profilePic: user.profilePic
            },
            token
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Login User
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate token
        const token = generateToken(user._id);

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.json({
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                balance: user.balance,
                profilePic: user.profilePic
            },
            token
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get User Profile
router.get('/profile', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update User Profile
router.put('/profile', verifyToken, async (req, res) => {
    try {
        const { fullName, phone, upiId } = req.body;
        const user = await User.findById(req.user._id);

        if (fullName) user.fullName = fullName;
        if (phone) user.phone = phone;
        if (upiId) user.upiId = upiId;

        await user.save();
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update User Balance
router.put('/balance', verifyToken, async (req, res) => {
    try {
        const { amount, type, description } = req.body;
        const user = await User.findById(req.user._id);

        if (type === 'credit') {
            user.balance += amount;
        } else if (type === 'debit') {
            if (user.balance < amount) {
                return res.status(400).json({ message: 'Insufficient balance' });
            }
            user.balance -= amount;
        }

        user.transactions.push({
            type,
            amount,
            description
        });

        await user.save();
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
