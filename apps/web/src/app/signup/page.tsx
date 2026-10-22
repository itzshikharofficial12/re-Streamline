'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, ApiError } from '../../lib/api';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setError(null);

    if (process.env.NODE_ENV !== 'production') {
      console.debug('[Signup] Submission initiated for email:', email.trim().toLowerCase());
    }

    // Client-side validation checks
    if (!email || !username || !password) {
      setError('All fields are required.');
      if (process.env.NODE_ENV !== 'production') {
        console.debug('[Signup] Validation rejected: missing fields');
      }
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      if (process.env.NODE_ENV !== 'production') {
        console.debug('[Signup] Validation rejected: password length < 8');
      }
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      if (process.env.NODE_ENV !== 'production') {
        console.debug('[Signup] Validation rejected: passwords do not match');
      }
      return;
    }

    if (process.env.NODE_ENV !== 'production') {
      console.debug('[Signup] Client validation passed. Sending API signup request...');
    }

    setLoading(true);

    try {
      await api.auth.signup({
        email: email.trim().toLowerCase(),
        username: username.trim(),
        password
      });

      if (process.env.NODE_ENV !== 'production') {
        console.debug('[Signup] Registration succeeded. Redirecting to /dashboard...');
      }

      // On successful signup, session cookies are set; redirect to dashboard
      router.push('/dashboard');
    } catch (err: unknown) {
      if (process.env.NODE_ENV !== 'production') {
        console.error(
          '[Signup] Registration error received:',
          err instanceof Error ? err.message : err
        );
      }

      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <header>
        <h1>Streamline — Create Account</h1>
        <p>Register as a creator or viewer on Streamline</p>
      </header>

      <section className="card" style={{ maxWidth: '440px', margin: '0 auto' }}>
        <h2>Sign Up</h2>

        {error && (
          <div className="alert-error" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} action="javascript:void(0);" noValidate>
          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="creator_handle"
              required
              autoComplete="username"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              required
              autoComplete="new-password"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-type your password"
              required
              autoComplete="new-password"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ marginTop: '0.5rem' }}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="form-footer">
          Already have an account? <Link href="/login">Sign In</Link>
        </div>
      </section>
    </main>
  );
}
