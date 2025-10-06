require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const purchaseRouter = require('./api/purchase');

// Load models in correct order
require('./models/User');
require('./models/Product');
require('./models/Transaction');

// Load environment variables
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Debug: Check if admin credentials are loaded
console.log('Admin credentials loaded:', {
    ADMIN_SECRET: process.env.ADMIN_SECRET ? '✓' : '✗',
    JWT_SECRET: process.env.JWT_SECRET ? '✓' : '✗',
    ADMIN_USERNAME: process.env.ADMIN_USERNAME ? '✓' : '✗',
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ? '✓' : '✗'
});

const app = express();

// Single database connection function with retries
async function connectDB(retries = 5) {
    while (retries) {
        try {
            await mongoose.connect(process.env.MONGODB_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                serverSelectionTimeoutMS: 5000
            });
            console.log('MongoDB Connected');
            return true;
        } catch (err) {
            console.error(`MongoDB connection error (${retries} retries left):`, err);
            retries -= 1;
            if (!retries) {
                console.error('Failed to connect to MongoDB after all retries');
                process.exit(1);
            }
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
    return false;
}

// Define base directory for views
const VIEWS_DIR = path.join(__dirname, 'templatemo_577_liberty_market', 'templatemo_577_liberty_market');

// Debug log for paths
console.log('Views directory:', VIEWS_DIR);
console.log('Directory exists:', require('fs').existsSync(VIEWS_DIR));

// Import the products router
const productsRouter = require('./api/products');
const adminRouter = require('./api/admin');

// Initialize DB and start server
(async () => {
    try {
        await connectDB();
        
        app.use(express.json({ limit: '50mb' }));
        app.use(express.urlencoded({ extended: true }));
        app.use(cors());
        app.use(helmet({
            contentSecurityPolicy: false,  // For development only
        }));
        app.use(cookieParser());

        // Serve static files from the template directory
        app.use('/', express.static(path.join(__dirname, 'templatemo_577_liberty_market', 'templatemo_577_liberty_market')));
        app.use('/Host-WEB', express.static(path.join(__dirname, 'templatemo_577_liberty_market', 'templatemo_577_liberty_market', 'Host-WEB')));

        // Add route for root path
        app.get('/', (req, res) => {
            res.sendFile(path.join(VIEWS_DIR, 'index.html'));
        });

        // Add route for admin path
        app.get('/admin', (req, res) => {
            res.sendFile(path.join(VIEWS_DIR, 'Host-WEB', 'admin_dashboard.html'));
        });

        // API routes
        app.use('/api/auth', require('./api/auth'));
        app.use('/api/products', productsRouter);
        app.use('/api/purchase', require('./api/purchase'));
        app.use('/api/transactions', require('./api/transactions'));
        app.use('/api/withdraw', require('./api/withdraw'));
        app.use('/api/admin', adminRouter);

        // Handle 404 for API routes
        app.use('/api/*', (req, res) => {
            res.status(404).json({ error: 'API endpoint not found' });
        });

        // Handle all other routes by serving index.html
        app.get('*', (req, res) => {
            res.sendFile(path.join(VIEWS_DIR, 'index.html'));
        });

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
})();

// Add basic error handling for uncaught errors
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
});
