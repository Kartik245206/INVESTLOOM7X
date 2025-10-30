const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const User = require('./models/User'); // Updated path to User model

// Enable CORS for all auth routes
router.use(cors({
    origin: ['http://localhost:8000', 'https://investloom7x.onrender.com'],
    credentials: true
}));

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';
const ADMIN_SECRET = process.env.ADMIN_SECRET;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const TOKEN_EXPIRES = '7d';

function makeToken(user) {
  return jwt.sign({ id: user._id, email: user.email, isAdmin: !!user.isAdmin }, JWT_SECRET, { expiresIn: TOKEN_EXPIRES });
}

// Health/check route
router.get('/ping', (req, res) => res.json({ ok: true }));

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Auth API is working', timestamp: new Date() });
});

// User Login
router.post('/login', async (req, res) => {
  try {
    console.log('Login request received:', {
      body: req.body,
      contentType: req.headers['content-type']
    });
    
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: 'No request body received' });
    }
    
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    
    // Find user by email
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRES }
    );

    // Send success response with token
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username
      }
    });
  } catch (error) {
    console.error('[auth.login] error:', error);
    res.status(500).json({ error: 'Internal server error during login' });
  }
});

// Admin Login
router.post('/admin/login', async (req, res) => {
  try {
    const { username, phone, password } = req.body;
    
    console.log('Received login data:', { username, phone, password }); // Debug
    console.log('Environment variables:', { 
      ADMIN_USERNAME: process.env.ADMIN_USERNAME, 
      ADMIN_PASSWORD: process.env.ADMIN_PASSWORD 
    }); // Debug
    
    const loginField = username || phone;
    
    const validUsername = loginField === 'bhadana' || loginField === process.env.ADMIN_USERNAME;
    const validPhone = loginField === '7417915397';
    const validPassword = password === 'Kartik904541' || password === process.env.ADMIN_PASSWORD;
    
    console.log('Validation results:', { validUsername, validPhone, validPassword }); // Debug
    
    if (!(validUsername || validPhone) || !validPassword) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    // Generate admin token
    const token = jwt.sign(
      { isAdmin: true },
      process.env.JWT_SECRET || 'Kartik7078212686@',
      { expiresIn: '24h' }
    );

    // Send response with token and admin secret
    res.json({
      success: true,
      token,
      adminSecret: process.env.ADMIN_SECRET || 'Kartik7417'
    });
  } catch (error) {
    console.error('[auth.adminLogin] error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Signup
router.post('/signup', async (req, res) => {
  try {
    const { 
      name = '', 
      email = '', 
      password = '', 
      username = '', 
      phone = '', 
      upiId = '' 
    } = req.body || {};
    
    if (!email || !password || !username) {
      return res.status(400).json({ error: 'Email, username and password are required' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedUsername = String(username).trim().toLowerCase();

    console.log('[auth.signup] checking existing user for email:', normalizedEmail, 'username:', normalizedUsername);
    
    try {
      // Check for existing email
      const existingEmail = await User.findOne({ email: normalizedEmail }).lean();
      if (existingEmail) {
        console.log('[auth.signup] email already exists');
        return res.status(409).json({ error: 'Email already registered' });
      }

      // Check for existing username
      const existingUsername = await User.findOne({ username: normalizedUsername }).lean();
      if (existingUsername) {
        console.log('[auth.signup] username already exists');
        return res.status(409).json({ error: 'Username already exists' });
      }
    } catch (findError) {
      console.error('[auth.signup] error checking existing user:', findError);
    }

    const hash = await bcrypt.hash(password, 12);

    const user = new User({
      name: String(name).trim(),
      email: normalizedEmail,
      username: normalizedUsername,
      phone: String(phone).trim(),
      upiId: String(upiId).trim(),
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
        token: token,
        user: { 
          id: user._id, 
          name: user.name, 
          email: user.email, 
          username: user.username,
          balance: user.balance 
        }
      });
    } catch (saveError) {
      // Handle duplicate key errors
      if (saveError.code === 11000) {
        if (saveError.keyPattern && saveError.keyPattern.email) {
          console.log('[auth.signup] duplicate email detected during save');
          return res.status(409).json({ error: 'This email is already registered. Please use a different email or login instead.' });
        }
        if (saveError.keyPattern && saveError.keyPattern.username) {
          console.log('[auth.signup] duplicate username detected during save');
          return res.status(409).json({ error: 'This username is already taken. Please choose a different username.' });
        }
        return res.status(409).json({ error: 'User already exists with this information' });
      }
      throw saveError;
    }
  } catch (err) {
    console.error('[auth.signup] error:', err && err.stack ? err.stack : err);
    return res.status(500).json({ error: err && err.message ? err.message : 'Internal Server Error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    console.log('Login attempt for:', req.body.email);
    
    const { email, password } = req.body;
    
    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password'
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Create token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Send response
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        balance: user.balance,
        profilePic: user.profilePic
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Add this route temporarily for development only
router.delete('/clear-users', async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: 'Not allowed in production' });
    }
    
    const result = await User.deleteMany({});
    console.log('Deleted users:', result.deletedCount);
    res.json({ message: `Deleted ${result.deletedCount} users` });
  } catch (error) {
    console.error('Error clearing users:', error);
    res.status(500).json({ error: 'Failed to clear users' });
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