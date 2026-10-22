import type { SafeUser, AuthResponse, WaitlistResponse } from '@streamline/types';
import type { SignupInput, LoginInput, WaitlistInput } from '@streamline/validation';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export class ApiError extends Error {
  code: string;
  status: number;
  details?: unknown;

  constructor(message: string, code: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

let isRefreshing = false;
let refreshSubscribers: ((success: boolean) => void)[] = [];

function subscribeTokenRefresh(cb: (success: boolean) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(success: boolean) {
  refreshSubscribers.forEach((cb) => cb(success));
  refreshSubscribers = [];
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  isRetry = false
): Promise<T> {
  const url = `${API_URL}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    ...((options.headers as Record<string, string>) || {})
  };

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include' // Send and receive HttpOnly cookies
  });

  // Handle 401 Unauthorized with token refresh if not already an auth route
  const isAuthRoute =
    endpoint.startsWith('/auth/login') ||
    endpoint.startsWith('/auth/signup') ||
    endpoint.startsWith('/auth/refresh') ||
    endpoint.startsWith('/auth/logout');

  if (response.status === 401 && !isAuthRoute && !isRetry) {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          },
          credentials: 'include'
        });

        if (refreshRes.ok) {
          isRefreshing = false;
          onRefreshed(true);
          return request<T>(endpoint, options, true);
        } else {
          isRefreshing = false;
          onRefreshed(false);
        }
      } catch {
        isRefreshing = false;
        onRefreshed(false);
      }
    } else {
      // Wait for the ongoing refresh to finish
      const retryPromise = new Promise<T>((resolve, reject) => {
        subscribeTokenRefresh((success) => {
          if (success) {
            resolve(request<T>(endpoint, options, true));
          } else {
            reject(new ApiError('Session expired', 'SESSION_EXPIRED', 401));
          }
        });
      });
      return retryPromise;
    }
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = data?.error;
    throw new ApiError(
      error?.message || `Request failed with status ${response.status}`,
      error?.code || 'API_ERROR',
      response.status,
      error?.details
    );
  }

  return data;
}

export const api = {
  get: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined
    }),

  auth: {
    signup: async (data: SignupInput): Promise<AuthResponse> => {
      const res = await api.post<{ success: true; data: AuthResponse }>('/auth/signup', data);
      return res.data;
    },

    login: async (data: LoginInput): Promise<AuthResponse> => {
      const res = await api.post<{ success: true; data: AuthResponse }>('/auth/login', data);
      return res.data;
    },

    refresh: async (): Promise<AuthResponse> => {
      const res = await api.post<{ success: true; data: AuthResponse }>('/auth/refresh');
      return res.data;
    },

    logout: async (): Promise<void> => {
      await api.post('/auth/logout');
    },

    getMe: async (): Promise<SafeUser> => {
      const res = await api.get<{ success: true; data: { user: SafeUser } }>('/auth/me');
      return res.data.user;
    }
  },

  waitlist: {
    join: async (data: WaitlistInput): Promise<WaitlistResponse> => {
      const res = await api.post<{ success: true; data: WaitlistResponse }>('/waitlist', data);
      return res.data;
    }
  }
};
