const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Product = require('./models/Product');

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../templatemo_577_liberty_market/assets/images/products');
        
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

// Admin authentication middleware
const adminAuth = (req, res, next) => {
    const adminSecret = req.headers['x-admin-secret'];
    const token = req.headers['authorization']?.split(' ')[1];
    
    if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
        return res.status(403).json({ 
            success: false, 
            message: 'Unauthorized access' 
        });
    }
    
    next();
};

// Get all products (admin view)
router.get('/products', adminAuth, async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json({
            success: true,
            products: products
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching products'
        });
    }
});

// Add new product with image upload
router.post('/products', adminAuth, upload.single('productImage'), async (req, res) => {
    try {
        console.log('[admin.addProduct] Request body:', req.body);
        
        const productData = {
            name: req.body.name,
            category: req.body.category,
            price: parseFloat(req.body.price),
            dailyEarning: parseFloat(req.body.dailyEarning),
            duration: parseInt(req.body.duration) || 100,
            description: req.body.description,
            imageUrl: req.file ? `/uploads/${req.file.filename}` : 'assets/images/default-product.jpg',
            isActive: true,
            createdAt: new Date()
        };

        console.log('[admin.addProduct] Creating product:', productData);
        
        const product = await Product.create(productData);
        
        console.log('[admin.addProduct] Product created:', product);
        
        res.json({
            success: true,
            product: product
        });
    } catch (error) {
        console.error('[admin.addProduct] Error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create product',
            message: error.message
        });
    }
});

// Update product
router.put('/products/:id', adminAuth, upload.single('productImage'), async (req, res) => {
    try {
        const { name, category, price, dailyEarning, description, imageUrl } = req.body;
        
        const updateData = {
            name,
            category,
            price: Number(price),
            dailyEarning: Number(dailyEarning),
            description
        };
        
        // Handle image update
        if (req.file) {
            updateData.imageUrl = `assets/images/products/${req.file.filename}`;
        } else if (imageUrl) {
            updateData.imageUrl = imageUrl;
        }
        
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Product updated successfully',
            product: product
        });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating product: ' + error.message
        });
    }
});

// Delete product
router.delete('/products/:id', adminAuth, async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        // Delete image file if it exists
        if (product.imageUrl && product.imageUrl.includes('products/')) {
            const imagePath = path.join(__dirname, '../templatemo_577_liberty_market', product.imageUrl);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }
        
        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting product: ' + error.message
        });
    }
});

module.exports = router;
