import rateLimit from 'express-rate-limit';

/**
 * General API rate limiter
 */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again after 15 minutes.'
  }
});

/**
 * Strict rate limiter for requesting Email OTP: Max 5 per hour per IP
 */
export const emailOtpRequestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many OTP requests from this network. Please wait an hour before requesting again.'
  }
});

/**
 * Strict rate limiter for verifying Email OTP: Max 15 attempts per 15 minutes per IP
 */
export const emailOtpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many verification attempts from this network. Please try again later.'
  }
});
