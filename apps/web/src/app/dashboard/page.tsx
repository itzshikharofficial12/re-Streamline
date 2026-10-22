'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { SafeUser } from '@streamline/types';
import { api, ApiError } from '../../lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<SafeUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      try {
        const profile = await api.auth.getMe();
        if (mounted) {
          setUser(profile);
          setLoading(false);
        }
      } catch (err: unknown) {
        if (!mounted) return;
        if (err instanceof ApiError && err.status === 401) {
          // Unauthenticated or expired session — redirect to login
          router.replace('/login');
          return;
        }
        setError(err instanceof Error ? err.message : 'Failed to load profile');
        setLoading(false);
      }
    }

    loadUser();

    return () => {
      mounted = false;
    };
  }, [router]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await api.auth.logout();
    } catch {
      // Safely ignore logout network errors and clear client state
    } finally {
      router.replace('/login');
    }
  };

  if (loading) {
    return (
      <main className="container">
        <header>
          <h1>Streamline Dashboard</h1>
          <p>Loading authenticated profile...</p>
        </header>
        <section className="card">
          <p>Authenticating session...</p>
        </section>
      </main>
    );
  }

  if (error || !user) {
    return (
      <main className="container">
        <header>
          <h1>Streamline Dashboard</h1>
          <p>Session could not be established</p>
        </header>
        <section className="card">
          <div className="alert-error" role="alert">
            {error || 'You are not logged in.'}
          </div>
          <Link href="/login" className="btn-secondary" style={{ display: 'inline-block' }}>
            Go to Sign In
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="container">
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div>
          <h1>Streamline Dashboard</h1>
          <p>Authenticated Creator / Viewer Session</p>
        </div>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="btn-secondary"
          style={{ alignSelf: 'center' }}
        >
          {loggingOut ? 'Signing out...' : 'Sign Out'}
        </button>
      </header>

      <section className="card">
        <h2>Authenticated User Profile</h2>
        <p style={{ marginBottom: '1.25rem' }}>
          Identity loaded securely from the API via HttpOnly JWT authentication.
        </p>

        <dl>
          <dt>User ID</dt>
          <dd>{user.id}</dd>

          <dt>Email</dt>
          <dd>{user.email}</dd>

          <dt>Username</dt>
          <dd>{user.username}</dd>

          <dt>Account Created</dt>
          <dd>{new Date(user.createdAt).toLocaleString()}</dd>
        </dl>
      </section>

      <section className="card">
        <h2>Security Session Details</h2>
        <ul style={{ lineHeight: '1.8' }}>
          <li>
            <strong>Access Token:</strong> Short-lived 10-minute JWT held in HttpOnly cookie.
          </li>
          <li>
            <strong>Refresh Token:</strong> Cryptographically random 64-byte opaque token stored
            hashed in PostgreSQL.
          </li>
          <li>
            <strong>Rotation & Reuse Detection:</strong> Rotated atomically upon refresh; active
            token family revoked on reuse.
          </li>
          <li>
            <strong>Storage:</strong> No credentials or tokens stored in browser{' '}
            <code>localStorage</code> or <code>sessionStorage</code>.
          </li>
        </ul>
      </section>
    </main>
  );
}
