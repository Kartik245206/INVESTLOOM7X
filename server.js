require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

// Add this line before connecting to MongoDB
mongoose.set('strictQuery', false);

const app = express();

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Security configuration
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'", "*"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "*"],
            styleSrc: ["'self'", "'unsafe-inline'", "*"],
            imgSrc: ["'self'", "data:", "https:", "*"],
            connectSrc: ["'self'", "*"],
            fontSrc: ["'self'", "*"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'", "*"],
            frameSrc: ["'self'", "*"],
        },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false
}));

// Enable CORS
app.use(cors({
    origin: ['http://localhost:8000', 'https://investloom7x.onrender.com'],
    credentials: true
}));

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
    while (retries > 0) {
        try {
            await mongoose.connect(process.env.MONGODB_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                serverSelectionTimeoutMS: 5000
            });
            console.log('✅ MongoDB Connected Successfully');
            
            // Load models AFTER connection
            const models = {
                User: require('./api/models/User'),
                Product: require('./api/models/Product'),
                Transaction: require('./api/models/Transaction')
            };
            
            console.log('✅ Models loaded successfully:', Object.keys(models));
            
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
const VIEWS_DIR = path.join(__dirname, 'templatemo_577_liberty_market', 'templatemo_577_liberty_market');

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// CORS configuration
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = NODE_ENV === 'production' 
            ? ['https://investloom7x.onrender.com'] 
            : ['http://localhost:3000', 'http://127.0.0.1:3000'];
        
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(null, true); // Allow all origins for now
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-secret']
};

app.use(cors({
    origin: ['http://localhost:3000', 'https://investloom7x.onrender.com'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(cookieParser());

// Security headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https:"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https://investloom7x.onrender.com"],
            fontSrc: ["'self'", "https:"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'self'"],
        }
    }
}));

// Serve static files
app.use(express.static(VIEWS_DIR));
app.use('/assets', express.static(path.join(VIEWS_DIR, 'assets')));
app.use('/Host-WEB', express.static(path.join(VIEWS_DIR, 'Host-WEB')));

console.log('📁 Serving static files from:', VIEWS_DIR);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        environment: NODE_ENV
    });
});

// Debug endpoint to check models
app.get('/api/debug', async (req, res) => {
    try {
        const Product = mongoose.model('Product');
        const productCount = await Product.countDocuments();
        
        res.json({
            success: true,
            mongodb: {
                connected: mongoose.connection.readyState === 1,
                state: mongoose.connection.readyState,
                host: mongoose.connection.host,
                name: mongoose.connection.name
            },
            models: {
                loaded: Object.keys(mongoose.models),
                Product: !!mongoose.models.Product,
                User: !!mongoose.models.User,
                Transaction: !!mongoose.models.Transaction
            },
            products: {
                count: productCount
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            stack: error.stack
        });
    }
});

// Add this debug endpoint to check MongoDB status
app.get('/api/health', async (req, res) => {
    try {
        const mongoose = require('mongoose');
        const Product = mongoose.model('Product');
        
        const dbStatus = {
            connected: mongoose.connection.readyState === 1,
            state: mongoose.connection.readyState,
            host: mongoose.connection.host,
            name: mongoose.connection.name
        };
        
        const productCount = await Product.countDocuments();
        
        res.json({
            success: true,
            database: dbStatus,
            products: {
                count: productCount
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Initialize and start server
(async () => {
    try {
        // Connect to database first
        await connectDB();
        
        // Import routers AFTER database connection and models are loaded
        const productsRouter = require('./api/products');    // Matches your actual products.js file
        const adminRouter = require('./api/admin');
        const purchaseRouter = require('./api/purchase');
        const authRouter = require('./api/auth');
        const transactionsRouter = require('./api/transactions');
        const withdrawRouter = require('./api/withdraw');
        
        // API Routes - Mount before static files
        app.use('/api/auth', authRouter);
        app.use('/api/admin', adminRouter);
        app.use('/api/products', productsRouter);
        app.use('/api/transactions', transactionsRouter);
        app.use('/api/purchase', purchaseRouter);
        app.use('/api/withdraw', withdrawRouter);
        
        console.log('✅ API routes mounted successfully');
        
        // Add a specific health check endpoint
        app.get('/api/ping', (req, res) => {
            res.json({ status: 'ok', timestamp: new Date().toISOString() });
        });
        
        // Static files serving
        app.use(express.static(VIEWS_DIR));
        
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
            console.error('Server error:', err);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: process.env.NODE_ENV === 'development' ? err.message : undefined
            });
        });
        
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
