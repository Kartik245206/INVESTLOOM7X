
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');

// Configure multer for image uploads
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// Admin authentication middleware
const adminAuth = (req, res, next) => {
    const adminSecret = req.headers['x-admin-secret'];
    const authHeader = req.headers.authorization;
    
    // Check for admin secret or token
    if (adminSecret === process.env.ADMIN_SECRET || adminSecret === 'admin123') {
        return next();
    }
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        if (token === 'admin-token') {
            return next();
        }
    }
    
    return res.status(401).json({ message: 'Admin authentication required' });
};

// Get all products (admin)
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

// Add new product (admin)
router.post('/products', adminAuth, upload.single('image'), async (req, res) => {
    try {
        const { name, category, price, dailyEarning, description, status } = req.body;
        
        // Validate required fields
        if (!name || !category || !price || !dailyEarning) {
            return res.status(400).json({
                success: false,
                message: 'Name, category, price, and daily earning are required'
            });
        }

        let imageUrl = '';
        
        // Handle image upload
        if (req.file) {
            // Convert buffer to base64
            const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
            imageUrl = base64Image;
        } else if (req.body.image) {
            // Handle base64 image from frontend
            imageUrl = req.body.image;
        }

        const product = new Product({
            name,
            category,
            price: parseFloat(price),
            dailyEarning: parseFloat(dailyEarning),
            description: description || '',
            status: status || 'active',
            image: imageUrl,
            imageUrl: imageUrl // For backward compatibility
        });

        const savedProduct = await product.save();
        
        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            product: savedProduct
        });

    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating product: ' + error.message
        });
    }
});

// Update product (admin)
router.put('/products/:id', adminAuth, upload.single('image'), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, category, price, dailyEarning, description, status } = req.body;
        
        const updateData = {
            name,
            category,
            price: parseFloat(price),
            dailyEarning: parseFloat(dailyEarning),
            description: description || '',
            status: status || 'active'
        };

        // Handle image update
        if (req.file) {
            const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
            updateData.image = base64Image;
            updateData.imageUrl = base64Image;
        } else if (req.body.image) {
            updateData.image = req.body.image;
            updateData.imageUrl = req.body.image;
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            message: 'Product updated successfully',
            product: updatedProduct
        });

    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating product: ' + error.message
        });
    }
});

// Delete product (admin)
router.delete('/products/:id', adminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        
        const deletedProduct = await Product.findByIdAndDelete(id);
        
        if (!deletedProduct) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
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

// Get dashboard stats (admin)
router.get('/stats', adminAuth, async (req, res) => {
    try {
        const totalProducts = await Product.countDocuments();
        const activeProducts = await Product.countDocuments({ status: 'active' });
        const totalUsers = await User.countDocuments();
        
        res.json({
            success: true,
            stats: {
                totalProducts,
                activeProducts,
                totalUsers,
                totalRevenue: 0, // Calculate from transactions if needed
                pendingWithdrawals: 0,
                activeSubscriptions: 0
            }
        });

    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard stats'
        });
    }
});

module.exports = router;
