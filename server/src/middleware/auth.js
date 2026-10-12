import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { User } from '../models/User.js';

/**
 * Authentication middleware
 * Validates JWT access token from httpOnly cookie or Authorization Bearer header
 */
export const requireAuth = async (req, res, next) => {
  try {
    // 1. Extract token from httpOnly cookie or Bearer header
    let token = req.cookies?.access_token;

    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. No access token provided.'
      });
    }

    // 2. Verify JWT signature & expiration
    let decoded;
    try {
      decoded = jwt.verify(token, config.jwt.accessSecret);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: 'Access token expired.',
          code: 'TOKEN_EXPIRED'
        });
      }
      return res.status(401).json({
        success: false,
        error: 'Invalid access token.',
        code: 'TOKEN_INVALID'
      });
    }

    // 3. Lookup user in database
    const user = await User.findById(decoded.sub);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User account not found.'
      });
    }

    // 4. Check if account is temporarily locked
    if (user.lockUntil && user.lockUntil > new Date()) {
      return res.status(423).json({
        success: false,
        error: 'Account temporarily locked. Please contact support or try again later.'
      });
    }

    // 5. Attach authenticated user to request object
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
