'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, ApiError } from '../../lib/api';
import { Logo } from '../../components/Logo';
import { AuthBrandingPanel } from '../../components/AuthBrandingPanel';

/**
 * Derive a valid username matching API usernameSchema:
 * - 3 to 30 characters
 * - Alphanumeric and underscores only (/^[a-zA-Z0-9_]+$/)
 */
function deriveUsername(name: string, email: string): string {
  let cleaned = name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');

  if (cleaned.length < 3) {
    const emailPrefix =
      email
        .split('@')[0]
        ?.toLowerCase()
        .replace(/[^a-z0-9_]/g, '') || '';
    cleaned = (cleaned + '_' + emailPrefix).replace(/^_+|_+$/g, '');
  }

  if (cleaned.length < 3) {
    cleaned = (cleaned + '_user').slice(0, 30);
  }

  return cleaned.slice(0, 30);
}

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleNameChange = (val: string) => {
    setName(val);
    if (nameError) setNameError(null);
    if (serverError) setServerError(null);
  };

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

    setNameError(null);
    setEmailError(null);
    setPasswordError(null);
    setServerError(null);

    const trimmedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    let hasValidationError = false;

    // Name validation
    if (!trimmedName) {
      setNameError('Name is required.');
      hasValidationError = true;
    } else if (trimmedName.length < 2) {
      setNameError('Name must be at least 2 characters.');
      hasValidationError = true;
    }

    // Email validation
    if (!normalizedEmail) {
      setEmailError('Email is required.');
      hasValidationError = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setEmailError('Please enter a valid email address.');
      hasValidationError = true;
    }

    // Password validation (NIST SP 800-63B policy: min 8 characters)
    if (!password) {
      setPasswordError('Password is required.');
      hasValidationError = true;
    } else if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters long.');
      hasValidationError = true;
    }

    if (hasValidationError) {
      return;
    }

    setLoading(true);

    const derivedUsername = deriveUsername(trimmedName, normalizedEmail);

    if (process.env.NODE_ENV !== 'production') {
      console.debug(
        '[Signup] Submitting registration for:',
        normalizedEmail,
        'username:',
        derivedUsername
      );
    }

    try {
      await api.auth.signup({
        email: normalizedEmail,
        username: derivedUsername,
        password
      });

      if (process.env.NODE_ENV !== 'production') {
        console.debug('[Signup] Registration succeeded. Redirecting to /dashboard...');
      }

      router.push('/dashboard');
    } catch (err: unknown) {
      if (process.env.NODE_ENV !== 'production') {
        console.error(
          '[Signup] Registration error received:',
          err instanceof Error ? err.message : err
        );
      }

      if (err instanceof ApiError) {
        if (err.code === 'EMAIL_TAKEN') {
          setEmailError('An account with this email already exists.');
        } else if (err.code === 'USERNAME_TAKEN') {
          setNameError('This name or username is already taken. Please choose another.');
        } else {
          setServerError(err.message);
        }
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

      {/* Right Signup Panel: Full-height, focused signup layout */}
      <section className="auth-right-panel" aria-label="Sign Up Area">
        <div className="auth-top-nav">
          <div className="auth-mobile-brand">
            <Link href="/" className="brand-link" aria-label="Streamline Home">
              <Logo variant="full" size={24} />
            </Link>
          </div>
          <div className="auth-switch-prompt">
            Already have an account?{' '}
            <Link href="/login" className="auth-switch-link">
              Log in
            </Link>
          </div>
        </div>

        <div className="auth-form-wrapper">
          <div className="auth-form-header">
            <h2 className="auth-form-title">Create your account</h2>
            <p className="auth-form-subtitle">Join Streamline and be part of what&apos;s next.</p>
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
            {/* Name Field */}
            <div className="auth-field">
              <label htmlFor="name" className="auth-label">
                Name
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
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </span>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Your name"
                  required
                  autoComplete="name"
                  disabled={loading}
                  className={`auth-input ${nameError ? 'has-error' : ''}`}
                  aria-invalid={!!nameError}
                  aria-describedby={nameError ? 'name-error' : undefined}
                />
              </div>
              {nameError && (
                <p id="name-error" className="auth-field-error" role="alert">
                  {nameError}
                </p>
              )}
            </div>

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
                  placeholder="Create a password"
                  required
                  autoComplete="new-password"
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
              {password.length > 0 && password.length < 8 && !passwordError && (
                <div className="auth-password-guidance" role="status">
                  <span className="auth-guidance-bullet" aria-hidden="true" />
                  <span>Must be at least 8 characters</span>
                </div>
              )}
            </div>

            {/* Primary Action Button */}
            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="auth-spinner" aria-hidden="true" />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span>Create account</span>
                  <span aria-hidden="true">→</span>
                </>
              )}
            </button>
          </form>

          {/* Terms & Privacy Statement */}
          <div className="auth-disclaimer">
            By creating an account, you agree to our{' '}
            <span className="auth-disclaimer-highlight">Terms of Service</span>
            <br />
            and <span className="auth-disclaimer-highlight">Privacy Policy</span>.
          </div>
        </div>

        <div className="auth-right-footer" />
      </section>
    </main>
  );
}
