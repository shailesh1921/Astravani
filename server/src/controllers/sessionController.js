import { User } from '../models/User.js';
import { RefreshToken } from '../models/RefreshToken.js';
import { LoginEvent } from '../models/LoginEvent.js';
import { OtpToken } from '../models/OtpToken.js';
import { hashToken } from '../utils/cryptoUtils.js';
import { generateAccessToken, createRefreshToken, setAuthCookies, clearAuthCookies } from '../services/tokenService.js';

/**
 * POST /auth/refresh
 * Refresh Token Rotation (RTR) with Automatic Reuse Detection
 */
export const refreshTokenSession = async (req, res, next) => {
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || '';
  const userAgent = req.headers['user-agent'] || '';

  try {
    const rawRefreshToken = req.cookies?.refresh_token || req.body?.refreshToken;

    if (!rawRefreshToken) {
      return res.status(401).json({
        success: false,
        error: 'Refresh token is required.'
      });
    }

    const tokenHash = hashToken(rawRefreshToken);
    const existingTokenDoc = await RefreshToken.findOne({ tokenHash });

    // REUSE DETECTION DEFENSE:
    // If token exists but is marked revoked, an attacker or compromised party may be attempting replay!
    if (existingTokenDoc && existingTokenDoc.isRevoked) {
      console.warn(`[Security Alert] Refresh token reuse detected for family: ${existingTokenDoc.family}`);
      // Immediately revoke all tokens in this family to protect the user
      await RefreshToken.updateMany({ family: existingTokenDoc.family }, { isRevoked: true });
      clearAuthCookies(res);
      return res.status(401).json({
        success: false,
        error: 'Security alert: Refresh token reuse detected. All sessions have been terminated. Please log in again.'
      });
    }

    // Token not found or expired
    if (!existingTokenDoc || existingTokenDoc.expiresAt < new Date()) {
      clearAuthCookies(res);
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired refresh token. Please sign in again.'
      });
    }

    // Lookup user
    const user = await User.findById(existingTokenDoc.user);
    if (!user) {
      clearAuthCookies(res);
      return res.status(401).json({
        success: false,
        error: 'User associated with token no longer exists.'
      });
    }

    // 1. Invalidate/Revoke the used refresh token (Single-use rotation)
    existingTokenDoc.isRevoked = true;
    await existingTokenDoc.save();

    // 2. Generate a NEW Refresh Token within the SAME token family
    const newRefreshData = await createRefreshToken(user, {
      ip,
      userAgent,
      family: existingTokenDoc.family
    });

    // 3. Generate a NEW 15-minute JWT Access Token
    const newAccessToken = generateAccessToken(user);

    // 4. Update secure httpOnly cookies
    setAuthCookies(res, {
      accessToken: newAccessToken,
      refreshToken: newRefreshData.rawToken
    });

    return res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
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

/**
 * POST /auth/logout
 * Terminate current session, revoke refresh token, clear cookies
 */
export const logout = async (req, res, next) => {
  try {
    const rawRefreshToken = req.cookies?.refresh_token || req.body?.refreshToken;

    if (rawRefreshToken) {
      const tokenHash = hashToken(rawRefreshToken);
      await RefreshToken.updateOne({ tokenHash }, { isRevoked: true });
    }

    clearAuthCookies(res);

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /auth/logout-all
 * Invalidate all active device sessions for current user
 */
export const logoutAllDevices = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Revoke all refresh tokens for this user
    await RefreshToken.updateMany({ user: userId }, { isRevoked: true });
    clearAuthCookies(res);

    return res.status(200).json({
      success: true,
      message: 'All device sessions terminated successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /auth/me
 * Retrieve current user profile and recent security login audit log
 */
export const getMe = async (req, res, next) => {
  try {
    const user = req.user;

    // Fetch recent 10 login events for security audit visibility
    const recentLogins = await LoginEvent.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('method status ip userAgent createdAt failureReason');

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        emailVerified: user.emailVerified,
        hasGoogleLinked: Boolean(user.googleId),
        createdAt: user.createdAt
      },
      auditLog: recentLogins
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /auth/profile
 * Update user profile details (name, avatar)
 */
export const updateProfile = async (req, res, next) => {
  try {
    const user = req.user;
    const { name, avatar } = req.body;

    if (typeof name === 'string') {
      user.name = name.trim();
    }
    if (typeof avatar === 'string') {
      user.avatar = avatar.trim();
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
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

/**
 * DELETE /auth/account
 * Permanently delete user account and all associated sessions
 */
export const deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const email = req.user.email;

    // Remove all user data
    await User.deleteOne({ _id: userId });
    await RefreshToken.deleteMany({ user: userId });
    await LoginEvent.deleteMany({ user: userId });
    await OtpToken.deleteMany({ email });

    clearAuthCookies(res);

    return res.status(200).json({
      success: true,
      message: 'Account and all associated session data permanently deleted.'
    });
  } catch (error) {
    next(error);
  }
};
