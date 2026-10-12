import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { jest } from '@jest/globals';

// We mock ../src/services/googleAuthService.js to test all Google verification scenarios cleanly
const mockVerifyGoogleIdToken = jest.fn();
jest.unstable_mockModule('../src/services/googleAuthService.js', () => ({
  verifyGoogleIdToken: mockVerifyGoogleIdToken
}));

// Dynamic import of app after mock is registered
const { default: app } = await import('../src/app.js');
const { User } = await import('../src/models/User.js');
const { LoginEvent } = await import('../src/models/LoginEvent.js');

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
  await LoginEvent.deleteMany({});
  mockVerifyGoogleIdToken.mockReset();
});

describe('Step 2: Google Login Backend Flow', () => {
  const sampleGoogleClaims = {
    sub: 'google_sub_1092837465',
    email: 'shailesh@example.com',
    name: 'Shailesh Singh',
    picture: 'https://lh3.googleusercontent.com/a/sample-avatar',
    emailVerified: true
  };

  it('authenticates a new user via Google, creates account, sets cookies, and logs LoginEvent', async () => {
    mockVerifyGoogleIdToken.mockResolvedValueOnce(sampleGoogleClaims);

    const res = await request(app)
      .post('/auth/google')
      .send({ idToken: 'valid_mock_google_id_token' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe(sampleGoogleClaims.email);
    expect(res.body.user.name).toBe(sampleGoogleClaims.name);
    expect(res.body.user.emailVerified).toBe(true);

    // Verify cookies issued
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies.some((c) => c.includes('access_token'))).toBe(true);
    expect(cookies.some((c) => c.includes('refresh_token'))).toBe(true);

    // Verify user saved in MongoDB with googleId
    const dbUser = await User.findOne({ email: sampleGoogleClaims.email });
    expect(dbUser).not.toBeNull();
    expect(dbUser.googleId).toBe(sampleGoogleClaims.sub);
    expect(dbUser.emailVerified).toBe(true);

    // Verify audit log
    const event = await LoginEvent.findOne({ email: sampleGoogleClaims.email });
    expect(event).not.toBeNull();
    expect(event.method).toBe('google');
    expect(event.status).toBe('success');
  });

  it('links Google ID to existing Email OTP user with same verified email (NO duplicate user)', async () => {
    // 1. Existing user created prior via Email OTP
    const existingUser = await User.create({
      email: 'shailesh@example.com',
      name: 'Shailesh Singh',
      emailVerified: true
    });

    mockVerifyGoogleIdToken.mockResolvedValueOnce(sampleGoogleClaims);

    // 2. User logs in with Google
    const res = await request(app)
      .post('/auth/google')
      .send({ credential: 'valid_mock_google_id_token' }); // Also testing "credential" alias

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // 3. STRICT CHECK: No duplicate users in database
    const usersCount = await User.countDocuments({ email: 'shailesh@example.com' });
    expect(usersCount).toBe(1);

    // 4. Existing user document has been linked with googleId
    const updatedUser = await User.findById(existingUser._id);
    expect(updatedUser.googleId).toBe(sampleGoogleClaims.sub);
    expect(updatedUser.avatar).toBe(sampleGoogleClaims.picture);
  });

  it('rejects Google login if Google email is not verified', async () => {
    mockVerifyGoogleIdToken.mockResolvedValueOnce({
      ...sampleGoogleClaims,
      emailVerified: false
    });

    const res = await request(app)
      .post('/auth/google')
      .send({ idToken: 'unverified_email_token' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('not verified by Google');

    // No user should be created
    const count = await User.countDocuments();
    expect(count).toBe(0);
  });

  it('rejects invalid or tampered Google ID tokens with 401', async () => {
    mockVerifyGoogleIdToken.mockRejectedValueOnce(
      new Error('Wrong recipient, payload audience != client ID')
    );

    const res = await request(app)
      .post('/auth/google')
      .send({ idToken: 'forged_token' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('Google verification failed');

    // Failed audit event logged
    const failedEvent = await LoginEvent.findOne({ method: 'google', status: 'failure' });
    expect(failedEvent).not.toBeNull();
  });
});
