const jwt = require('jsonwebtoken');
const { User } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? '' : 'development-only-jwt-secret-change-me');
if (!JWT_SECRET) throw new Error('JWT_SECRET is required in production');

// Middleware to authenticate any logged-in user
async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required. Please sign in.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findOne({ id: decoded.id });
    if (!user) {
      return res.status(401).json({ error: 'User account not found or session revoked.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid, expired, or malformed authentication token.' });
  }
}

// Middleware to strictly enforce Admin privileges
async function requireAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Admin authentication required.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin privileges required.' });
    }

    const user = await User.findOne({ id: decoded.id });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin privileges required.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired admin session.' });
  }
}

module.exports = {
  authenticateToken,
  requireAdmin
};
