const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User'); // ensure this model exists and exports mongoose model

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

    const normalizedEmail = String(email).trim().toLowerCase();

    console.log('[auth.signup] checking existing user for', normalizedEmail);
    // Use a try-catch block specifically for the findOne operation to handle potential errors
    try {
      const existing = await User.findOne({ email: normalizedEmail }).lean();
      if (existing) {
        console.log('[auth.signup] email already exists');
        return res.status(409).json({ error: 'Email already registered' });
      }
    } catch (findError) {
      console.error('[auth.signup] error checking existing user:', findError);
      // Continue with signup process even if there was an error checking for existing user
      // This prevents the duplicate key error from blocking legitimate signups
    }

    const hash = await bcrypt.hash(password, 12);

    const user = new User({
      name: String(name).trim(),
      email: normalizedEmail,
      passwordHash: hash,
      balance: 0,
      createdAt: new Date()
    });

    console.log('[auth.signup] saving user to DB...');
    try {
      await user.save();
      console.log('[auth.signup] user saved:', user._id);

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
    } catch (saveError) {
      // Handle duplicate key error specifically
      if (saveError.code === 11000 && saveError.keyPattern && saveError.keyPattern.email) {
        console.log('[auth.signup] duplicate email detected during save');
        return res.status(409).json({ error: 'This email is already registered. Please use a different email or login instead.' });
      }
      throw saveError; // Re-throw other errors to be caught by the outer catch block
    }
  } catch (err) {
    console.error('[auth.signup] error:', err && err.stack ? err.stack : err);
    if (err && err.code === 11000) {
      return res.status(409).json({ error: 'Email already registered (duplicate key)' });
    }
    // temporarily return the error message to help debugging (remove in production)
    return res.status(500).json({ error: err && err.message ? err.message : 'Internal Server Error' });
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

// call /api/auth/signup instead of writing to localStorage
async function signup(formData) {
  const resp = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });
  return resp.json();
}

module.exports = router;