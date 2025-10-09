require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

// Load models FIRST
require('./models/User');
require('./models/Product');
require('./models/Transaction');

// Import routers
const productsRouter = require('./api/products');
const adminRouter = require('./api/admin');
const purchaseRouter = require('./api/purchase');
const authRouter = require('./api/auth');
const transactionsRouter = require('./api/transactions');
const withdrawRouter = require('./api/withdraw');

const app = express();

// Environment variables
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Debug: Check environment variables
console.log('🔍 Environment Check:', {
    ADMIN_SECRET: process.env.ADMIN_SECRET ? '✓' : '✗',
    JWT_SECRET: process.env.JWT_SECRET ? '✓' : '✗',
    ADMIN_USERNAME: process.env.ADMIN_USERNAME ? '✓' : '✗',
    MONGODB_URI: process.env.MONGODB_URI ? '✓' : '✗',
    NODE_ENV: NODE_ENV,
    PORT: PORT
});

// Database connection with retry logic
async function connectDB(retries = 5) {
    while (retries) {
        try {
            await mongoose.connect(process.env.MONGODB_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                serverSelectionTimeoutMS: 5000
            });
            console.log('✅ MongoDB Connected Successfully');
            return true;
        } catch (err) {
            console.error(`❌ MongoDB connection error (${retries} retries left):`, err.message);
            retries -= 1;
            if (!retries) {
                console.error('💀 Failed to connect to MongoDB after all retries');
                process.exit(1);
            }
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
    return false;
}

// Views directory
const VIEWS_DIR = path.join(__dirname, 'templatemo_577_liberty_market');

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// CORS configuration
const corsOptions = {
    origin: NODE_ENV === 'production' 
        ? ['https://investloom7x.onrender.com'] 
        : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-secret']
};

app.use(cors(corsOptions));

// Security headers
app.use(helmet({
    contentSecurityPolicy: NODE_ENV === 'production' ? undefined : false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cookieParser());

// Serve static files
app.use(express.static(VIEWS_DIR));
app.use('/assets', express.static(path.join(VIEWS_DIR, 'assets')));
app.use('/Host-WEB', express.static(path.join(VIEWS_DIR, 'Host-WEB')));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// API Routes - Mount these BEFORE the catch-all route
app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/purchase', purchaseRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/withdraw', withdrawRouter);

// Root route
app.get('/', (req, res) => {
    res.sendFile(path.join(VIEWS_DIR, 'index.html'));
});

// Catch-all route for HTML pages (must be AFTER API routes)
app.get('*', (req, res) => {
    const filePath = path.join(VIEWS_DIR, req.path);
    
    // Check if file exists
    if (require('fs').existsSync(filePath) && filePath.endsWith('.html')) {
        res.sendFile(filePath);
    } else {
        res.status(404).sendFile(path.join(VIEWS_DIR, 'index.html'));
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.stack);
    res.status(err.status || 500).json({
        success: false,
        error: NODE_ENV === 'production' ? 'Internal server error' : err.message
    });
});

// Initialize and start server
(async () => {
    try {
        // Connect to database
        await connectDB();
        
        // Start server
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`🌍 Environment: ${NODE_ENV}`);
            console.log(`📁 Views directory: ${VIEWS_DIR}`);
            console.log(`🔗 API Base: ${NODE_ENV === 'production' ? 'https://investloom7x.onrender.com' : `http://localhost:${PORT}`}`);
        });
    } catch (error) {
        console.error('💀 Failed to start server:', error);
        process.exit(1);
    }
})();

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('👋 SIGTERM received, closing server gracefully');
    mongoose.connection.close();
    process.exit(0);
});
