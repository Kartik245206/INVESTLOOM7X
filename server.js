require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');

const { connectDB } = require('./config/database');

const app = express();

// Configure CORS
app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://localhost:8000',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:8000',
        'https://investloom7x.onrender.com'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your_session_secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' }
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Security
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));

// Views directory
const VIEWS_DIR = path.join(__dirname, 'templatemo_577_liberty_market', 'templatemo_577_liberty_market');
app.use(express.static(VIEWS_DIR));
app.use('/assets', express.static(path.join(VIEWS_DIR, 'assets')));
app.use('/Host-WEB', express.static(path.join(VIEWS_DIR, 'Host-WEB')));

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Server error' });
});

const startServer = async () => {
    try {
        // Connect to DB
        try {
            await connectDB();
            console.log('Database connected successfully');
        } catch (dbError) {
            console.warn('Dual database connection failed, falling back to single connection...');
            const connectSingleDB = require('./config/db');
            await connectSingleDB();
            console.log('Single database connection established');
        }

        // Load routes
        const authRoutes = require('./api/auth-routes');
        const productRoutes = require('./api/products');
        const purchaseRoutes = require('./api/purchase');
        const transactionRoutes = require('./api/transactions');
        const withdrawRoutes = require('./api/withdraw');
        const adminRoutes = require('./api/admin');

        // Mount routes
        app.use('/api/auth', authRoutes);
        app.use('/api/products', productRoutes);
        app.use('/api/purchase', purchaseRoutes);
        app.use('/api/transactions', transactionRoutes);
        app.use('/api/withdraw', withdrawRoutes);
        app.use('/api/admin', adminRoutes);

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
