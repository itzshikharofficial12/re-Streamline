import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  hashPassword,
  verifyPassword,
  signAccessToken,
  verifyAccessToken,
  generateRefreshToken,
  hashRefreshToken
} from './index.js';

describe('Password Hashing & Verification (Argon2id)', () => {
  it('should hash passwords using Argon2id and never store plaintext', async () => {
    const password = 'SuperSecretPassword123!';
    const hash = await hashPassword(password);

    assert.notEqual(hash, password);
    assert.match(hash, /^\$argon2id\$/); // Argon2id prefix
  });

  it('should produce different hashes for the same password due to salting', async () => {
    const password = 'SuperSecretPassword123!';
    const hash1 = await hashPassword(password);
    const hash2 = await hashPassword(password);

    assert.notEqual(hash1, hash2);
  });

  it('should verify valid passwords successfully', async () => {
    const password = 'SuperSecretPassword123!';
    const hash = await hashPassword(password);

    const isValid = await verifyPassword(hash, password);
    assert.equal(isValid, true);
  });

  it('should reject incorrect passwords', async () => {
    const password = 'SuperSecretPassword123!';
    const hash = await hashPassword(password);

    const isValid = await verifyPassword(hash, 'WrongPassword123!');
    assert.equal(isValid, false);
  });
});

describe('JWT Access Token Signing & Verification', () => {
  const secret = 'test_jwt_secret_with_at_least_32_characters_long_entropy';
  const config = {
    secret,
    issuer: 'streamline-test',
    audience: 'streamline-test-app',
    expiresIn: '10m'
  };

  const payload = {
    userId: 'user-uuid-1234',
    email: 'creator@streamline.live',
    username: 'creator123'
  };

  it('should sign and successfully verify a valid JWT access token', async () => {
    const token = await signAccessToken(payload, config);
    assert.ok(token);
    assert.equal(token.split('.').length, 3); // header.payload.signature

    const verified = await verifyAccessToken(token, config);
    assert.equal(verified.sub, payload.userId);
    assert.equal(verified.email, payload.email);
    assert.equal(verified.username, payload.username);
    assert.equal(verified.iss, config.issuer);
    assert.equal(verified.aud, config.audience);
    assert.equal(verified.tokenPurpose, 'access');
    assert.ok(verified.iat);
    assert.ok(verified.exp);
    assert.ok(verified.jti);
  });

  it('should reject a token with an invalid signature', async () => {
    const token = await signAccessToken(payload, config);
    const tamperedToken = token.slice(0, -5) + 'xxxxx';

    await assert.rejects(
      async () => verifyAccessToken(tamperedToken, config),
      /signature verification failed|Invalid or expired token/
    );
  });

  it('should reject a token with the wrong issuer', async () => {
    const token = await signAccessToken(payload, config);

    await assert.rejects(
      async () =>
        verifyAccessToken(token, {
          ...config,
          issuer: 'wrong-issuer'
        }),
      /unexpected "iss" claim value|Invalid or expired token/
    );
  });

  it('should reject a token with the wrong audience', async () => {
    const token = await signAccessToken(payload, config);

    await assert.rejects(
      async () =>
        verifyAccessToken(token, {
          ...config,
          audience: 'wrong-audience'
        }),
      /unexpected "aud" claim value|Invalid or expired token/
    );
  });

  it('should reject an expired token', async () => {
    const expiredToken = await signAccessToken(payload, {
      ...config,
      expiresIn: '-1s' // Expired in the past
    });

    await assert.rejects(
      async () => verifyAccessToken(expiredToken, config),
      /"exp" claim timestamp check failed|Invalid or expired token/
    );
  });

  it('should reject malformed tokens', async () => {
    await assert.rejects(
      async () => verifyAccessToken('not-a-real-jwt', config),
      /Invalid Compact JWS|Invalid or expired token/
    );
  });
});

describe('Opaque Refresh Tokens', () => {
  it('should generate a 64-byte cryptographically random hex token', () => {
    const token = generateRefreshToken();
    assert.equal(typeof token, 'string');
    assert.equal(token.length, 128); // 64 bytes = 128 hex chars
  });

  it('should generate unique refresh tokens on successive calls', () => {
    const token1 = generateRefreshToken();
    const token2 = generateRefreshToken();
    assert.notEqual(token1, token2);
  });

  it('should hash refresh tokens deterministically with SHA-256', () => {
    const token = generateRefreshToken();
    const hash1 = hashRefreshToken(token);
    const hash2 = hashRefreshToken(token);

    assert.equal(hash1, hash2);
    assert.equal(hash1.length, 64); // 256 bits = 64 hex chars
    assert.notEqual(hash1, token);
  });
});
