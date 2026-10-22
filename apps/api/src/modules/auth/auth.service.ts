import crypto from 'node:crypto';
import {
  hashPassword,
  verifyPassword,
  signAccessToken,
  generateRefreshToken,
  hashRefreshToken
} from '@streamline/auth';
import { prisma } from '@streamline/database';
import type { SafeUser } from '@streamline/types';
import type { SignupInput, LoginInput } from '@streamline/validation';
import { config } from '../../config/env.js';

export interface AuthResult {
  user: SafeUser;
  accessToken: string;
  refreshToken: string;
}

export class AuthenticationError extends Error {
  constructor(
    public readonly code: string,
    message: string
  ) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class TokenReuseError extends AuthenticationError {
  constructor(public readonly familyId: string) {
    super(
      'TOKEN_REUSE_DETECTED',
      'Security warning: Refresh token reuse detected. All sessions in this family have been terminated.'
    );
    this.name = 'TokenReuseError';
  }
}

export class AuthService {
  /**
   * Helper to format a safe user object (excluding password hash)
   */
  private toSafeUser(user: {
    id: string;
    email: string;
    username: string;
    createdAt: Date;
    updatedAt: Date;
  }): SafeUser {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString()
    };
  }

  /**
   * Register a new user and establish a session
   */
  async signup(input: SignupInput): Promise<AuthResult> {
    // 1. Check for existing user with same email or username
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email: input.email }, { username: input.username }]
      }
    });

    if (existing) {
      if (existing.email === input.email) {
        throw new AuthenticationError('EMAIL_TAKEN', 'An account with this email already exists');
      }
      throw new AuthenticationError('USERNAME_TAKEN', 'This username is already taken');
    }

    // 2. Hash password using Argon2id
    const passwordHash = await hashPassword(input.password);

    // 3. Create user record
    const user = await prisma.user.create({
      data: {
        email: input.email,
        username: input.username,
        passwordHash
      }
    });

    // 4. Generate tokens and session
    return this.createSession(user);
  }

  /**
   * Authenticate an existing user with email and password
   */
  async login(input: LoginInput): Promise<AuthResult> {
    const user = await prisma.user.findUnique({
      where: { email: input.email }
    });

    // Use generic error message to prevent user enumeration
    if (!user) {
      throw new AuthenticationError('INVALID_CREDENTIALS', 'Invalid email or password');
    }

    const isValid = await verifyPassword(user.passwordHash, input.password);
    if (!isValid) {
      throw new AuthenticationError('INVALID_CREDENTIALS', 'Invalid email or password');
    }

    return this.createSession(user);
  }

  /**
   * Rotate refresh token atomically with token-family reuse detection
   */
  async refresh(rawRefreshToken: string): Promise<AuthResult> {
    const incomingHash = hashRefreshToken(rawRefreshToken);
    const now = new Date();

    try {
      return await prisma.$transaction(async (tx) => {
        // 1. Look up session by hashed token
        const session = await tx.refreshSession.findUnique({
          where: { hashedToken: incomingHash },
          include: { user: true }
        });

        if (!session) {
          throw new AuthenticationError('INVALID_REFRESH_TOKEN', 'Invalid refresh token');
        }

        // 2. Check for token reuse: if revokedAt is already set, this token was already rotated!
        if (session.revokedAt !== null) {
          throw new TokenReuseError(session.familyId);
        }

        // 3. Check expiration
        if (session.expiresAt < now) {
          await tx.refreshSession.update({
            where: { id: session.id },
            data: { revokedAt: now }
          });
          throw new AuthenticationError('TOKEN_EXPIRED', 'Refresh token has expired');
        }

        // 4. Token is active and valid: rotate it atomically
        const newRawRefreshToken = generateRefreshToken();
        const newHashedToken = hashRefreshToken(newRawRefreshToken);

        const expiresDays = config.refreshToken.expiresDays;
        const newExpiresAt = new Date(Date.now() + expiresDays * 24 * 60 * 60 * 1000);

        // Invalidate current token and link to replacement
        await tx.refreshSession.update({
          where: { id: session.id },
          data: {
            revokedAt: now,
            lastUsedAt: now,
            replacedBy: newHashedToken
          }
        });

        // Create new session in the same family
        await tx.refreshSession.create({
          data: {
            userId: session.userId,
            hashedToken: newHashedToken,
            familyId: session.familyId,
            expiresAt: newExpiresAt
          }
        });

        // Generate new short-lived JWT access token
        const accessToken = await signAccessToken(
          {
            userId: session.user.id,
            email: session.user.email,
            username: session.user.username
          },
          config.jwt
        );

        return {
          user: this.toSafeUser(session.user),
          accessToken,
          refreshToken: newRawRefreshToken
        };
      });
    } catch (err: unknown) {
      if (err instanceof TokenReuseError) {
        await prisma.refreshSession.updateMany({
          where: { familyId: err.familyId, revokedAt: null },
          data: { revokedAt: new Date() }
        });
      }
      throw err;
    }
  }

  /**
   * Invalidate a refresh token session
   */
  async logout(rawRefreshToken?: string): Promise<void> {
    if (!rawRefreshToken) return;

    try {
      const hashedToken = hashRefreshToken(rawRefreshToken);
      await prisma.refreshSession.updateMany({
        where: { hashedToken, revokedAt: null },
        data: { revokedAt: new Date() }
      });
    } catch {
      // Behave safely if token does not exist
    }
  }

  /**
   * Private helper to issue tokens and save a new refresh session
   */
  private async createSession(user: {
    id: string;
    email: string;
    username: string;
    createdAt: Date;
    updatedAt: Date;
  }): Promise<AuthResult> {
    const rawRefreshToken = generateRefreshToken();
    const hashedToken = hashRefreshToken(rawRefreshToken);
    const familyId = crypto.randomUUID();

    const expiresDays = config.refreshToken.expiresDays;
    const expiresAt = new Date(Date.now() + expiresDays * 24 * 60 * 60 * 1000);

    // Save hashed refresh token in database
    await prisma.refreshSession.create({
      data: {
        userId: user.id,
        hashedToken,
        familyId,
        expiresAt
      }
    });

    // Issue JWT access token
    const accessToken = await signAccessToken(
      {
        userId: user.id,
        email: user.email,
        username: user.username
      },
      config.jwt
    );

    return {
      user: this.toSafeUser(user),
      accessToken,
      refreshToken: rawRefreshToken
    };
  }
}

export const authService = new AuthService();
