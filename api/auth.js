const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';
const TOKEN_EXPIRES = '7d';

function makeToken(user) {
  return jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: TOKEN_EXPIRES });
}

// check-email: returns { exists: true } if email present
router.post('/check-email', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });
    const exists = await User.findOne({ email }).lean();
    return res.json({ exists: !!exists });
  } catch (err) {
    console.error('check-email error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const hash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, passwordHash: hash, balance: 0 });

    const token = makeToken(user);
    res.cookie('token', token, { httpOnly: true, sameSite: 'lax' });
    res.json({ success: true, user: { id: user._id, email: user.email, name: user.name } });
  } catch (err) {
    console.error('signup error', err);
    res.status(500).json({ error: 'Signup failed' });
  }
});

// login
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
    console.error('login error', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;