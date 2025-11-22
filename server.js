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

const app = express();

// Enable CORS for all routes
const corsOptions = {
    origin: 'http://localhost:8080',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
app.use(cors(corsOptions));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Security
// app.use(helmet({
//     contentSecurityPolicy: false,
//     crossOriginEmbedderPolicy: false
// }));

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
