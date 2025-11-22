const express = require('express');
const router = express.Router();
const User = require('./models/User');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { authLimiter } = require('../middleware/security');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// Configure Google OAuth Strategy (if credentials are provided)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || "/api/auth/google/callback",
        userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            // Check if user already exists
            let user = await User.findOne({ googleId: profile.id });

            if (!user) {
                // Create new user if doesn't exist
                const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
                user = await User.create({
                    googleId: profile.id,
                    username: profile.displayName.replace(/\s+/g, '').toLowerCase() + Math.random().toString(36).slice(2, 6),
                    email: email,
                    phoneNumber: '0000000000', // Placeholder - user can update later
                    accountType: 'google',
                    isVerified: true
                });
            }

            // Update last login
            await user.updateLastLogin();
            return done(null, user);
        } catch (error) {
            return done(error, null);
        }
    }));

    // Serialize user for the session
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    // Deserialize user from the session
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (error) {
            done(error, null);
        }
    });
}

// Apply rate limiting to all auth routes
router.use(authLimiter);

// Regular signup route with validation
router.post('/signup', [
    body('username').trim().isLength({ min: 3, max: 30 }).escape(),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('phoneNumber').matches(/^\+?[\d\s-]{10,}$/).withMessage('Invalid phone number'),
    body('upiId').optional().trim().escape()
], async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array()[0].msg });
        }

        const { username, email, password, phoneNumber, upiId } = req.body;

        // Check if username or email already exists
        const existingUser = await User.findOne({
            $or: [{ username }, { email }]
        });

        if (existingUser) {
            return res.status(400).json({
                error: existingUser.username === username
                    ? 'Username already exists'
                    : 'Email already exists'
            });
        }

        // Create new user (password will be hashed by pre-save hook)
        const user = await User.create({
            username,
            email,
            password,
            phoneNumber,
            upiId,
            accountType: 'email',
            isVerified: true
        });

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'your-secret-key-change-in-production',
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
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

// Login route with validation
router.post('/login', [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array()[0].msg });
        }

        const { email, password } = req.body;

        // Find user by email and include password field
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Check if user has a password (not OAuth user)
        if (!user.password) {
            return res.status(401).json({ error: 'Please login with Google' });
        }

        // Verify password
        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Update last login
        await user.updateLastLogin();

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'your-secret-key-change-in-production',
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
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

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || 'your-secret-key-change-in-production'
        );
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
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

// Google OAuth Routes
router.get('/google',
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        prompt: 'select_account'
    })
);

router.get('/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/auth/login.html',
        session: true
    }),
    (req, res) => {
        // Generate JWT token for the authenticated user
        const token = jwt.sign(
            { userId: req.user._id },
            process.env.JWT_SECRET || 'your-secret-key-change-in-production',
            { expiresIn: '24h' }
        );

        // Redirect to profile with token in URL (will be stored in localStorage)
        res.redirect(`/profile.html?token=${token}&user=${encodeURIComponent(JSON.stringify({
            id: req.user._id,
            username: req.user.username,
            email: req.user.email
        }))}`);
    }
);

// Check authentication status
router.get('/status', (req, res) => {
    if (req.isAuthenticated && req.isAuthenticated()) {
        res.json({
            isAuthenticated: true,
            user: {
                id: req.user._id,
                username: req.user.username,
                email: req.user.email,
                phoneNumber: req.user.phoneNumber,
                upiId: req.user.upiId
            }
        });
    } else {
        res.json({ isAuthenticated: false });
    }
});

// Logout route
router.post('/logout', (req, res) => {
    if (req.logout) {
        req.logout((err) => {
            if (err) {
                return res.status(500).json({ error: 'Error logging out' });
            }
            res.json({ success: true, message: 'Logged out successfully' });
        });
    } else {
        res.json({ success: true, message: 'Logged out successfully' });
    }
});

module.exports = router;

