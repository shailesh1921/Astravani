import { User } from '../models/User.js';
import { LoginEvent } from '../models/LoginEvent.js';
import { verifyGoogleIdToken } from '../services/googleAuthService.js';
import { generateAccessToken, createRefreshToken, setAuthCookies } from '../services/tokenService.js';

/**
 * POST /auth/google
 * Verify Google ID Token (credential), link account by verified email, and issue tokens
 */
export const googleAuthLogin = async (req, res, next) => {
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || '';
  const userAgent = req.headers['user-agent'] || '';

  try {
    const { idToken } = req.body;

    // 1. Verify Google ID Token with google-auth-library
    let googleClaims;
    try {
      googleClaims = await verifyGoogleIdToken(idToken);
    } catch (verifyErr) {
      await LoginEvent.create({
        method: 'google',
        status: 'failure',
        failureReason: verifyErr.message || 'Invalid Google ID Token',
        ip,
        userAgent
      });
      return res.status(401).json({
        success: false,
        error: `Google verification failed: ${verifyErr.message}`
      });
    }

    const { sub: googleId, email, name, picture, emailVerified } = googleClaims;

    // Strict safety check: Never trust unverified emails
    if (!emailVerified) {
      await LoginEvent.create({
        email,
        method: 'google',
        status: 'failure',
        failureReason: 'Email not verified by Google',
        ip,
        userAgent
      });
      return res.status(400).json({
        success: false,
        error: 'Your Google account email is not verified by Google.'
      });
    }

    // 2. Account Linking: Check if user already exists with the same verified email
    let user = await User.findOne({ email });

    if (user) {
      // Existing user (e.g. registered earlier via Email OTP or Google)
      // Link Google ID if not already linked
      if (!user.googleId) {
        user.googleId = googleId;
      }
      // Populate name and avatar if not present
      if (!user.name && name) {
        user.name = name;
      }
      if (!user.avatar && picture) {
        user.avatar = picture;
      }
      user.emailVerified = true;
      user.failedOtpAttempts = 0;
      user.lockUntil = null;
      await user.save();
    } else {
      // New user: Create user using ONLY verified claims from the Google token
      user = await User.create({
        email,
        emailVerified: true,
        googleId,
        name: name || email.split('@')[0],
        avatar: picture || '',
        failedOtpAttempts: 0,
        lockUntil: null
      });
    }

    // 3. Audit log the successful login event
    await LoginEvent.create({
      user: user._id,
      email: user.email,
      method: 'google',
      status: 'success',
      ip,
      userAgent
    });

    // 4. Generate JWT access token + refresh token
    const accessToken = generateAccessToken(user);
    const refreshData = await createRefreshToken(user, { ip, userAgent });

    // 5. Set secure httpOnly cookies
    setAuthCookies(res, {
      accessToken,
      refreshToken: refreshData.rawToken
    });

    // 6. Return sanitized user profile (NO token or secret exposure)
    return res.status(200).json({
      success: true,
      message: 'Google authentication successful',
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
