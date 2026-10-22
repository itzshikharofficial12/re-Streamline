import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { api, ApiError } from '../src/lib/api.js';

describe('Frontend Waitlist Submission & Validation Logic', () => {
  function validateWaitlistEmail(email: string): { valid: boolean; error?: string } {
    const trimmed = email.trim();
    if (!trimmed) {
      return { valid: false, error: 'Please enter your email address.' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      return { valid: false, error: 'Please enter a valid email address.' };
    }

    return { valid: true };
  }

  it('Validation — should reject empty email without making a network call', () => {
    const res = validateWaitlistEmail('');
    assert.equal(res.valid, false);
    assert.equal(res.error, 'Please enter your email address.');

    const resWhitespace = validateWaitlistEmail('    ');
    assert.equal(resWhitespace.valid, false);
    assert.equal(resWhitespace.error, 'Please enter your email address.');
  });

  it('Validation — should reject malformed email formats', () => {
    const invalidEmails = ['invalid', 'test@', '@domain.com', 'test@domain', 'user@.com'];
    for (const email of invalidEmails) {
      const res = validateWaitlistEmail(email);
      assert.equal(res.valid, false, `Expected "${email}" to be invalid`);
      assert.equal(res.error, 'Please enter a valid email address.');
    }
  });

  it('Validation — should accept valid email addresses', () => {
    const validEmails = [
      'person@example.com',
      '  user@streamline.live  ',
      'creator+test@sub.domain.co'
    ];
    for (const email of validEmails) {
      const res = validateWaitlistEmail(email);
      assert.equal(res.valid, true, `Expected "${email}" to be valid`);
      assert.equal(res.error, undefined);
    }
  });

  it('API Client — should successfully submit waitlist join to live API', async () => {
    const uniqueEmail = `web_waitlist_test_${Date.now()}@streamline.live`;
    const result = await api.waitlist.join({ email: uniqueEmail });

    assert.ok(result);
    assert.ok(result.entry);
    assert.equal(result.entry.email, uniqueEmail.toLowerCase());
    assert.equal(result.entry.status, 'pending');
  });

  it('API Client — should handle duplicate email error gracefully with ApiError (409)', async () => {
    const duplicateEmail = `web_duplicate_${Date.now()}@streamline.live`;

    // First submission
    await api.waitlist.join({ email: duplicateEmail });

    // Second submission with same email
    await assert.rejects(
      async () => api.waitlist.join({ email: duplicateEmail }),
      (err: unknown) => {
        assert.ok(err instanceof ApiError);
        assert.equal(err.status, 409);
        assert.equal(err.code, 'ALREADY_REGISTERED');
        assert.equal(err.message, "You're already on the list.");
        return true;
      }
    );
  });

  it('Error Handling — should map server/network failure to general error state', async () => {
    // Test the state reducer logic matching Hero.tsx
    let uiState: 'idle' | 'loading' | 'success' | 'already_registered' = 'idle';
    let errorMessage: string | null = null;

    async function submitEmail(mockCall: () => Promise<unknown>) {
      uiState = 'loading';
      try {
        await mockCall();
        uiState = 'success';
      } catch (err: unknown) {
        if (err instanceof ApiError && (err.code === 'ALREADY_REGISTERED' || err.status === 409)) {
          uiState = 'already_registered';
          return;
        }
        uiState = 'idle';
        errorMessage = 'Something went wrong. Please try again.';
      }
    }

    // 1. Simulate 500 server error
    await submitEmail(async () => {
      throw new ApiError('Internal server error', 'INTERNAL_ERROR', 500);
    });
    assert.equal(uiState, 'idle');
    assert.equal(errorMessage, 'Something went wrong. Please try again.');

    // 2. Simulate network disconnection error
    await submitEmail(async () => {
      throw new TypeError('Failed to fetch');
    });
    assert.equal(uiState, 'idle');
    assert.equal(errorMessage, 'Something went wrong. Please try again.');
  });
});

