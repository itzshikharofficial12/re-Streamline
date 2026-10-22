import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../src/app.js';

describe('Auth API Integration Tests', () => {
  const app = createApp();
  const testId = Date.now();
  const testUser = {
    email: `integration_test_${testId}@streamline.live`,
    username: `testuser_${testId}`,
    password: 'SuperSecurePassword123!'
  };

  it('POST /auth/signup — should create user and set secure HttpOnly cookies', async () => {
    const res = await request(app)
      .post('/auth/signup')
      .set('Origin', 'http://localhost:3000')
      .set('X-Requested-With', 'XMLHttpRequest')
      .send(testUser);

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.user.id);
    assert.equal(res.body.data.user.email, testUser.email);
    assert.equal(res.body.data.user.username, testUser.username);
    assert.equal(res.body.data.user.passwordHash, undefined); // Password hash must NEVER be returned

    // Verify Set-Cookie headers
    const cookies = res.headers['set-cookie'] as string[];
    assert.ok(cookies);
    const hasAccessToken = cookies.some(
      (c) => c.includes('access_token=') && c.includes('HttpOnly')
    );
    const hasRefreshToken = cookies.some(
      (c) => c.includes('refresh_token=') && c.includes('HttpOnly')
    );
    assert.equal(hasAccessToken, true, 'access_token cookie must be present and HttpOnly');
    assert.equal(hasRefreshToken, true, 'refresh_token cookie must be present and HttpOnly');
  });

  it('POST /auth/signup — should reject duplicate email registration with 409', async () => {
    const res = await request(app)
      .post('/auth/signup')
      .set('Origin', 'http://localhost:3000')
      .set('X-Requested-With', 'XMLHttpRequest')
      .send({
        email: testUser.email,
        username: `diff_${testId}`,
        password: 'AnotherPassword123!'
      });

    assert.equal(res.status, 409);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'EMAIL_TAKEN');
  });

  it('POST /auth/signup — should reject invalid email format', async () => {
    const res = await request(app)
      .post('/auth/signup')
      .set('Origin', 'http://localhost:3000')
      .set('X-Requested-With', 'XMLHttpRequest')
      .send({
        email: 'invalid-email',
        username: 'user123',
        password: 'Password123!'
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'VALIDATION_ERROR');
  });

  it('POST /auth/login — should authenticate with valid credentials', async () => {
    const res = await request(app)
      .post('/auth/login')
      .set('Origin', 'http://localhost:3000')
      .set('X-Requested-With', 'XMLHttpRequest')
      .send({
        email: testUser.email,
        password: testUser.password
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.user.email, testUser.email);
    assert.equal(res.body.data.user.passwordHash, undefined);

    const cookies = res.headers['set-cookie'] as string[];
    assert.ok(cookies);
  });

  it('POST /auth/login — should reject incorrect password with generic error', async () => {
    const res = await request(app)
      .post('/auth/login')
      .set('Origin', 'http://localhost:3000')
      .set('X-Requested-With', 'XMLHttpRequest')
      .send({
        email: testUser.email,
        password: 'WrongPassword123!'
      });

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'INVALID_CREDENTIALS');
  });

  it('POST /auth/login — should reject unknown account with identical generic error', async () => {
    const res = await request(app)
      .post('/auth/login')
      .set('Origin', 'http://localhost:3000')
      .set('X-Requested-With', 'XMLHttpRequest')
      .send({
        email: 'unknown_account_9999@streamline.live',
        password: 'SomePassword123!'
      });

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'INVALID_CREDENTIALS');
  });

  it('GET /auth/me — should reject unauthenticated requests with 401', async () => {
    const res = await request(app).get('/auth/me');

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'UNAUTHENTICATED');
  });

  it('GET /auth/me — should return authenticated user profile when valid cookie is provided', async () => {
    const loginRes = await request(app)
      .post('/auth/login')
      .set('Origin', 'http://localhost:3000')
      .set('X-Requested-With', 'XMLHttpRequest')
      .send({
        email: testUser.email,
        password: testUser.password
      });

    const cookies = loginRes.headers['set-cookie'] as string[];
    const accessCookie = cookies.find((c) => c.startsWith('access_token='));
    assert.ok(accessCookie);

    const meRes = await request(app).get('/auth/me').set('Cookie', [accessCookie]);

    assert.equal(meRes.status, 200);
    assert.equal(meRes.body.success, true);
    assert.equal(meRes.body.data.user.email, testUser.email);
  });

  it('POST /auth/refresh & Reuse Detection — rotation and family termination', async () => {
    // 1. Fresh login
    const loginRes = await request(app)
      .post('/auth/login')
      .set('Origin', 'http://localhost:3000')
      .set('X-Requested-With', 'XMLHttpRequest')
      .send({
        email: testUser.email,
        password: testUser.password
      });

    const loginCookies = loginRes.headers['set-cookie'] as string[];
    const initialRefreshCookie = loginCookies.find((c) => c.startsWith('refresh_token='));
    assert.ok(initialRefreshCookie);

    // 2. Successful refresh rotates token
    const refreshRes = await request(app)
      .post('/auth/refresh')
      .set('Origin', 'http://localhost:3000')
      .set('X-Requested-With', 'XMLHttpRequest')
      .set('Cookie', [initialRefreshCookie]);

    assert.equal(refreshRes.status, 200);
    assert.equal(refreshRes.body.success, true);

    const rotatedCookies = refreshRes.headers['set-cookie'] as string[];
    const secondRefreshCookie = rotatedCookies.find((c) => c.startsWith('refresh_token='));
    assert.ok(secondRefreshCookie);
    assert.notEqual(initialRefreshCookie, secondRefreshCookie);

    // 3. Reuse attempt with old rotated token triggers reuse detection
    const reuseRes = await request(app)
      .post('/auth/refresh')
      .set('Origin', 'http://localhost:3000')
      .set('X-Requested-With', 'XMLHttpRequest')
      .set('Cookie', [initialRefreshCookie]);

    assert.equal(reuseRes.status, 401);
    assert.equal(reuseRes.body.success, false);
    assert.equal(reuseRes.body.error.code, 'TOKEN_REUSE_DETECTED');

    // 4. Verification that entire token family was revoked
    const postReuseRes = await request(app)
      .post('/auth/refresh')
      .set('Origin', 'http://localhost:3000')
      .set('X-Requested-With', 'XMLHttpRequest')
      .set('Cookie', [secondRefreshCookie]);

    assert.equal(postReuseRes.status, 401);
    assert.equal(postReuseRes.body.success, false);
    assert.equal(postReuseRes.body.error.code, 'TOKEN_REUSE_DETECTED');
  });

  it('POST /auth/logout — should clear cookies and revoke refresh token', async () => {
    const loginRes = await request(app)
      .post('/auth/login')
      .set('Origin', 'http://localhost:3000')
      .set('X-Requested-With', 'XMLHttpRequest')
      .send({
        email: testUser.email,
        password: testUser.password
      });

    const cookies = loginRes.headers['set-cookie'] as string[];
    const refreshCookie = cookies.find((c) => c.startsWith('refresh_token='));
    assert.ok(refreshCookie);

    const logoutRes = await request(app)
      .post('/auth/logout')
      .set('Origin', 'http://localhost:3000')
      .set('X-Requested-With', 'XMLHttpRequest')
      .set('Cookie', [refreshCookie]);

    assert.equal(logoutRes.status, 200);
    assert.equal(logoutRes.body.success, true);

    // Refresh after logout must fail
    const refreshAfterLogout = await request(app)
      .post('/auth/refresh')
      .set('Origin', 'http://localhost:3000')
      .set('X-Requested-With', 'XMLHttpRequest')
      .set('Cookie', [refreshCookie]);

    assert.equal(refreshAfterLogout.status, 401);
  });

  it('CSRF Defense — should reject state-changing request from unauthorized origin', async () => {
    const res = await request(app)
      .post('/auth/login')
      .set('Origin', 'http://malicious-site.com')
      .send({
        email: testUser.email,
        password: testUser.password
      });

    assert.equal(res.status, 403);
    assert.equal(res.body.error.code, 'CSRF_ORIGIN_MISMATCH');
  });

  it('CSRF Defense — should reject cookie-authenticated state-changing request when X-Requested-With header is missing', async () => {
    const res = await request(app)
      .post('/auth/logout')
      .set('Origin', 'http://localhost:3000')
      .set('Cookie', ['access_token=some_token'])
      // Notice: NO X-Requested-With header!
      .send();

    assert.equal(res.status, 403);
    assert.equal(res.body.error.code, 'CSRF_HEADER_MISSING');
  });
});
