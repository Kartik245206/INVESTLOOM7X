require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

// Import routers
const productsRouter = require('./api/products');
const adminRouter = require('./api/admin');
const purchaseRouter = require('./api/purchase');
const authRouter = require('./api/auth');
const transactionsRouter = require('./api/transactions');
const withdrawRouter = require('./api/withdraw');

// Load models
require('./models/User');
require('./models/Product');
require('./models/Transaction');

// Load environment variables
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Debug: Check if credentials are loaded
console.log('Environment variables loaded:', {
    ADMIN_SECRET: process.env.ADMIN_SECRET ? '✓' : '✗',
    JWT_SECRET: process.env.JWT_SECRET ? '✓' : '✗',
    ADMIN_USERNAME: process.env.ADMIN_USERNAME ? '✓' : '✗',
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ? '✓' : '✗',
    MONGODB_URI: process.env.MONGODB_URI ? '✓' : '✗'
});

const app = express();

// Database connection function with retries
async function connectDB(retries = 5) {
    while (retries) {
        try {
            await mongoose.connect(process.env.MONGODB_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                serverSelectionTimeoutMS: 5000
            });
            console.log('✓ MongoDB Connected Successfully');
            return true;
        } catch (err) {
            console.error(`MongoDB connection error (${retries} retries left):`, err.message);
            retries -= 1;
            if (!retries) {
                console.error('✗ Failed to connect to MongoDB after all retries');
                process.exit(1);
            }
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
    return false;
}

// Define base directory
const VIEWS_DIR = path.join(__dirname, 'templatemo_577_liberty_market');

// Debug log for paths
console.log('Views directory:', VIEWS_DIR);
console.log('Directory exists:', require('fs').existsSync(VIEWS_DIR));

// Initialize DB and start server
(async () => {
    try {
        // Connect to database first
        await connectDB();
        
        // Middleware
        app.use(express.json({ limit: '50mb' }));
        app.use(express.urlencoded({ extended: true, limit: '50mb' }));
        
        // CORS configuration
        app.use(cors({
            origin: NODE_ENV === 'production' 
                ? ['https://investloom7x.onrender.com'] 
                : ['http://localhost:3000', 'http://127.0.0.1:3000'],
            credentials: true
        }));
        
        // Security headers
        app.use(helmet({
            contentSecurityPolicy: NODE_ENV === 'production' ? undefined : false,
            crossOriginEmbedderPolicy: false
        }));
        
        app.use(cookieParser());

        // Serve static files
        app.use(express.static(VIEWS_DIR));
        app.use('/assets', express.static(path.join(VIEWS_DIR, 'assets')));
        app.use('/Host-WEB', express.static(path.join(VIEWS_DIR, 'Host-WEB')));

        // API Routes - Mount once only
        app.use('/api/auth', authRouter);
        app.use('/api/products', productsRouter);
        app.use('/api/purchase', purchaseRouter);
        app.use('/api/transactions', transactionsRouter);
        app.use('/api/withdraw', withdrawRouter);
        app.use('/api/admin', adminRouter);

        // Health check endpoint
        app.get('/api/health', (req, res) => {
            res.json({ 
                status: 'ok', 
                environment: NODE_ENV,
                timestamp: new Date().toISOString()
            });
        });

        // Serve HTML pages
        app.get('/', (req, res) => {
            res.sendFile(path.join(VIEWS_DIR, 'index.html'));
        });

        app.get('/admin', (req, res) => {
            res.sendFile(path.join(VIEWS_DIR, 'Host-WEB', 'admin_dashboard.html'));
        });

        // Handle 404 for API routes
        app.use('/api/*', (req, res) => {
            res.status(404).json({ 
                success: false,
                error: 'API endpoint not found',
                path: req.originalUrl 
            });
        });

        // Catch-all route - serve index.html for client-side routing
        app.get('*', (req, res) => {
            res.sendFile(path.join(VIEWS_DIR, 'index.html'));
        });

        // Start server
        app.listen(PORT, '0.0.0.0', () => {
            console.log('=================================');
            console.log(`✓ Server running on port ${PORT}`);
            console.log(`✓ Environment: ${NODE_ENV}`);
            console.log(`✓ URL: ${NODE_ENV === 'production' ? 'https://investloom7x.onrender.com' : `http://localhost:${PORT}`}`);
            console.log('=================================');
        });

    } catch (err) {
        console.error('✗ Failed to start server:', err);
        process.exit(1);
    }
})();

// Error handling for uncaught errors
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    process.exit(1);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, closing server gracefully...');
    mongoose.connection.close(false, () => {
        console.log('MongoDB connection closed');
        process.exit(0);
    });
});
