const jwt = require('jsonwebtoken');
const { User } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? '' : 'development-only-jwt-secret-change-me');
if (!JWT_SECRET) throw new Error('JWT_SECRET is required in production');

/**
 * Attaches req.user if a valid Bearer JWT is present; otherwise continues with req.user = null.
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }
  const token = authHeader.split(' ')[1];
  try {
    req.user = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    req.user = null;
  }
  next();
}

/**
 * Requires a valid Bearer JWT (customer or admin).
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }
  const token = authHeader.split(' ')[1];
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired session token. Please sign in again.' });
  }
}

/**
 * Requires a valid Bearer JWT with role === 'admin' and active database status.
 */
async function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Admin authentication required.' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required.' });
    }

    try {
      const activeUser = await User.findOne({ id: decoded.id });
      if (!activeUser || activeUser.role !== 'admin' || activeUser.active === false) {
        return res.status(403).json({ error: 'Forbidden: Admin account is inactive or revoked.' });
      }
    } catch (dbErr) {
      console.warn('DB check in requireAdmin warning:', dbErr.message);
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired admin token.' });
  }
}

module.exports = {
  optionalAuth,
  requireAuth,
  requireAdmin
};
