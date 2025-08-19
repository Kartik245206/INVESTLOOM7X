const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const auth = require('./middleware/auth'); // protect admin routes if needed

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