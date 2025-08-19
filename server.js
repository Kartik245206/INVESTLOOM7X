const express = require('express');
const cors = require('cors');
const path = require('path');
const Database = require('./api/database');
const connectDB = require('./config/db');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const multer = require('multer');

// Error handling
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    // Ensure we're not leaving the process in an undefined state
    process.exit(1);
});

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
});

// Load environment variables
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const app = express();
const port = process.env.PORT || 3000;

// Connect to database
connectDB(); // <-- added: ensure DB connection at startup

// Use cookie parser
app.use(cookieParser()); // <-- added: parse cookies for auth tokens

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Security Middleware with proper CSP
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
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Body parser with limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// mount auth API
app.use('/api/auth', require('./api/auth'));
app.use('/api/purchase', require('./api/purchase'));

// Serve static files with caching
app.use(express.static(path.join(__dirname, 'templatemo_577_liberty_market/templatemo_577_liberty_market'), {
    maxAge: '1h',
    etag: true,
    lastModified: true
}));

// Serve additional static files
app.use('/assets', express.static(path.join(__dirname, 'templatemo_577_liberty_market/templatemo_577_liberty_market/assets')));
app.use('/vendor', express.static(path.join(__dirname, 'templatemo_577_liberty_market/templatemo_577_liberty_market/vendor')));

// Security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY'); 
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
}); 

// Add rate limiting for security
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // increased limit to 1000 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api', limiter); // Only apply to /api routes, not static files

// Health check route
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Configure multer for image upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'templatemo_577_liberty_market/assets/images/products'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb('Error: Images only!');
        }
    }
});

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'templatemo_577_liberty_market/templatemo_577_liberty_market/index.html'));
});

// Add routes for other HTML pages
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'templatemo_577_liberty_market/templatemo_577_liberty_market/login.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'templatemo_577_liberty_market/templatemo_577_liberty_market/signup.html'));
});

app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, 'templatemo_577_liberty_market/templatemo_577_liberty_market/profile.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'templatemo_577_liberty_market/templatemo_577_liberty_market/Host-WEB/admin_dashboard.html'));
});

// Add admin related routes
app.get('/admin-login', (req, res) => {
    res.sendFile(path.join(__dirname, 'templatemo_577_liberty_market/templatemo_577_liberty_market/Host-WEB/admin_Login_page.html'));
});

app.get('/admin-settings', (req, res) => {
    res.sendFile(path.join(__dirname, 'templatemo_577_liberty_market/templatemo_577_liberty_market/Host-WEB/admin_store_seeting.html'));
});

// Initialize database
const database = new Database();

// API Routes
app.get('/api/products', async (req, res) => {
    try {
        const products = await database.getAllProducts();
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

app.get('/api/products/:id', async (req, res) => {
    try {
        const products = await database.getProducts();
        const product = products.find(p => p.id === parseInt(req.params.id));
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ error: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});

app.post('/api/products', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        const product = {
            name: req.body.name,
            description: req.body.description,
            price: parseFloat(req.body.price),
            image_url: `/assets/images/products/${req.file.filename}`
        };

        const productId = await database.addProduct(product);
        res.json({ 
            success: true, 
            productId,
            message: 'Product added successfully'
        });
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to add product' 
        });
    }
});

// Delete product endpoint
app.delete('/api/products/:id', async (req, res) => {
    try {
        await database.deleteProduct(req.params.id);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ success: false, error: 'Failed to delete product' });
    }
});

// Update product endpoint
app.put('/api/products/:id', upload.single('image'), async (req, res) => {
    try {
        const productId = req.params.id;
        const updates = {
            name: req.body.name,
            category: req.body.category,
            price: parseFloat(req.body.price)
        };

        if (req.file) {
            updates.image_url = `/assets/images/products/${req.file.filename}`;
        }

        await database.updateProduct(productId, updates);
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ success: false, error: 'Failed to update product' });
    }
});

app.post('/api/upload', express.static('public'), (req, res) => {
    // Handle file uploads to assets/images/products
    res.json({ success: true });
});

// Clear Database Route
app.post('/api/clear-database', async (req, res) => {
    try {
        await database.clearDatabase(); // Add this method to your Database class
        res.json({ success: true, message: 'Database cleared successfully' });
    } catch (error) {
        console.error('Failed to clear database:', error);
        res.status(500).json({ success: false, error: 'Failed to clear database' });
    }
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    console.error('Stack:', err.stack);
    res.status(500).json({ 
        error: NODE_ENV === 'production' ? 'Internal Server Error' : err.message 
    });
});

// Handle 404
app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
});

// Process handling
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    
    // Create data directory if it doesn't exist
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
});
