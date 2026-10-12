import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../config/env.js';
import { RefreshToken } from '../models/RefreshToken.js';
import { hashToken } from '../utils/cryptoUtils.js';

/**
 * Generate a short-lived (15-minute) JWT Access Token
 */
export const generateAccessToken = (user) => {
  return jwt.sign(
    {
      sub: user._id.toString(),
      email: user.email,
      name: user.name || ''
    },
    config.jwt.accessSecret,
    { expiresIn: config.jwt.accessExpiresIn }
  );
};

/**
 * Generate an opaque Refresh Token and persist its hash in MongoDB
 */
export const createRefreshToken = async (user, { ip = '', userAgent = '', family = null } = {}) => {
  const rawToken = crypto.randomBytes(48).toString('hex');
  const tokenHash = hashToken(rawToken);
  const tokenFamily = family || crypto.randomUUID();
  const expiresAt = new Date(Date.now() + config.jwt.refreshExpiresInDays * 24 * 60 * 60 * 1000);

  await RefreshToken.create({
    tokenHash,
    user: user._id,
    family: tokenFamily,
    ip,
    userAgent,
    expiresAt
  });

  return {
    rawToken,
    family: tokenFamily,
    expiresAt
  };
};

/**
 * Set secure, httpOnly cookies for access and refresh tokens
 */
export const setAuthCookies = (res, { accessToken, refreshToken }) => {
  const isProd = config.isProd;

  if (accessToken) {
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
      path: '/'
    });
  }

  if (refreshToken) {
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: config.jwt.refreshExpiresInDays * 24 * 60 * 60 * 1000, // 7 days
      path: '/'
    });
  }
};

/**
 * Clear authentication cookies
 */
export const clearAuthCookies = (res) => {
  const isProd = config.isProd;
  const cookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/'
  };

  res.clearCookie('access_token', cookieOptions);
  res.clearCookie('refresh_token', cookieOptions);
};
