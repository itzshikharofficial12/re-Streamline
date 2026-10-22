import * as argon2 from 'argon2';
import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import crypto from 'node:crypto';

/**
 * Hash a plain text password using Argon2id
 */
export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536, // 64 MB
    timeCost: 3,
    parallelism: 4
  });
}

/**
 * Verify a plain text password against an Argon2id hash
 */
export async function verifyPassword(hash: string, plain: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, plain);
  } catch {
    return false;
  }
}

export interface AccessTokenPayload extends JWTPayload {
  sub: string;
  email: string;
  username: string;
  tokenPurpose: 'access';
}

export interface SignTokenOptions {
  secret: string;
  issuer?: string;
  audience?: string;
  expiresIn?: string; // e.g. "10m"
}

export interface VerifyTokenOptions {
  secret: string;
  issuer?: string;
  audience?: string;
}

/**
 * Sign a short-lived JWT access token
 */
export async function signAccessToken(
  claims: { userId: string; email: string; username: string },
  options: SignTokenOptions
): Promise<string> {
  const secretKey = new TextEncoder().encode(options.secret);
  const issuer = options.issuer || 'streamline';
  const audience = options.audience || 'streamline-app';
  const expiresIn = options.expiresIn || '10m';

  return new SignJWT({
    email: claims.email,
    username: claims.username,
    tokenPurpose: 'access'
  })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setSubject(claims.userId)
    .setIssuedAt()
    .setJti(crypto.randomUUID())
    .setIssuer(issuer)
    .setAudience(audience)
    .setExpirationTime(expiresIn)
    .sign(secretKey);
}

/**
 * Cryptographically verify and validate an access token
 */
export async function verifyAccessToken(
  token: string,
  options: VerifyTokenOptions
): Promise<AccessTokenPayload> {
  const secretKey = new TextEncoder().encode(options.secret);
  const issuer = options.issuer || 'streamline';
  const audience = options.audience || 'streamline-app';

  const { payload } = await jwtVerify(token, secretKey, {
    algorithms: ['HS256'],
    issuer,
    audience
  });

  if (payload.tokenPurpose !== 'access') {
    throw new Error('Invalid token purpose');
  }

  if (!payload.sub) {
    throw new Error('Token subject missing');
  }

  return payload as AccessTokenPayload;
}

/**
 * Generate a cryptographically secure random opaque refresh token (64 bytes hex)
 */
export function generateRefreshToken(): string {
  return crypto.randomBytes(64).toString('hex');
}

/**
 * Create a deterministic SHA-256 hash of an opaque refresh token for storage and lookup
 */
export function hashRefreshToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
