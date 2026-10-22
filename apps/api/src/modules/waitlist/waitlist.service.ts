import { prisma, Prisma } from '@streamline/database';
import type { WaitlistInput } from '@streamline/validation';

export class WaitlistConflictError extends Error {
  code: string;

  constructor(message: string, code = 'ALREADY_REGISTERED') {
    super(message);
    this.name = 'WaitlistConflictError';
    this.code = code;
  }
}

export interface WaitlistRecord {
  id: string;
  email: string;
  status: string;
  source: string;
  createdAt: string;
}

export class WaitlistService {
  /**
   * Add a normalized email to the waitlist.
   * Handles pre-existence check and concurrent unique-constraint conflicts.
   */
  async join(input: WaitlistInput): Promise<WaitlistRecord> {
    const normalizedEmail = input.email.trim().toLowerCase();
    const source = (input.source || 'homepage').trim();

    // 1. Initial existence check
    const existing = await prisma.waitlistEntry.findUnique({
      where: { email: normalizedEmail }
    });

    if (existing) {
      throw new WaitlistConflictError("You're already on the list.", 'ALREADY_REGISTERED');
    }

    try {
      // 2. Persist to PostgreSQL
      const created = await prisma.waitlistEntry.create({
        data: {
          email: normalizedEmail,
          source,
          status: 'pending'
        }
      });

      return {
        id: created.id,
        email: created.email,
        status: created.status,
        source: created.source,
        createdAt: created.createdAt.toISOString()
      };
    } catch (err: unknown) {
      // 3. Handle race conditions where unique constraint fails at DB level
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002' // Unique constraint violation
      ) {
        throw new WaitlistConflictError("You're already on the list.", 'ALREADY_REGISTERED');
      }

      throw err;
    }
  }
}

export const waitlistService = new WaitlistService();
