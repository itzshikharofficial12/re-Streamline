/**
 * Common Health Check Response Contract
 */
export interface HealthResponse {
  status: 'ok' | 'degraded' | 'error';
  uptime: number;
  timestamp: string;
  service: string;
  version: string;
  environment: string;
}

/**
 * Standard API Response Envelope
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: Record<string, unknown>;
}

/**
 * Safe User Profile (never includes password hashes or internal secrets)
 */
export interface SafeUser {
  id: string;
  email: string;
  username: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Auth Session Response
 */
export interface AuthResponse {
  user: SafeUser;
}
