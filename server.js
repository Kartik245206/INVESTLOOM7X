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

// Initialize DB and start server
(async () => {
    try {
        await connectDB();
        
        // Middleware
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
        app.use(cors({
            origin: process.env.NODE_ENV === 'production' 
                ? ['https://investloom7x.onrender.com'] 
                : ['http://localhost:3000'],
            credentials: true
        }));

        // Import auth middleware
        const { requireAuth } = require('./api/auth-middleware');

        // API Routes
        app.use('/api/auth', require('./api/auth'));
        app.use('/api/purchase', requireAuth, require('./api/purchase'));
        app.use('/api/transactions', requireAuth, require('./api/transactions'));
        app.use('/api/withdraw', requireAuth, require('./api/withdraw'));

        // Serve static files
        app.use(express.static(path.join(__dirname, 'templatemo_577_liberty_market/templatemo_577_liberty_market')));

        // Main routes
        app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, 'templatemo_577_liberty_market/templatemo_577_liberty_market/index.html'));
        });

        app.get('/login', (req, res) => {
            res.sendFile(path.join(__dirname, 'templatemo_577_liberty_market/templatemo_577_liberty_market/login.html'));
        });

        app.get('/signup', (req, res) => {
            res.sendFile(path.join(__dirname, 'templatemo_577_liberty_market/templatemo_577_liberty_market/signup.html'));
        });

        app.get('/profile', (req, res) => {
            res.sendFile(path.join(__dirname, 'templatemo_577_liberty_market/templatemo_577_liberty_market/profile.html'));
        });

        app.get('/details/:id', (req, res) => {
            res.sendFile(path.join(__dirname, 'templatemo_577_liberty_market/templatemo_577_liberty_market/details.html'));
        });

        // Health check endpoint
        app.get('/health', (req, res) => {
            res.json({
                status: 'ok',
                mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
            });
        });

        // Error handling
        app.use((err, req, res, next) => {
            console.error('Error:', err.stack);
            res.status(500).json({
                error: NODE_ENV === 'production' ? 'Internal Server Error' : err.message
            });
        });

        // Handle 404
        app.use((req, res) => {
            res.status(404).json({ error: 'Not Found' });
        });

        // Graceful shutdown handling
        process.on('SIGTERM', async () => {
            console.log('SIGTERM received, shutting down...');
            await mongoose.connection.close();
            process.exit(0);
        });

        process.on('unhandledRejection', (err) => {
            console.error('Unhandled Rejection:', err);
        });

        // Start server only after successful DB connection
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error('Startup error:', err);
        process.exit(1);
    }
})();
