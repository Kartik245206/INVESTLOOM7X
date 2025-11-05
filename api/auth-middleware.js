// Auth middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ error: 'Not authenticated' });
}

// Auth middleware to handle API responses
function checkAuth(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.status(401).json({
            isAuthenticated: false,
            message: 'User not authenticated'
        });
    }
}

module.exports = {
    isAuthenticated,
    checkAuth
};