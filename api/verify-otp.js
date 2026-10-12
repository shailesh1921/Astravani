import crypto from 'crypto';

const OTP_SECRET = process.env.OTP_SECRET_KEY || 'astravani_vedic_otp_secret_key_2026';

export default async function handler(req, res) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Content-Type, x-api-version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { phone, otp, verificationToken, fullName } = req.body || {};

    if (!phone || !otp) {
      return res.status(400).json({ error: 'Mobile number and 6-digit OTP are required.' });
    }

    const cleanOtp = String(otp).trim();
    if (!/^\d{6}$/.test(cleanOtp)) {
      return res.status(400).json({ error: 'Please enter a complete 6-digit verification code.' });
    }

    if (!verificationToken) {
      return res.status(400).json({ error: 'Verification session expired. Please request a new OTP.' });
    }

    // Parse and verify HMAC signature
    const parts = verificationToken.split('.');
    if (parts.length !== 2) {
      return res.status(400).json({ error: 'Invalid verification token format. Please retry.' });
    }

    const [payloadBase64, signature] = parts;
    const expectedSig = crypto
      .createHmac('sha256', OTP_SECRET)
      .update(payloadBase64)
      .digest('base64url');

    // Timing-safe comparison to prevent timing attacks
    const sigBuffer = Buffer.from(signature);
    const expectedSigBuffer = Buffer.from(expectedSig);
    if (sigBuffer.length !== expectedSigBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedSigBuffer)) {
      return res.status(400).json({ error: 'Invalid or forged verification session. Please request a new OTP.' });
    }

    // Decode and validate payload
    let payload;
    try {
      payload = JSON.parse(Buffer.from(payloadBase64, 'base64url').toString('utf8'));
    } catch {
      return res.status(400).json({ error: 'Malformed verification token.' });
    }

    const now = Date.now();
    const cleanDigits = phone.replace(/\D/g, '').slice(-10);
    const fullPhone = phone.startsWith('+') ? phone : `+91${cleanDigits}`;

    // 1. Expiration Check (5 minutes validity)
    if (now > payload.expiresAt) {
      return res.status(400).json({ error: 'OTP has expired (validity is 5 minutes). Please request a new OTP.' });
    }

    // 2. Max Verification Attempts (Limit: 5 attempts max)
    if (payload.attempts >= 5) {
      return res.status(429).json({ 
        error: 'Too many incorrect attempts. This OTP has been invalidated for security. Please request a new code.' 
      });
    }

    // 3. Match Phone
    if (payload.phone !== fullPhone) {
      return res.status(400).json({ error: 'Mobile number does not match this verification session.' });
    }

    // 4. Validate OTP Hash using Timing-Safe Comparison
    const candidateHash = crypto
      .createHash('sha256')
      .update(`${OTP_SECRET}:${payload.phone}:${cleanOtp}`)
      .digest('hex');

    const candidateHashBuf = Buffer.from(candidateHash);
    const expectedHashBuf = Buffer.from(payload.hash);

    const isMatch =
      candidateHashBuf.length === expectedHashBuf.length &&
      crypto.timingSafeEqual(candidateHashBuf, expectedHashBuf);

    if (!isMatch) {
      const newAttempts = (payload.attempts || 0) + 1;
      const remainingAttempts = Math.max(0, 5 - newAttempts);

      if (remainingAttempts === 0) {
        return res.status(400).json({
          error: 'Maximum attempts exceeded. This OTP has expired. Please request a new code.',
          attemptsExceeded: true
        });
      }

      // Re-sign token with incremented attempt counter
      const updatedPayload = JSON.stringify({
        ...payload,
        attempts: newAttempts
      });
      const newPayloadBase64 = Buffer.from(updatedPayload).toString('base64url');
      const newSig = crypto
        .createHmac('sha256', OTP_SECRET)
        .update(newPayloadBase64)
        .digest('base64url');
      const updatedToken = `${newPayloadBase64}.${newSig}`;

      return res.status(400).json({
        error: `Incorrect 6-digit OTP. ${remainingAttempts} attempt${remainingAttempts === 1 ? '' : 's'} remaining.`,
        remainingAttempts,
        updatedToken
      });
    }

    // 5. Successful Verification! Mark phoneVerified: true
    const nowIso = new Date().toISOString();
    const userId = `usr_phone_${cleanDigits}`;
    const displayName = fullName?.trim() || `Devotee ${cleanDigits.slice(-4)}`;

    const userProfile = {
      id: userId,
      phone: fullPhone,
      fullName: displayName,
      phoneVerified: true,
      gender: 'Male',
      dob: '1996-05-15',
      tob: '07:30',
      pob: 'New Delhi, India',
      maritalStatus: 'Single',
      occupation: 'Professional',
      preferredLanguage: 'Hindi',
      createdAt: nowIso,
      lastLoginAt: nowIso
    };

    // Issue cryptographic session token (7-day validity)
    const sessionPayload = JSON.stringify({
      userId,
      phone: fullPhone,
      phoneVerified: true,
      issuedAt: now,
      expiresAt: now + 7 * 24 * 60 * 60 * 1000
    });
    const sessionBase64 = Buffer.from(sessionPayload).toString('base64url');
    const sessionSig = crypto
      .createHmac('sha256', OTP_SECRET)
      .update(sessionBase64)
      .digest('base64url');
    const sessionToken = `astravani_jwt.${sessionBase64}.${sessionSig}`;

    return res.status(200).json({
      success: true,
      message: 'Mobile number verified successfully!',
      user: userProfile,
      token: sessionToken
    });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    return res.status(500).json({
      error: 'Failed to verify OTP. Please try again.'
    });
  }
}
