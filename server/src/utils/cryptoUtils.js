import crypto from 'crypto';
import { config } from '../config/env.js';

/**
 * Generate a cryptographically secure numeric OTP using crypto.randomInt
 * Strictly avoids Math.random
 */
export const generateOtp = (length = 6) => {
  if (length === 6) {
    // Exactly 6 digits: 100000 to 999999
    return crypto.randomInt(100000, 1000000).toString();
  }
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length);
  return crypto.randomInt(min, max).toString();
};

/**
 * Hash an OTP using HMAC-SHA256 with the server OTP secret
 */
export const hashOtp = (otp, secret = config.otp.secret) => {
  return crypto
    .createHmac('sha256', secret)
    .update(String(otp).trim())
    .digest('hex');
};

/**
 * Constant-time comparison between candidate OTP and stored HMAC hash
 * Eliminates timing attacks
 */
export const verifyOtpHash = (candidateOtp, storedHash, secret = config.otp.secret) => {
  if (!candidateOtp || !storedHash) return false;

  const candidateHash = hashOtp(candidateOtp, secret);
  const candidateBuf = Buffer.from(candidateHash, 'hex');
  const storedBuf = Buffer.from(storedHash, 'hex');

  if (candidateBuf.length !== storedBuf.length) {
    return false;
  }

  return crypto.timingSafeEqual(candidateBuf, storedBuf);
};

/**
 * Hash a refresh token using SHA-256 for secure DB persistence
 */
export const hashToken = (token) => {
  return crypto
    .createHash('sha256')
    .update(String(token))
    .digest('hex');
};

/**
 * Generate a cryptographically secure random token (e.g., refresh token, CSRF token)
 */
export const generateSecureToken = (bytes = 32) => {
  return crypto.randomBytes(bytes).toString('hex');
};
