const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const auth = require('./middleware/auth'); // protect admin routes if needed

// Authentication Functions
const adminAuth = {
    checkAdminAuth() {
        const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
        const adminSecret = localStorage.getItem('ADMIN_SECRET');
        const adminPhone = localStorage.getItem('adminPhone');
        
        // Check all required credentials
        if (!isLoggedIn || !adminSecret || adminPhone !== '7417915397') {
            this.clearAdminSession();
            return false;
        }
        return true;
    },

    clearAdminSession() {
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('ADMIN_SECRET');
        localStorage.removeItem('adminPhone');
        window.location.replace('admin_Login_page.html');
    },

    logout() {
        this.clearAdminSession();
    }
};

// Check authentication on admin pages
if (window.location.pathname.includes('admin_dashboard.html')) {
    if (!adminAuth.checkAdminAuth()) {
        console.log('Unauthorized access attempt');
    }
}

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

module.exports = function auth(req, res, next) {
  const token = req.cookies?.token || (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Public: get published products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({ status: 'active' }).sort({ createdAt: -1 }).lean();
    res.json(products);
  } catch (err) {
    console.error('Products GET err', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Admin create/update/delete (protect with auth, add admin check in real app)
router.post('/', auth, async (req, res) => {
  try {
    const p = await Product.create(req.body);
    res.json(p);
  } catch (err) {
    console.error('Products POST err', err);
    res.status(500).json({ error: 'Create failed' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Delete failed' });
  }
});

module.exports = router;

