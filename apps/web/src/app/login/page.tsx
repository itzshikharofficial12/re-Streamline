'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, ApiError } from '../../lib/api';
import { Logo } from '../../components/Logo';
import { AuthBrandingPanel } from '../../components/AuthBrandingPanel';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleEmailChange = (val: string) => {
    setEmail(val);
    if (emailError) setEmailError(null);
    if (serverError) setServerError(null);
  };

  const handlePasswordChange = (val: string) => {
    setPassword(val);
    if (passwordError) setPasswordError(null);
    if (serverError) setServerError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setEmailError(null);
    setPasswordError(null);
    setServerError(null);

    const normalizedEmail = email.trim().toLowerCase();
    let hasValidationError = false;

    // Email validation
    if (!normalizedEmail) {
      setEmailError('Email is required.');
      hasValidationError = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setEmailError('Please enter a valid email address.');
      hasValidationError = true;
    }

    // Password validation
    if (!password) {
      setPasswordError('Password is required.');
      hasValidationError = true;
    }

    if (hasValidationError) {
      return;
    }

    setLoading(true);

    if (process.env.NODE_ENV !== 'production') {
      console.debug('[Login] Submitting login request for:', normalizedEmail);
    }

    try {
      await api.auth.login({
        email: normalizedEmail,
        password
      });

      if (process.env.NODE_ENV !== 'production') {
        console.debug('[Login] Login successful. Redirecting to /dashboard...');
      }

      router.push('/dashboard');
    } catch (err: unknown) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('[Login] Authentication failure:', err instanceof Error ? err.message : err);
      }

      if (err instanceof ApiError) {
        setServerError(err.message);
      } else {
        setServerError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-viewport">
      {/* Left Branding Panel: Reusable across auth pages */}
      <AuthBrandingPanel />

      {/* Right Login Panel: Full-height, focused login layout */}
      <section className="auth-right-panel" aria-label="Sign In Area">
        <div className="auth-top-nav">
          <div className="auth-mobile-brand">
            <Link href="/" className="brand-link" aria-label="Streamline Home">
              <Logo variant="full" size={24} />
            </Link>
          </div>
          <div className="auth-switch-prompt">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="auth-switch-link">
              Sign up
            </Link>
          </div>
        </div>

        <div className="auth-form-wrapper">
          <div className="auth-form-header">
            <h2 className="auth-form-title">Welcome back</h2>
            <p className="auth-form-subtitle">Log in to continue to Streamline.</p>
          </div>

          {serverError && (
            <div className="auth-alert-error" role="alert" aria-live="polite">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="auth-alert-icon"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} action="javascript:void(0);" noValidate>
            {/* Email Field */}
            <div className="auth-field">
              <label htmlFor="email" className="auth-label">
                Email
              </label>
              <div className="auth-input-container">
                <span className="auth-input-icon" aria-hidden="true">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  disabled={loading}
                  className={`auth-input ${emailError ? 'has-error' : ''}`}
                  aria-invalid={!!emailError}
                  aria-describedby={emailError ? 'email-error' : undefined}
                />
              </div>
              {emailError && (
                <p id="email-error" className="auth-field-error" role="alert">
                  {emailError}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="auth-field">
              <div className="auth-label-row">
                <label htmlFor="password" className="auth-label">
                  Password
                </label>
              </div>
              <div className="auth-input-container">
                <span className="auth-input-icon" aria-hidden="true">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  disabled={loading}
                  className={`auth-input ${passwordError ? 'has-error' : ''}`}
                  aria-invalid={!!passwordError}
                  aria-describedby={passwordError ? 'password-error' : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="auth-password-toggle"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                      <line x1="2" y1="2" x2="22" y2="22" />
                    </svg>
                  ) : (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {passwordError && (
                <p id="password-error" className="auth-field-error" role="alert">
                  {passwordError}
                </p>
              )}
            </div>

            {/* Primary Action Button */}
            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="auth-spinner" aria-hidden="true" />
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <span>Log in</span>
                  <span aria-hidden="true">→</span>
                </>
              )}
            </button>
          </form>
        </div>

        <div className="auth-right-footer" />
      </section>
    </main>
  );
}
