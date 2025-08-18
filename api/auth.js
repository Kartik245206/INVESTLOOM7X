const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';
const TOKEN_EXPIRES = '7d';

function makeToken(user) {
    return jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: TOKEN_EXPIRES });
}

function authMiddleware(req, res, next) {
    const token = req.cookies?.token || (req.headers.authorization || '').replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }
}

// Signup
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

        const existing = await User.findOne({ email });
        if (existing) return res.status(409).json({ error: 'Email already registered' });

        const hash = await bcrypt.hash(password, 12);
        const user = await User.create({ name, email, passwordHash: hash });

        const token = makeToken(user);
        res.cookie('token', token, { httpOnly: true, sameSite: 'lax' });
        res.json({ success: true, user: { id: user._id, email: user.email, name: user.name } });
    } catch (err) {
        console.error('Signup error:', err);
        res.status(500).json({ error: 'Signup failed' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        const ok = await bcrypt.compare(password, user.passwordHash || '');
        if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

        const token = makeToken(user);
        res.cookie('token', token, { httpOnly: true, sameSite: 'lax' });
        res.json({ success: true, user: { id: user._id, email: user.email, name: user.name } });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Google auth (email + googleId) — create user if not exists, or attach googleId
router.post('/google', async (req, res) => {
    try {
        const { email, name, googleId } = req.body;
        if (!email || !googleId) return res.status(400).json({ error: 'Invalid Google payload' });

        let user = await User.findOne({ $or: [{ googleId }, { email }] });
        if (!user) {
            user = await User.create({ name, email, googleId });
        } else if (!user.googleId) {
            user.googleId = googleId;
            await user.save();
        }

        const token = makeToken(user);
        res.cookie('token', token, { httpOnly: true, sameSite: 'lax' });
        res.json({ success: true, user: { id: user._id, email: user.email, name: user.name } });
    } catch (err) {
        console.error('Google auth error:', err);
        res.status(500).json({ error: 'Google auth failed' });
    }
});

// Save payment details (UPI / bank / card) — user must be authenticated
router.put('/payments', authMiddleware, async (req, res) => {
    try {
        const { upi, bank, card } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        user.payments = user.payments || {};
        if (upi) user.payments.upi = upi;
        if (bank) user.payments.bank = bank;
        if (card) {
            user.payments.cards = user.payments.cards || [];
            user.payments.cards.push(card);
        }

        await user.save();
        res.json({ success: true, payments: user.payments });
    } catch (err) {
        console.error('Save payments error:', err);
        res.status(500).json({ error: 'Failed to save payment details' });
    }
});

module.exports = router;