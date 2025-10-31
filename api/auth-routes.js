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

// Registration endpoint
router.post('/register', registerLimiter, validateRegistration, async (req, res) => {
    try {
        // Validate request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, username, password, firstName, lastName, phone } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return res.status(400).json({
                error: 'User already exists with this email or username'
            });
        }

        // Create new user
        const user = new User({
            email,
            username,
            password,
            firstName,
            lastName,
            phone
        });

        // Generate email verification token
        const verificationToken = user.generateEmailVerificationToken();

        // Save user
        await user.save();

        // Send verification email
        const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
        await transporter.sendMail({
            to: user.email,
            subject: 'Verify your email address',
            html: `Please click <a href="${verificationUrl}">here</a> to verify your email address.`
        });

        // Generate JWT
        const token = generateToken(user);

        res.status(201).json({
            message: 'Registration successful. Please verify your email.',
            token,
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error during registration' });
    }
});

// Login endpoint
router.post('/login', loginLimiter, validateLogin, async (req, res) => {
    try {
        // Validate request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check if account is locked
        if (user.isAccountLocked()) {
            const waitTime = Math.ceil((user.lockUntil - Date.now()) / 1000 / 60);
            return res.status(423).json({
                error: `Account is locked. Please try again after ${waitTime} minutes`
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            await user.incrementLoginAttempts();
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Reset login attempts on successful login
        await user.resetLoginAttempts();

        // Update last login
        user.lastLogin = Date.now();
        await user.save();

        // Generate JWT
        const token = generateToken(user);

        res.json({
            token,
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                isEmailVerified: user.isEmailVerified
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
});

// Email verification endpoint
router.get('/verify-email/:token', async (req, res) => {
    try {
        const user = await User.findOne({
            emailVerificationToken: req.params.token,
            emailVerificationExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                error: 'Invalid or expired verification token'
            });
        }

        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save();

        res.json({ message: 'Email verified successfully' });
    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({ error: 'Server error during email verification' });
    }
});

// Password reset request endpoint
router.post('/forgot-password', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const resetToken = user.generatePasswordResetToken();
        await user.save();

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
        await transporter.sendMail({
            to: user.email,
            subject: 'Password Reset Request',
            html: `Please click <a href="${resetUrl}">here</a> to reset your password. This link will expire in 1 hour.`
        });

        res.json({ message: 'Password reset email sent' });
    } catch (error) {
        console.error('Password reset request error:', error);
        res.status(500).json({ error: 'Server error during password reset request' });
    }
});

// Password reset endpoint
router.post('/reset-password/:token', async (req, res) => {
    try {
        const user = await User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                error: 'Invalid or expired password reset token'
            });
        }

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ message: 'Password reset successful' });
    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({ error: 'Server error during password reset' });
    }
});

// Logout endpoint (optional, since JWT is stateless)
router.post('/logout', (req, res) => {
    res.json({ message: 'Logged out successfully' });
});

module.exports = router;