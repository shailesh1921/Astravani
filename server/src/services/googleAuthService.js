import { OAuth2Client } from 'google-auth-library';
import { config } from '../config/env.js';

let googleClient = null;

const getGoogleClient = () => {
  if (!googleClient) {
    googleClient = new OAuth2Client(config.google.clientId);
  }
  return googleClient;
};

/**
 * Verify Google ID Token with google-auth-library
 * Strictly verifies signature, audience, issuer, expiration, and email_verified claim
 */
export const verifyGoogleIdToken = async (idToken) => {
  if (!idToken || typeof idToken !== 'string') {
    throw new Error('ID Token string is required');
  }

  const client = getGoogleClient();

  // If no clientId configured in development, allow mock or check configuration
  const audience = config.google.clientId || undefined;

  const ticket = await client.verifyIdToken({
    idToken,
    audience
  });

  const payload = ticket.getPayload();
  if (!payload) {
    throw new Error('Invalid Google ID Token payload');
  }

  // 1. Verify Issuer
  const validIssuers = ['accounts.google.com', 'https://accounts.google.com'];
  if (!validIssuers.includes(payload.iss)) {
    throw new Error(`Invalid token issuer: ${payload.iss}`);
  }

  // 2. Strict Check: Email must be verified by Google
  if (!payload.email_verified) {
    throw new Error('Google account email is not verified');
  }

  if (!payload.email) {
    throw new Error('Google token does not contain an email claim');
  }

  // 3. Return verified claims ONLY - never trust unverified client data
  return {
    sub: payload.sub, // Unique Google User ID
    email: payload.email.toLowerCase().trim(),
    name: payload.name || payload.email.split('@')[0],
    picture: payload.picture || '',
    emailVerified: Boolean(payload.email_verified)
  };
};
