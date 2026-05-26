import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const verifyToken = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Token diperlukan' });
  }
  try {
    const payload = jwt.verify(auth.split(' ')[1], env.JWT_SECRET);
    req.user = payload; // { userId, role }
    next();
  } catch {
    res.status(401).json({ success: false, error: 'Token tidak valid atau kedaluwarsa' });
  }
};

export const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) {
    return res.status(403).json({ success: false, error: 'Akses ditolak: role tidak sesuai' });
  }
  next();
};

export const optionalAuth = (req, res, next) => {
  const auth = req.headers.authorization;
  if (auth?.startsWith('Bearer ')) {
    try {
      req.user = jwt.verify(auth.split(' ')[1], env.JWT_SECRET);
    } catch { /* abaikan token invalid */ }
  }
  next();
};
