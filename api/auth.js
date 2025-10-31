const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const User = require('./models/User');

// Enable CORS for all auth routes
router.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:8000', 'https://investloom7x.onrender.com'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Rate limiting setup
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: 'Too many login attempts from this IP, please try again after 15 minutes'
});

const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // limit each IP to 3 accounts per hour
    message: 'Too many accounts created from this IP, please try again after an hour'
});

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Validation middleware
const validateRegistration = [
    body('email').isEmail().normalizeEmail(),
    body('username').isLength({ min: 3, max: 30 }).trim(),
    body('password').isLength({ min: 8 })
        .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    body('firstName').trim().notEmpty(),
    body('lastName').trim().notEmpty(),
    body('phone').optional().matches(/^\+?[\d\s-]{10,}$/)
];

const validateLogin = [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
];

// JWT helper functions
const generateToken = (user) => {
    return jwt.sign(
        {
            userId: user._id,
            email: user.email,
            role: user.role
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
    );
};
    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: `Missing required fields: ${missingFields.join(', ')}` 
      });
    }
    next();

// Health check route
router.get('/ping', (req, res) => res.json({ ok: true }));

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Auth API is working', timestamp: new Date() });
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

// Signup route
router.post('/signup', async (req, res) => {
  try {
    const { 
      firstName,
      lastName,
      email, 
      password, 
      username, 
      phone
    } = req.body;
    
    // Basic validation
    if (!email || !password || !username || !firstName || !lastName) {
      return res.status(400).json({ 
        success: false,
        error: 'Please fill in all required fields' 
      });
    }
    
    // Normalize inputs
    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedUsername = String(username).trim().toLowerCase();

    // Validate username length
    if (normalizedUsername.length < 3) {
      return res.status(400).json({
        success: false,
        error: 'Username must be at least 3 characters long'
      });
    }

    // Validate password length
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters long'
      });
    }

    // Check for existing email and username
    const existingUser = await User.findOne({
      $or: [
        { email: normalizedEmail },
        { username: normalizedUsername }
      ]
    });

    if (existingUser) {
      if (existingUser.email === normalizedEmail) {
        return res.status(409).json({
          success: false,
          error: 'Email already registered'
        });
      }
      return res.status(409).json({
        success: false,
        error: 'Username already taken. Please choose a different username.'
      });
    }

    // Create new user
    const newUser = new User({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      username: normalizedUsername,
      password, // Password will be hashed by mongoose pre-save hook
      phone: phone ? phone.trim() : undefined
    });

    const user = new User({
      firstName,
      lastName,
      email: normalizedEmail,
      username: normalizedUsername,
      phone: String(phone).trim(),
      password: passwordHash, // Note: schema field is password, not passwordHash
      balance: 0
    });

    // Save user
    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    try {
      // Save the user
      const savedUser = await newUser.save();

      // Create token
      const token = jwt.sign(
        { userId: savedUser._id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      // Send success response
      return res.status(201).json({
        success: true,
        token,
        user: {
          id: savedUser._id,
          firstName: savedUser.firstName,
          lastName: savedUser.lastName,
          email: savedUser.email,
          username: savedUser.username
        }
      });
    } catch (error) {
      console.error('[auth.signup] error:', error);
      
      // Handle mongoose validation errors
      if (error.name === 'ValidationError') {
        const validationErrors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({
          success: false,
          error: validationErrors[0]
        });
      }
      
      // Handle duplicate key errors from MongoDB
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        return res.status(409).json({
          success: false,
          error: `This ${field} is already registered. Please use a different ${field}.`
        });
      }

      return res.status(500).json({
        success: false,
        error: 'Server error during signup. Please try again.'
      });
    }
  } catch (error) {
    console.error('[auth.signup] outer error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error during signup. Please try again.'
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    console.log('Login attempt for:', req.body.email);
    
    const { email, password } = req.body;
    const normalizedEmail = String(email).trim().toLowerCase();
    
    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password'
      });
    }

    // Find user by email
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
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
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Send response
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: user.username,
        balance: user.balance || 0
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



// Development only - clear users route
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

module.exports = router;