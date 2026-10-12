import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { User } from '../src/models/User.js';
import { OtpToken } from '../src/models/OtpToken.js';
import { hashOtp } from '../src/utils/cryptoUtils.js';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
}, 60000);

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

beforeEach(async () => {
  await User.deleteMany({});
  await OtpToken.deleteMany({});
});

describe('Step 1: Backend Email OTP Flow', () => {
  const testEmail = 'devotee@example.com';

  describe('POST /auth/email/request', () => {
    it('generates a 6-digit OTP, stores its HMAC hash in MongoDB with 5m expiry, and returns generic success message', async () => {
      const res = await request(app)
        .post('/auth/email/request')
        .send({ email: testEmail });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('verification code has been sent');
      
      // CRITICAL SECURITY ASSERTION: OTP must NEVER appear in the response!
      expect(res.body.otp).toBeUndefined();
      expect(res.body.code).toBeUndefined();
      expect(res.body.devOtp).toBeUndefined();

      // Check DB persistence
      const tokenDoc = await OtpToken.findOne({ email: testEmail });
      expect(tokenDoc).not.toBeNull();
      expect(tokenDoc.otpHash).toBeDefined();
      expect(tokenDoc.attempts).toBe(0);
      // Check 5-minute expiry
      const diffMinutes = (tokenDoc.expiresAt.getTime() - tokenDoc.createdAt.getTime()) / (60 * 1000);
      expect(Math.round(diffMinutes)).toBe(5);
    });

    it('rejects invalid email formats', async () => {
      const res = await request(app)
        .post('/auth/email/request')
        .send({ email: 'invalid-email-string' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('valid email address');
    });

    it('blocks disposable temporary email domains', async () => {
      const res = await request(app)
        .post('/auth/email/request')
        .send({ email: 'spammer@mailinator.com' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('disposable');
    });

    it('enforces 30-second cooldown on rapid resend requests', async () => {
      // First request
      const firstRes = await request(app)
        .post('/auth/email/request')
        .send({ email: testEmail });
      expect(firstRes.status).toBe(200);

      // Immediate second request within 30s
      const secondRes = await request(app)
        .post('/auth/email/request')
        .send({ email: testEmail });

      expect(secondRes.status).toBe(429);
      expect(secondRes.body.error).toContain('Please wait');
    });
  });

  describe('POST /auth/email/verify', () => {
    it('verifies correct OTP, creates new user with emailVerified: true, issues cookies, and deletes single-use OTP', async () => {
      const rawOtp = '654321';
      const otpHash = hashOtp(rawOtp);
      const now = new Date();

      await OtpToken.create({
        email: testEmail,
        otpHash,
        attempts: 0,
        createdAt: now,
        expiresAt: new Date(now.getTime() + 5 * 60 * 1000)
      });

      const res = await request(app)
        .post('/auth/email/verify')
        .send({ email: testEmail, otp: rawOtp });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe(testEmail);
      expect(res.body.user.emailVerified).toBe(true);

      // Verify httpOnly cookies set
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies.some((c) => c.includes('access_token'))).toBe(true);
      expect(cookies.some((c) => c.includes('refresh_token'))).toBe(true);

      // Assert single-use: token must be deleted from DB!
      const remainingToken = await OtpToken.findOne({ email: testEmail });
      expect(remainingToken).toBeNull();

      // Assert user persisted in database
      const dbUser = await User.findOne({ email: testEmail });
      expect(dbUser).not.toBeNull();
      expect(dbUser.emailVerified).toBe(true);
    });

    it('rejects wrong OTP, increments attempts count, and reports remaining attempts', async () => {
      const rawOtp = '123456';
      const otpHash = hashOtp(rawOtp);
      const now = new Date();

      await OtpToken.create({
        email: testEmail,
        otpHash,
        attempts: 0,
        createdAt: now,
        expiresAt: new Date(now.getTime() + 5 * 60 * 1000)
      });

      const res = await request(app)
        .post('/auth/email/verify')
        .send({ email: testEmail, otp: '999999' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.remainingAttempts).toBe(4);

      // Check DB attempts incremented
      const tokenDoc = await OtpToken.findOne({ email: testEmail });
      expect(tokenDoc.attempts).toBe(1);
    });

    it('invalidates OTP after exceeding 5 failed attempts', async () => {
      const rawOtp = '123456';
      const otpHash = hashOtp(rawOtp);
      const now = new Date();

      await OtpToken.create({
        email: testEmail,
        otpHash,
        attempts: 4, // 5th attempt will fail
        createdAt: now,
        expiresAt: new Date(now.getTime() + 5 * 60 * 1000)
      });

      const res = await request(app)
        .post('/auth/email/verify')
        .send({ email: testEmail, otp: '000000' });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Maximum verification attempts exceeded');

      // Assert token was deleted
      const tokenDoc = await OtpToken.findOne({ email: testEmail });
      expect(tokenDoc).toBeNull();
    });

    it('rejects expired OTPs', async () => {
      const rawOtp = '123456';
      const otpHash = hashOtp(rawOtp);
      const pastTime = new Date(Date.now() - 10 * 60 * 1000); // 10 minutes ago

      await OtpToken.create({
        email: testEmail,
        otpHash,
        attempts: 0,
        createdAt: pastTime,
        expiresAt: new Date(pastTime.getTime() + 5 * 60 * 1000)
      });

      const res = await request(app)
        .post('/auth/email/verify')
        .send({ email: testEmail, otp: rawOtp });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Invalid or expired');
    });
  });
});
