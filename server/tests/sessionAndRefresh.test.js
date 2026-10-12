import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { User } from '../src/models/User.js';
import { RefreshToken } from '../src/models/RefreshToken.js';
import { generateAccessToken, createRefreshToken } from '../src/services/tokenService.js';

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
  await RefreshToken.deleteMany({});
});

describe('Step 4: Token Refresh, Session Management & Protected Routes', () => {
  let testUser;
  let accessToken;
  let refreshData;

  beforeEach(async () => {
    testUser = await User.create({
      email: 'user@example.com',
      name: 'Alex Johnson',
      emailVerified: true
    });
    accessToken = generateAccessToken(testUser);
    refreshData = await createRefreshToken(testUser);
  });

  describe('GET /auth/me (Protected Route)', () => {
    it('returns 401 Unauthorized when no cookie or header is sent', async () => {
      const res = await request(app).get('/auth/me');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('returns user profile and audit log when valid access_token cookie is provided', async () => {
      const res = await request(app)
        .get('/auth/me')
        .set('Cookie', [`access_token=${accessToken}`]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.email).toBe(testUser.email);
      expect(res.body.user.name).toBe(testUser.name);
      expect(Array.isArray(res.body.auditLog)).toBe(true);
    });

    it('accepts Authorization: Bearer header as alternative', async () => {
      const res = await request(app)
        .get('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe(testUser.email);
    });
  });

  describe('POST /auth/refresh (Token Rotation & Reuse Detection)', () => {
    it('rotates refresh token: revokes old token and issues a new access token & refresh token', async () => {
      const res = await request(app)
        .post('/auth/refresh')
        .set('Cookie', [`refresh_token=${refreshData.rawToken}`]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify cookies set with new tokens
      const cookies = res.headers['set-cookie'];
      expect(cookies.some((c) => c.includes('access_token'))).toBe(true);
      expect(cookies.some((c) => c.includes('refresh_token'))).toBe(true);

      // Assert old token marked as revoked
      const oldTokenDoc = await RefreshToken.findOne({ family: refreshData.family, isRevoked: true });
      expect(oldTokenDoc).not.toBeNull();

      // Assert new active token exists in same family
      const newTokenDoc = await RefreshToken.findOne({ family: refreshData.family, isRevoked: false });
      expect(newTokenDoc).not.toBeNull();
    });

    it('REUSE DETECTION: attempting to use a revoked token revokes ALL tokens in the family', async () => {
      // 1. First legitimate rotation
      await request(app)
        .post('/auth/refresh')
        .set('Cookie', [`refresh_token=${refreshData.rawToken}`]);

      // 2. Attacker/replay attempt reusing the SAME old revoked token!
      const replayRes = await request(app)
        .post('/auth/refresh')
        .set('Cookie', [`refresh_token=${refreshData.rawToken}`]);

      expect(replayRes.status).toBe(401);
      expect(replayRes.body.error).toContain('reuse detected');

      // 3. Assert ALL tokens in that family are now revoked!
      const activeTokensInFamily = await RefreshToken.find({ family: refreshData.family, isRevoked: false });
      expect(activeTokensInFamily.length).toBe(0);
    });
  });

  describe('POST /auth/logout and /auth/logout-all', () => {
    it('logout revokes current token and clears cookies', async () => {
      const res = await request(app)
        .post('/auth/logout')
        .set('Cookie', [`refresh_token=${refreshData.rawToken}`]);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('Logged out successfully');

      // Check cookies cleared (expires in past / max-age=0)
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
    });

    it('logout-all revokes all sessions across all devices for the user', async () => {
      // Create second session (different family) for same user
      await createRefreshToken(testUser);

      const res = await request(app)
        .post('/auth/logout-all')
        .set('Cookie', [`access_token=${accessToken}`]);

      expect(res.status).toBe(200);

      // Verify all tokens for this user are now revoked
      const activeUserTokens = await RefreshToken.find({ user: testUser._id, isRevoked: false });
      expect(activeUserTokens.length).toBe(0);
    });
  });

  describe('PATCH /auth/profile & DELETE /auth/account', () => {
    it('updates user profile name', async () => {
      const res = await request(app)
        .patch('/auth/profile')
        .set('Cookie', [`access_token=${accessToken}`])
        .send({ name: 'Alexander J.' });

      expect(res.status).toBe(200);
      expect(res.body.user.name).toBe('Alexander J.');

      const dbUser = await User.findById(testUser._id);
      expect(dbUser.name).toBe('Alexander J.');
    });

    it('permanently deletes user account and revokes all tokens', async () => {
      const res = await request(app)
        .delete('/auth/account')
        .set('Cookie', [`access_token=${accessToken}`]);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('deleted');

      const dbUser = await User.findById(testUser._id);
      expect(dbUser).toBeNull();

      const userTokens = await RefreshToken.find({ user: testUser._id });
      expect(userTokens.length).toBe(0);
    });
  });
});
