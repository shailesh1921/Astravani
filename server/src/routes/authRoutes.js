import { Router } from 'express';
import { requestEmailOtp, verifyEmailOtp } from '../controllers/emailAuthController.js';
import { googleAuthLogin } from '../controllers/googleAuthController.js';
import { 
  refreshTokenSession, 
  logout, 
  logoutAllDevices, 
  getMe, 
  updateProfile, 
  deleteAccount 
} from '../controllers/sessionController.js';
import { validateBody, requestOtpSchema, verifyOtpSchema, googleAuthSchema } from '../middleware/validate.js';
import { emailOtpRequestLimiter, emailOtpVerifyLimiter } from '../middleware/rateLimiter.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

/**
 * Route: POST /auth/email/request
 * Description: Request a 6-digit verification code via email
 */
router.post(
  '/email/request',
  emailOtpRequestLimiter,
  validateBody(requestOtpSchema),
  requestEmailOtp
);

/**
 * Route: POST /auth/email/verify
 * Description: Verify 6-digit OTP, login/create user, issue tokens
 */
router.post(
  '/email/verify',
  emailOtpVerifyLimiter,
  validateBody(verifyOtpSchema),
  verifyEmailOtp
);

/**
 * Route: POST /auth/google
 * Description: Verify Google ID token, link account by verified email, issue tokens
 */
router.post(
  '/google',
  emailOtpVerifyLimiter,
  validateBody(googleAuthSchema),
  googleAuthLogin
);

/**
 * Route: POST /auth/refresh
 * Description: Refresh token rotation with reuse detection
 */
router.post('/refresh', refreshTokenSession);

/**
 * Route: POST /auth/logout
 * Description: Invalidate current refresh token and clear cookies
 */
router.post('/logout', logout);

/**
 * Route: POST /auth/logout-all
 * Description: Invalidate all active sessions across all devices
 */
router.post('/logout-all', requireAuth, logoutAllDevices);

/**
 * Route: GET /auth/me
 * Description: Get current authenticated user profile and login audit log
 */
router.get('/me', requireAuth, getMe);

/**
 * Route: PATCH /auth/profile
 * Description: Update user profile name or avatar
 */
router.patch('/profile', requireAuth, updateProfile);

/**
 * Route: DELETE /auth/account
 * Description: Permanently delete account and all sessions
 */
router.delete('/account', requireAuth, deleteAccount);

export default router;


