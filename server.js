require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const connectDB = require('./config/db');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const { apiLimiter } = require('./middleware/security');

const app = express();

// Trust proxy - important for rate limiting behind reverse proxies
app.set('trust proxy', 1);

// HTTPS redirect for production
if (process.env.NODE_ENV === 'production') {
    app.use((req, res, next) => {
        if (req.header('x-forwarded-proto') !== 'https') {
            res.redirect(`https://${req.header('host')}${req.url}`);
        } else {
            next();
        }
    });
}


// Security headers with Helmet - COMPREHENSIVE CONFIGURATION
app.use(helmet({
    // Enable comprehensive Content Security Policy
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: [
                "'self'",
                "https://cdn.jsdelivr.net",
                "https://cdnjs.cloudflare.com"
            ],
            styleSrc: [
                "'self'",
                "'unsafe-inline'",  // Required for inline styles
                "https://cdn.jsdelivr.net",
                "https://cdnjs.cloudflare.com"
            ],
            imgSrc: ["'self'", "data:", "https:"],
            fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
            connectSrc: ["'self'"],
            frameSrc: ["'none'"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: []
        }
    },

    // HTTP Strict Transport Security
    hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true
    },

    // Referrer Policy
    referrerPolicy: {
        policy: 'strict-origin-when-cross-origin'
    },

    // Frame protection
    frameguard: {
        action: 'deny'
    },

    // Additional security headers
    noSniff: true,
    xssFilter: true,
    dnsPrefetchControl: true,
    ieNoOpen: true,
    hidePoweredBy: true
}));

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:8080', 'http://localhost:4000'];

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Session configuration (required for passport)
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-session-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Security middleware
app.use(mongoSanitize()); // Prevent NoSQL injection
app.use(hpp()); // Prevent HTTP Parameter Pollution

// Apply rate limiting to all API routes
app.use('/api/', apiLimiter);

// Views directory
const VIEWS_DIR = path.join(__dirname, 'templatemo_577_liberty_market', 'templatemo_577_liberty_market');
app.use(express.static(VIEWS_DIR));
app.use('/assets', express.static(path.join(VIEWS_DIR, 'assets')));
app.use('/Host-WEB', express.static(path.join(VIEWS_DIR, 'Host-WEB')));

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);

    // Don't leak error details in production
    if (process.env.NODE_ENV === 'production') {
        res.status(500).json({ error: 'Server error' });
    } else {
        res.status(500).json({ error: err.message, stack: err.stack });
    }
});

const startServer = async () => {
    try {
        // Connect to DB
        await connectDB();
        console.log('Single database connection established');

        // Load routes
        const authRoutes = require('./api/auth-routes');
        const productRoutes = require('./api/products');
        const purchaseRoutes = require('./api/purchase');
        const transactionRoutes = require('./api/transactions');
        const withdrawRoutes = require('./api/withdraw');


        // Mount routes
        app.use('/api/auth', authRoutes);
        app.use('/api/products', productRoutes);
        app.use('/api/purchase', purchaseRoutes);
        app.use('/api/transactions', transactionRoutes);
        app.use('/api/withdraw', withdrawRoutes);


        // Start server
        const PORT = process.env.PORT || 4000;
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Start the server
startServer();
