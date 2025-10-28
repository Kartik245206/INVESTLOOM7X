const express = require('express');
const router = express.Router();
const User = require('./models/User');          // Update path
const Transaction = require('./models/Transaction');  // Update path
const auth = require('./auth-middleware');      // Keep relative to api directory

// Deposit: user submits txnRef + amount (you may mark pending and verify externally)
router.post('/deposit', async (req, res) => {
  try {
    const { amount, txnRef, method } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid amount' });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // For demo: mark deposit completed immediately (real app: verify txnRef)
    user.balance = (user.balance || 0) + Number(amount);
    user.deposits = user.deposits || [];
    user.deposits.push({ amount, txnRef, method, status: 'completed', createdAt: new Date() });

    await user.save();
    res.json({ success: true, balance: user.balance, dailyEarnings: user.dailyEarnings });
  } catch (err) {
    console.error('Deposit error', err);
    res.status(500).json({ error: 'Deposit failed' });
  }
});

// Withdraw: create withdrawal request and deduct balance
router.post('/withdraw', async (req, res) => {
  try {
    const { amount, details } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid amount' });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if ((user.balance || 0) < Number(amount)) return res.status(400).json({ error: 'Insufficient balance' });

    user.balance -= Number(amount);
    user.withdrawals = user.withdrawals || [];
    user.withdrawals.push({ amount, details, status: 'pending', createdAt: new Date() });

    await user.save();
    res.json({ success: true, balance: user.balance });
  } catch (err) {
    console.error('Withdraw error', err);
    res.status(500).json({ error: 'Withdraw failed' });
  }
});

module.exports = router;