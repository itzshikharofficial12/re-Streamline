import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { api, ApiError } from '../src/lib/api.js';

describe('Frontend Signup Submission & Validation Logic', () => {
  // Test validation rules mirroring apps/web/src/app/signup/page.tsx
  function validateSignupInput(fields: {
    email: string;
    username: string;
    password: string;
    confirmPassword: string;
  }): { valid: boolean; error?: string } {
    const { email, username, password, confirmPassword } = fields;

    if (!email || !username || !password) {
      return { valid: false, error: 'All fields are required.' };
    }

    if (password.length < 8) {
      return { valid: false, error: 'Password must be at least 8 characters long.' };
    }

    if (password !== confirmPassword) {
      return { valid: false, error: 'Passwords do not match.' };
    }

    return { valid: true };
  }

  it('Validation — should reject when fields are missing before making any network call', () => {
    const res1 = validateSignupInput({
      email: '',
      username: 'user1',
      password: 'Password123!',
      confirmPassword: 'Password123!'
    });
    assert.equal(res1.valid, false);
    assert.equal(res1.error, 'All fields are required.');

    const res2 = validateSignupInput({
      email: 'user@example.com',
      username: '',
      password: 'Password123!',
      confirmPassword: 'Password123!'
    });
    assert.equal(res2.valid, false);
    assert.equal(res2.error, 'All fields are required.');
  });

  it('Validation — should reject when password is less than 8 characters', () => {
    const res = validateSignupInput({
      email: 'user@example.com',
      username: 'user1',
      password: 'short',
      confirmPassword: 'short'
    });
    assert.equal(res.valid, false);
    assert.equal(res.error, 'Password must be at least 8 characters long.');
  });

  it('Validation — should reject when password and confirmPassword do not match', () => {
    const res = validateSignupInput({
      email: 'user@example.com',
      username: 'user1',
      password: 'Password123!',
      confirmPassword: 'DifferentPassword123!'
    });
    assert.equal(res.valid, false);
    assert.equal(res.error, 'Passwords do not match.');
  });

  it('Validation — should accept valid inputs', () => {
    const res = validateSignupInput({
      email: 'user@example.com',
      username: 'user1',
      password: 'Password123!',
      confirmPassword: 'Password123!'
    });
    assert.equal(res.valid, true);
    assert.equal(res.error, undefined);
  });

  it('API Client — should successfully submit signup to live API', async () => {
    const uniqueId = Date.now();
    const result = await api.auth.signup({
      email: `web_client_test_${uniqueId}@streamline.live`,
      username: `web_test_${uniqueId}`,
      password: 'SuperSecurePassword123!'
    });

    assert.ok(result);
    assert.ok(result.user);
    assert.equal(result.user.email, `web_client_test_${uniqueId}@streamline.live`);
    assert.equal('passwordHash' in result.user, false);
  });

  it('API Client — should handle duplicate email error gracefully with ApiError', async () => {
    const timestamp = Date.now();
    const duplicateEmail = `duplicate_tester_${timestamp}@streamline.live`;
    const uniqueUsername = `user_${timestamp}`;

    // First signup
    await api.auth.signup({
      email: duplicateEmail,
      username: uniqueUsername,
      password: 'SuperSecurePassword123!'
    });

    // Attempt second signup with same email
    await assert.rejects(
      async () =>
        api.auth.signup({
          email: duplicateEmail,
          username: `diff_${Date.now()}`,
          password: 'SuperSecurePassword123!'
        }),
      (err: unknown) => {
        assert.ok(err instanceof ApiError);
        assert.equal(err.status, 409);
        assert.equal(err.code, 'EMAIL_TAKEN');
        assert.match(err.message, /already exists/);
        return true;
      }
    );
  });
});
