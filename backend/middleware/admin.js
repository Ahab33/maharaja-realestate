module.exports = function(req, res, next) {
    // Make sure auth middleware ran first
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    if (!req.user.isAdmin) {
        return res.status(403).json({ message: 'Forbidden: Admins only' });
    }

    next();
};

