const jwt = require('jsonwebtoken');
require('dotenv').config();

const adminAuth = (req, res, next) => {
    try {
        // Check admin token
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Check if user is admin
        if (!decoded.isAdmin) {
            return res.status(403).json({ message: 'Not authorized as admin' });
        }

        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

module.exports = adminAuth;