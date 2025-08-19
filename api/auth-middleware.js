const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

module.exports = function (req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const tokenFromHeader = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    const token = req.cookies?.token || tokenFromHeader || req.body?.token || req.query?.token;
    if (!token) return res.status(401).json({ error: 'Unauthorized: no token' });

    const payload = jwt.verify(token, JWT_SECRET);
    // attach basic user info for downstream handlers
    req.user = payload;
    return next();
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};