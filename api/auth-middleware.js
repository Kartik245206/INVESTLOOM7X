const jwt = require('jsonwebtoken');
const User = require('./models/User');

module.exports = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get user
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        // Attach user to request
        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ error: 'Invalid token' });
    }
};
