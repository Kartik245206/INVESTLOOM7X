const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';
const TOKEN_EXPIRES = '7d';

function makeToken(user) {
  return jwt.sign({ id: user._id, email: user.email, isAdmin: !!user.isAdmin }, JWT_SECRET, { expiresIn: TOKEN_EXPIRES });
}

// Health/check route
router.get('/ping', (req, res) => res.json({ ok: true }));

// Signup
router.post('/signup', async (req, res) => {
  try {
    const { name = '', email = '', password = '' } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    // Normalize email
    const normalizedEmail = String(email).trim().toLowerCase();

    // Check existing
    const existing = await User.findOne({ email: normalizedEmail }).lean();
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    // Hash password
    const hash = await bcrypt.hash(password, 12);

    const user = new User({
      name: String(name).trim(),
      email: normalizedEmail,
      passwordHash: hash,
      balance: 0,
      createdAt: new Date()
    });

    await user.save();

    const token = makeToken(user);
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 7
    });

    return res.json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email, balance: user.balance }
    });
  } catch (err) {
    console.error('[auth.signup] error:', err && err.stack ? err.stack : err);
    // safe error message for client; full stack is in server logs
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email = '', password = '' } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash || '');
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = makeToken(user);
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 7
    });

    return res.json({ success: true, user: { id: user._id, name: user.name, email: user.email, balance: user.balance } });
  } catch (err) {
    console.error('[auth.login] error:', err && err.stack ? err.stack : err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;