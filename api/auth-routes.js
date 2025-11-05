const express = require('express');
const router = express.Router();
const User = require('./models/User');
const jwt = require('jsonwebtoken');

// Regular signup route
router.post('/signup', async (req, res) => {
    try {
        const { username, phoneNumber, upiId } = req.body;

        // Check if username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        // Create new user
        const user = await User.create({
            username,
            phoneNumber,
            upiId,
            accountType: 'email',
            isVerified: true
        });

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                phoneNumber: user.phoneNumber,
                upiId: user.upiId
            },
            token
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Error creating account' });
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        const { username, phoneNumber } = req.body;

        // Find user by username and phone number
        const user = await User.findOne({ username, phoneNumber });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Update last login
        await user.updateLastLogin();

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                phoneNumber: user.phoneNumber,
                upiId: user.upiId
            },
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Error logging in' });
    }
});

// Get current user
router.get('/me', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                phoneNumber: user.phoneNumber,
                upiId: user.upiId
            }
        });
    } catch (error) {
        console.error('Auth error:', error);
        res.status(401).json({ error: 'Invalid token' });
    }
});

// Check if username exists
router.get('/check-username/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        res.json({ exists: !!user });
    } catch (error) {
        console.error('Username check error:', error);
        res.status(500).json({ error: 'Error checking username' });
    }
});

// Logout route
router.post('/logout', (req, res) => {
    res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = router;
