const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorised — no token' });
  }
  try {
    const decoded = jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) return res.status(401).json({ message: 'User not found' });
    next();
  } catch {
    res.status(401).json({ message: 'Token invalid or expired' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Ensure user has completed profile (roll number and phone)
const requireVerifiedProfile = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Not authorised' });
  if (!req.user.rollNumber || !req.user.phone) {
    return res.status(400).json({ message: 'Complete profile (roll number and phone) before placing orders' });
  }
  next();
};

module.exports = { protect, adminOnly, requireVerifiedProfile };
