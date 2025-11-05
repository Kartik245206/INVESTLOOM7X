const express = require('express');
const router = express.Router();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('./models/User');

// Initialize passport
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Check if user already exists
        let user = await User.findOne({ googleId: profile.id });
        
        if (!user) {
            // Create new user if doesn't exist
            user = await User.create({
                googleId: profile.id,
                username: profile.displayName.replace(/\s+/g, '').toLowerCase() + Math.random().toString(36).slice(2, 6),
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

// Google Auth Routes
router.get('/google',
    passport.authenticate('google', { 
        scope: ['profile', 'email'],
        prompt: 'select_account' // Always show account selection
    })
);

router.get('/google/callback',
    passport.authenticate('google', { 
        failureRedirect: '/templatemo_577_liberty_market/auth/login.html',
        session: true
    }),
    (req, res) => {
        res.redirect('/profile.html');
    }
);

// Check Authentication Status
router.get('/status', (req, res) => {
    if (req.isAuthenticated()) {
        res.json({
            isAuthenticated: true,
            user: {
                id: req.user._id,
                username: req.user.username,
                phoneNumber: req.user.phoneNumber,
                upiId: req.user.upiId
            }
        });
    } else {
        res.json({ isAuthenticated: false });
    }
});

// Logout Route
router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

module.exports = router;