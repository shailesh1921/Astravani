import crypto from 'crypto';

// Server-side secret key for HMAC and SHA-256 OTP hashing
const OTP_SECRET = process.env.OTP_SECRET_KEY || 'astravani_vedic_otp_secret_key_2026';

// In-memory rate-limiter maps for serverless runtime instance
const rateLimitMap = new Map(); // phone -> { lastSent: number, hourCount: number, hourReset: number }
const ipRateLimitMap = new Map(); // ip -> { count: number, resetAt: number }

/**
 * Abstracted SMS Delivery Provider
 * Supports MSG91 (DLT template standard in India) and Fast2SMS,
 * with graceful fallback to console logging in development mode.
 */
async function sendSMS({ phone, otp }) {
  const clean10Digit = phone.replace(/\D/g, '').slice(-10);
  const msg91AuthKey = process.env.MSG91_AUTH_KEY?.trim();
  const msg91TemplateId = process.env.MSG91_TEMPLATE_ID?.trim();
  const fast2smsKey = process.env.FAST2SMS_API_KEY?.trim();

  // 1. Primary: MSG91 (India DLT Certified)
  if (msg91AuthKey && msg91TemplateId) {
    try {
      const response = await fetch(
        `https://control.msg91.com/api/v5/otp?template_id=${encodeURIComponent(msg91TemplateId)}&mobile=91${clean10Digit}&otp=${otp}`,
        {
          method: 'POST',
          headers: {
            'authkey': msg91AuthKey,
            'Content-Type': 'application/json'
          }
        }
      );
      const data = await response.json().catch(() => ({}));
      if (response.ok && data.type !== 'error') {
        return { success: true, provider: 'msg91' };
      }
      console.warn('MSG91 returned notice:', data);
    } catch (err) {
      console.error('MSG91 dispatch error:', err);
    }
  }

  // 2. Secondary: Fast2SMS
  if (fast2smsKey) {
    try {
      const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          'authorization': fast2smsKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          route: 'otp',
          variables_values: otp,
          numbers: clean10Digit,
          sender_id: 'ASTRAV'
        })
      });
      const data = await response.json().catch(() => ({}));
      if (data.return) {
        return { success: true, provider: 'fast2sms' };
      }
      console.warn('Fast2SMS returned notice:', data);
    } catch (err) {
      console.error('Fast2SMS dispatch error:', err);
    }
  }

  // 3. Development / Sandbox fallback: Log to server console
  console.log(`\n======================================================`);
  console.log(`[AstraVani OTP Service] 6-DIGIT OTP FOR ${phone}: [ ${otp} ]`);
  console.log(`Valid for 5 minutes. Generated with crypto.randomInt`);
  console.log(`======================================================\n`);
  return { success: true, provider: 'dev-console' };
}

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
    const { phone, countryCode = '+91' } = req.body || {};

    if (!phone) {
      return res.status(400).json({ error: 'Mobile number is required' });
    }

    // Clean and validate Indian 10-digit mobile number format
    const digitsOnly = phone.replace(/\D/g, '');
    const clean10Digit = digitsOnly.slice(-10);

    // Indian mobile numbers must start with 6, 7, 8, or 9 and be 10 digits
    if (clean10Digit.length !== 10 || !/^[6-9]\d{9}$/.test(clean10Digit)) {
      return res.status(400).json({ 
        error: 'Please enter a valid 10-digit Indian mobile number (e.g. 9876543210)' 
      });
    }

    const fullPhone = `${countryCode.startsWith('+') ? countryCode : '+' + countryCode}${clean10Digit}`;
    const now = Date.now();

    // IP Rate Limiting (max 12 OTP requests per 10 minutes per IP)
    const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
    const ipRecord = ipRateLimitMap.get(clientIp);
    if (ipRecord) {
      if (now < ipRecord.resetAt) {
        if (ipRecord.count >= 12) {
          return res.status(429).json({ 
            error: 'Too many requests from this network. Please wait a few minutes before trying again.' 
          });
        }
        ipRecord.count++;
      } else {
        ipRateLimitMap.set(clientIp, { count: 1, resetAt: now + 10 * 60 * 1000 });
      }
    } else {
      ipRateLimitMap.set(clientIp, { count: 1, resetAt: now + 10 * 60 * 1000 });
    }

    // Phone Cooldown & Hourly Rate Limiting
    const phoneRecord = rateLimitMap.get(fullPhone);
    if (phoneRecord) {
      // 1. 60-second cooldown check
      const elapsed = Math.floor((now - phoneRecord.lastSent) / 1000);
      if (elapsed < 60) {
        const remaining = 60 - elapsed;
        return res.status(429).json({
          error: `Please wait ${remaining} seconds before requesting a new OTP.`,
          cooldownRemaining: remaining
        });
      }

      // 2. Max 5 sends per hour per number
      if (now < phoneRecord.hourReset) {
        if (phoneRecord.hourCount >= 5) {
          return res.status(429).json({
            error: 'Maximum OTP request limit reached for this number (5 per hour). Please try later.'
          });
        }
        phoneRecord.hourCount++;
      } else {
        phoneRecord.hourCount = 1;
        phoneRecord.hourReset = now + 60 * 60 * 1000;
      }
      phoneRecord.lastSent = now;
    } else {
      rateLimitMap.set(fullPhone, {
        lastSent: now,
        hourCount: 1,
        hourReset: now + 60 * 60 * 1000
      });
    }

    // Cryptographic 6-digit OTP generation (100000 - 999999) using crypto.randomInt
    const otpInt = crypto.randomInt(100000, 1000000);
    const otp = otpInt.toString();

    // Compute SHA-256 hash of OTP + salt + phone
    const sha256Hash = crypto
      .createHash('sha256')
      .update(`${OTP_SECRET}:${fullPhone}:${otp}`)
      .digest('hex');

    // Token expires strictly in 5 minutes (300,000 ms)
    const expiresAt = now + 5 * 60 * 1000;

    // Create cryptographically signed HMAC token for stateless, tamper-proof verification
    const payload = JSON.stringify({
      phone: fullPhone,
      hash: sha256Hash,
      expiresAt,
      attempts: 0
    });
    const payloadBase64 = Buffer.from(payload).toString('base64url');
    const signature = crypto
      .createHmac('sha256', OTP_SECRET)
      .update(payloadBase64)
      .digest('base64url');
    const verificationToken = `${payloadBase64}.${signature}`;

    // Dispatch via SMS provider
    const smsResult = await sendSMS({ phone: fullPhone, otp });

    // In dev / test or when SMS provider is not configured, supply devOtp for effortless verification
    const isDev = process.env.NODE_ENV !== 'production' || !process.env.MSG91_AUTH_KEY;

    return res.status(200).json({
      success: true,
      message: `6-digit verification code sent to ${fullPhone.slice(0, 5)}••••${fullPhone.slice(-2)}`,
      phone: fullPhone,
      cooldownSeconds: 60,
      expiresInSeconds: 300,
      verificationToken,
      ...(isDev ? { devOtp: otp } : {})
    });
  } catch (error) {
    console.error('Send OTP Error:', error);
    return res.status(500).json({
      error: 'Unable to send OTP at this moment. Please check your connection and retry.'
    });
  }
}
