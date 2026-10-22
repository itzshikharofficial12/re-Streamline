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

  // Test current 3-field signup validation logic (Name, Email, Password)
  function validateCurrentSignupFields(fields: { name: string; email: string; password: string }): {
    nameError?: string;
    emailError?: string;
    passwordError?: string;
    valid: boolean;
  } {
    const trimmedName = fields.name.trim();
    const normalizedEmail = fields.email.trim().toLowerCase();
    let valid = true;
    let nameError: string | undefined;
    let emailError: string | undefined;
    let passwordError: string | undefined;

    if (!trimmedName) {
      nameError = 'Name is required.';
      valid = false;
    } else if (trimmedName.length < 2) {
      nameError = 'Name must be at least 2 characters.';
      valid = false;
    }

    if (!normalizedEmail) {
      emailError = 'Email is required.';
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      emailError = 'Please enter a valid email address.';
      valid = false;
    }

    if (!fields.password) {
      passwordError = 'Password is required.';
      valid = false;
    } else if (fields.password.length < 8) {
      passwordError = 'Password must be at least 8 characters long.';
      valid = false;
    }

    return { valid, nameError, emailError, passwordError };
  }

  function deriveUsername(name: string, email: string): string {
    let cleaned = name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '');

    if (cleaned.length < 3) {
      const emailPrefix =
        email
          .split('@')[0]
          ?.toLowerCase()
          .replace(/[^a-z0-9_]/g, '') || '';
      cleaned = (cleaned + '_' + emailPrefix).replace(/^_+|_+$/g, '');
    }

    if (cleaned.length < 3) {
      cleaned = (cleaned + '_user').slice(0, 30);
    }

    return cleaned.slice(0, 30);
  }

  it('3-Field Form Validation — should validate name, email, and password independently', () => {
    const emptyRes = validateCurrentSignupFields({ name: '', email: '', password: '' });
    assert.equal(emptyRes.valid, false);
    assert.equal(emptyRes.nameError, 'Name is required.');
    assert.equal(emptyRes.emailError, 'Email is required.');
    assert.equal(emptyRes.passwordError, 'Password is required.');

    const invalidEmailRes = validateCurrentSignupFields({
      name: 'Alex Rivera',
      email: 'not-an-email',
      password: 'StrongPassword123!'
    });
    assert.equal(invalidEmailRes.valid, false);
    assert.equal(invalidEmailRes.emailError, 'Please enter a valid email address.');
    assert.equal(invalidEmailRes.nameError, undefined);
    assert.equal(invalidEmailRes.passwordError, undefined);

    const shortPassRes = validateCurrentSignupFields({
      name: 'Alex Rivera',
      email: 'alex@streamline.live',
      password: 'short'
    });
    assert.equal(shortPassRes.valid, false);
    assert.equal(shortPassRes.passwordError, 'Password must be at least 8 characters long.');

    const validRes = validateCurrentSignupFields({
      name: 'Alex Rivera',
      email: 'alex@streamline.live',
      password: 'StrongPassword123!'
    });
    assert.equal(validRes.valid, true);
    assert.equal(validRes.nameError, undefined);
    assert.equal(validRes.emailError, undefined);
    assert.equal(validRes.passwordError, undefined);
  });

  it('deriveUsername helper — should format names into valid API usernames', () => {
    assert.equal(deriveUsername('Alex Rivera', 'alex@streamline.live'), 'alex_rivera');
    assert.equal(deriveUsername('creator_99', 'user@streamline.live'), 'creator_99');
    const shortDerive = deriveUsername('Al', 'capone@streamline.live');
    assert.ok(shortDerive.length >= 3 && shortDerive.length <= 30);
    assert.match(shortDerive, /^[a-zA-Z0-9_]+$/);
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
