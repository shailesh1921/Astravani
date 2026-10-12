import { User } from '../models/User.js';
import { OtpToken } from '../models/OtpToken.js';
import { LoginEvent } from '../models/LoginEvent.js';
import { generateOtp, hashOtp, verifyOtpHash } from '../utils/cryptoUtils.js';
import { isDisposableEmail } from '../utils/disposableEmailCheck.js';
import { sendOtpEmail } from '../services/email/emailService.js';
import { generateAccessToken, createRefreshToken, setAuthCookies } from '../services/tokenService.js';
import { config } from '../config/env.js';

/**
 * POST /auth/email/request
 * Request a 6-digit OTP sent via email
 */
export const requestEmailOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || '';

    // 1. Guard against disposable temporary email domains
    if (isDisposableEmail(email)) {
      return res.status(400).json({
        success: false,
        error: 'Temporary or disposable email addresses are not permitted.'
      });
    }

    const now = Date.now();

    // 2. Cooldown check: 30 seconds since last OTP for this email
    const recentOtp = await OtpToken.findOne({ email }).sort({ createdAt: -1 });
    if (recentOtp) {
      const elapsedSeconds = Math.floor((now - new Date(recentOtp.createdAt).getTime()) / 1000);
      if (elapsedSeconds < config.otp.cooldownSeconds) {
        const remaining = config.otp.cooldownSeconds - elapsedSeconds;
        return res.status(429).json({
          success: false,
          error: `Please wait ${remaining} seconds before requesting a new code.`,
          cooldownRemaining: remaining
        });
      }
    }

    // 3. Hourly rate limiting: Max 5 OTP requests per hour per email
    const oneHourAgo = new Date(now - 60 * 60 * 1000);
    const hourlyCount = await OtpToken.countDocuments({
      email,
      createdAt: { $gte: oneHourAgo }
    });
    if (hourlyCount >= config.otp.maxPerHourPerEmail) {
      return res.status(429).json({
        success: false,
        error: 'Maximum hourly verification requests reached for this email. Please try again later.'
      });
    }

    // 4. Invalidate any previous OTP tokens for this email (a new OTP invalidates previous ones)
    await OtpToken.deleteMany({ email });

    // 5. Generate 6-digit OTP using crypto.randomInt (never Math.random)
    const otp = generateOtp(config.otp.length);
    const otpHash = hashOtp(otp);

    // 6. Store HMAC hash in MongoDB with 5-minute TTL
    const expiresAt = new Date(now + config.otp.expiryMinutes * 60 * 1000);
    await OtpToken.create({
      email,
      otpHash,
      attempts: 0,
      ip,
      userAgent,
      createdAt: new Date(now),
      expiresAt
    });

    // 7. Dispatch branded HTML email (and log to SERVER console if in development)
    await sendOtpEmail(email, otp, config.otp.expiryMinutes);

    // 8. Always respond with the same generic message to prevent account enumeration
    return res.status(200).json({
      success: true,
      message: 'If that email address is valid, a 6-digit verification code has been sent.',
      cooldownSeconds: config.otp.cooldownSeconds
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /auth/email/verify
 * Verify the 6-digit OTP, create/login user, and issue tokens in httpOnly cookies
 */
export const verifyEmailOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || '';

    // 1. Check if user exists and is locked out from repeated failures
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.lockUntil && existingUser.lockUntil > new Date()) {
      const waitMinutes = Math.ceil((existingUser.lockUntil.getTime() - Date.now()) / (60 * 1000));
      return res.status(423).json({
        success: false,
        error: `Account is temporarily locked due to excessive failed attempts. Please try again in ${waitMinutes} minute(s).`
      });
    }

    // 2. Fetch active OtpToken for this email
    const tokenDoc = await OtpToken.findOne({ email }).sort({ createdAt: -1 });

    if (!tokenDoc || tokenDoc.expiresAt < new Date()) {
      await LoginEvent.create({
        email,
        method: 'email_otp',
        status: 'failure',
        failureReason: 'Invalid or expired OTP',
        ip,
        userAgent
      });
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired verification code. Please request a new one.'
      });
    }

    // 3. Check attempt limit: Max 5 attempts per OTP
    if (tokenDoc.attempts >= config.otp.maxAttempts) {
      await OtpToken.deleteOne({ _id: tokenDoc._id });
      await LoginEvent.create({
        email,
        method: 'email_otp',
        status: 'failure',
        failureReason: 'Exceeded maximum attempts',
        ip,
        userAgent
      });
      return res.status(400).json({
        success: false,
        error: 'Maximum verification attempts exceeded. This code has been invalidated. Please request a new one.'
      });
    }

    // 4. Constant-time hash verification to prevent timing attacks
    const isValid = verifyOtpHash(otp, tokenDoc.otpHash);

    if (!isValid) {
      tokenDoc.attempts += 1;
      await tokenDoc.save();

      // Progressive lockout tracking on User if user exists
      if (existingUser) {
        existingUser.failedOtpAttempts += 1;
        if (existingUser.failedOtpAttempts >= 5) {
          existingUser.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15-minute lockout
        }
        await existingUser.save();
      }

      await LoginEvent.create({
        email,
        method: 'email_otp',
        status: 'failure',
        failureReason: 'Incorrect OTP code',
        ip,
        userAgent
      });

      const remaining = config.otp.maxAttempts - tokenDoc.attempts;
      if (remaining <= 0) {
        await OtpToken.deleteOne({ _id: tokenDoc._id });
        return res.status(400).json({
          success: false,
          error: 'Maximum verification attempts exceeded. Please request a new code.'
        });
      }

      return res.status(400).json({
        success: false,
        error: `Invalid verification code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`,
        remainingAttempts: remaining
      });
    }

    // 5. SUCCESS! OTP is strictly single-use; delete immediately
    await OtpToken.deleteOne({ _id: tokenDoc._id });

    // 6. Find or create the user
    let user = existingUser;
    if (!user) {
      const defaultName = email.split('@')[0] || 'User';
      user = await User.create({
        email,
        name: defaultName,
        emailVerified: true,
        failedOtpAttempts: 0,
        lockUntil: null
      });
    } else {
      user.emailVerified = true;
      user.failedOtpAttempts = 0;
      user.lockUntil = null;
      await user.save();
    }

    // 7. Audit log the successful login event
    await LoginEvent.create({
      user: user._id,
      email: user.email,
      method: 'email_otp',
      status: 'success',
      ip,
      userAgent
    });

    // 8. Generate JWT access token + refresh token
    const accessToken = generateAccessToken(user);
    const refreshData = await createRefreshToken(user, { ip, userAgent });

    // 9. Set secure httpOnly cookies
    setAuthCookies(res, {
      accessToken,
      refreshToken: refreshData.rawToken
    });

    // 10. Return sanitized user profile (NO tokens or secrets in body)
    return res.status(200).json({
      success: true,
      message: 'Authentication successful',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        emailVerified: user.emailVerified
      }
    });
  } catch (error) {
    next(error);
  }
};
