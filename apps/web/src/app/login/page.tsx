'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, ApiError } from '../../lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setError(null);

    if (process.env.NODE_ENV !== 'production') {
      console.debug('[Login] Submission initiated for email:', email.trim().toLowerCase());
    }

    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }

    setLoading(true);

    try {
      await api.auth.login({
        email: email.trim().toLowerCase(),
        password
      });

      if (process.env.NODE_ENV !== 'production') {
        console.debug('[Login] Authentication succeeded. Redirecting to /dashboard...');
      }

      // Cookies are set on successful login; redirect to dashboard
      router.push('/dashboard');
    } catch (err: unknown) {
      if (process.env.NODE_ENV !== 'production') {
        console.error(
          '[Login] Authentication error received:',
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
        <h1>Streamline — Sign In</h1>
        <p>Access your live broadcasting and account settings</p>
      </header>

      <section className="card" style={{ maxWidth: '440px', margin: '0 auto' }}>
        <h2>Sign In</h2>

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
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              required
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ marginTop: '0.5rem' }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="form-footer">
          Don&apos;t have an account? <Link href="/signup">Sign Up</Link>
        </div>
      </section>
    </main>
  );
}
