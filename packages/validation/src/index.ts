import { z } from 'zod';

/**
 * Standard password policy:
 * - Minimum 8 characters, maximum 128 characters
 * - No arbitrary symbol/capital forcing that encourages bad password habits (NIST SP 800-63B)
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .max(128, 'Password cannot exceed 128 characters');

/**
 * Email schema: lowercased, trimmed, valid format
 */
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email('Invalid email address')
  .max(255, 'Email cannot exceed 255 characters');

/**
 * Username schema (optional profile handle for creators/viewers)
 */
export const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters long')
  .max(30, 'Username cannot exceed 30 characters')
  .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
  .transform((val) => val.trim().toLowerCase());

/**
 * Signup request validation
 */
export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  username: usernameSchema
});

export type SignupInput = z.infer<typeof signupSchema>;

/**
 * Login request validation
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required')
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Waitlist request validation
 */
export const waitlistSchema = z.object({
  email: emailSchema,
  source: z.string().max(50).optional()
});

export type WaitlistInput = z.infer<typeof waitlistSchema>;
