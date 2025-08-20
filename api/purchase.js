const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const User = require('../models/User');

// POST /api/purchase
// body: { productId, paymentMethod: 'upi'|'card'|'netbank', txnRef?, cardInfo?, bankInfo? }
router.post('/', async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { productId, paymentMethod, txnRef, cardInfo, bankInfo } = req.body;
    if (!productId) return res.status(400).json({ error: 'productId required' });

    const product = await Product.findById(productId).lean();
    if (!product || product.status !== 'active') return res.status(404).json({ error: 'Product not available' });

    const UserModel = require('../models/User');
    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Price handling
    const price = Number(product.price || 0);

    // Payment verification - for UPI use txnRef (mock verification), for card/netbank accept provided details
    let paymentVerified = false;
    if (paymentMethod === 'upi') {
      // In production, verify txnRef via payment gateway / admin verification.
      if (!txnRef) return res.status(400).json({ error: 'txnRef required for UPI' });
      // Simple mock: accept non-empty txnRef
      paymentVerified = true;
    } else if (paymentMethod === 'card' || paymentMethod === 'netbank') {
      // If user wants to pay using their balance, check if they have sufficient balance
      // or accept card/bank details (mock): require cardInfo or bankInfo or use user's stored bank info
      if (user.balance >= price) {
        user.balance -= price;
        paymentVerified = true;
      } else if (cardInfo || bankInfo) {
        // For demo, accept card/netbank as verified
        paymentVerified = true;
      } else {
        return res.status(400).json({ error: 'Insufficient balance and no card/bank provided' });
      }
    } else {
      return res.status(400).json({ error: 'Invalid paymentMethod' });
    }

    if (!paymentVerified) return res.status(400).json({ error: 'Payment not verified' });

    // Create purchase record on user
    user.purchases = user.purchases || [];
    const purchase = {
      productId: product._id,
      productName: product.name,
      price,
      paymentMethod,
      txnRef: txnRef || null,
      status: 'completed',
      purchasedAt: new Date()
    };
    user.purchases.push(purchase);

    // Add purchase to user's investments
    user.investments = user.investments || [];
    user.investments.push({
      productId: product._id,
      purchaseDate: new Date(),
      price: product.price,
      status: 'active'
    });

    await user.save();

    // Respond with new user balance and purchase
    return res.json({ success: true, purchase, balance: user.balance });
  } catch (err) {
    console.error('Purchase error', err);
    return res.status(500).json({ error: 'Purchase failed' });
  }
});

module.exports = router;