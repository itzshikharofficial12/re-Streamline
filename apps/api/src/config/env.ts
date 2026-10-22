import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Load environment variables from repository root .env if not already set
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });
dotenv.config(); // fallback to cwd .env

export interface AppConfig {
  port: number;
  frontendUrl: string;
  jwt: {
    secret: string;
    issuer: string;
    audience: string;
    expiresIn: string;
  };
  refreshToken: {
    expiresDays: number;
  };
  cookie: {
    secure: boolean;
    sameSite: 'lax' | 'strict' | 'none';
  };
}

const jwtSecret =
  process.env.JWT_SECRET ||
  'streamline_dev_secret_key_needs_to_be_at_least_32_characters_long_min_256_bits';

if (
  process.env.NODE_ENV === 'production' &&
  (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32)
) {
  throw new Error('FATAL: JWT_SECRET must be set and be at least 32 characters in production');
}

export const config: AppConfig = {
  port: Number(process.env.API_PORT || process.env.PORT || 4000),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  jwt: {
    secret: jwtSecret,
    issuer: process.env.JWT_ISSUER || 'streamline',
    audience: process.env.JWT_AUDIENCE || 'streamline-app',
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '10m'
  },
  refreshToken: {
    expiresDays: Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS || 30)
  },
  cookie: {
    secure: process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production',
    sameSite: (process.env.COOKIE_SAME_SITE as 'lax' | 'strict' | 'none') || 'lax'
  }
};
