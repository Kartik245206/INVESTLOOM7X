require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

// Load environment variables
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

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

// Initialize DB and start server
(async () => {
    try {
        await connectDB();
        
        // Initialize Express middleware
        app.use(cookieParser());
        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));
        
        // Security Middleware
        app.use(helmet({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https:", "http:"],
                    styleSrc: ["'self'", "'unsafe-inline'", "https:", "http:"],
                    imgSrc: ["'self'", "data:", "https:", "http:", "*"],
                    connectSrc: ["'self'", "https:", "http:", "*"],
                    fontSrc: ["'self'", "https:", "http:", "data:", "*"],
                    objectSrc: ["'none'"],
                    mediaSrc: ["'self'", "*"],
                    frameSrc: ["'self'", "*"],
                },
            },
            crossOriginEmbedderPolicy: false,
            crossOriginResourcePolicy: false
        }));

        // CORS configuration
        const allowedOrigins = [
            'https://investloom7x.onrender.com',
            'http://localhost:3000',
            'http://127.0.0.1:3000'
        ];

        app.use(cors({
            origin: function(origin, callback) {
                if (!origin || allowedOrigins.includes(origin)) {
                    callback(null, true);
                } else {
                    callback(new Error('Not allowed by CORS'));
                }
            },
            credentials: true
        }));

        // Import auth middleware
        const { requireAuth } = require('./api/auth-middleware');

        // API Routes
        app.use('/api/auth', require('./api/auth'));
        app.use('/api/purchase', requireAuth, require('./api/purchase'));
        app.use('/api/transactions', requireAuth, require('./api/transactions'));
        app.use('/api/withdraw', requireAuth, require('./api/withdraw'));

        // Serve static files with debug logging
        app.use((req, res, next) => {
            console.log('Static file request:', req.url);
            next();
        }, express.static(VIEWS_DIR));

        // Route handlers with consistent path handling
        const sendView = (fileName) => (req, res) => {
            const filePath = path.join(VIEWS_DIR, fileName);
            console.log(`Serving view: ${filePath}`);
            res.sendFile(filePath);
        };

        // Define routes
        app.get('/', sendView('index.html'));
        app.get('/login', sendView('login.html'));
        app.get('/signup', sendView('signup.html'));
        app.get('/profile', sendView('profile.html'));
        app.get('/details/:id', sendView('details.html'));

        // Health check endpoint
        app.get('/health', (req, res) => {
            res.json({
                status: 'ok',
                mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
                viewsPath: VIEWS_DIR
            });
        });

        // 404 handler
        app.use((req, res) => {
            console.log('404 for path:', req.path);
            res.status(404).json({ 
                error: 'Not Found',
                path: req.path,
                requestedFile: path.join(VIEWS_DIR, req.path)
            });
        });

        // Error Handlers
        app.use((err, req, res, next) => {
            console.error('Error details:', {
                message: err.message,
                stack: err.stack,
                path: req.path,
                method: req.method
            });
            
            res.status(500).json({
                error: NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
                path: req.path
            });
        });

        // Start server with enhanced logging
        const server = app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
            console.log('Static files served from:', VIEWS_DIR);
        });

        // Graceful shutdown
        process.on('SIGTERM', () => {
            console.log('SIGTERM received...');
            server.close(() => {
                console.log('Server closed');
                mongoose.connection.close(false, () => {
                    console.log('MongoDB connection closed');
                    process.exit(0);
                });
            });
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
