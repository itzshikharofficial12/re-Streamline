'use client';

import { useState } from 'react';
import type { HealthResponse } from '@streamline/types';

export default function HomePage() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkApiHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const res = await fetch(`${apiUrl}/health`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const data: HealthResponse = await res.json();
      setHealth(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to reach API');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <header>
        <h1>Streamline — Development Foundation</h1>
        <p>Browser-based live video streaming platform monorepo</p>
      </header>

      <section className="card">
        <h2>Milestone Status</h2>
        <p style={{ marginBottom: '1rem' }}>
          <span className="badge">Milestone 1 — Monorepo Foundation</span>
        </p>
        <dl>
          <dt>Frontend App</dt>
          <dd>Next.js 14 / React 18 (@streamline/web)</dd>
          <dt>Backend API</dt>
          <dd>Node.js / Express (@streamline/api)</dd>
          <dt>Shared Packages</dt>
          <dd>@streamline/config, @streamline/types</dd>
          <dt>Orchestration</dt>
          <dd>pnpm workspaces + Turborepo</dd>
        </dl>
      </section>

      <section className="card">
        <h2>API Connectivity Verification</h2>
        <p style={{ marginBottom: '1rem' }}>
          Test the connection between this web client and the backend API service.
        </p>

        <button
          onClick={checkApiHealth}
          disabled={loading}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#38bdf8',
            color: '#0b1020',
            border: 'none',
            borderRadius: '4px',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            marginBottom: '1rem'
          }}
        >
          {loading ? 'Checking...' : 'Check API Health (GET /health)'}
        </button>

        {health && (
          <div style={{ marginTop: '0.5rem' }}>
            <p style={{ color: '#34d399', fontWeight: 600, marginBottom: '0.5rem' }}>
              API Status: {health.status.toUpperCase()}
            </p>
            <pre
              style={{
                background: '#0b1020',
                padding: '0.75rem',
                borderRadius: '4px',
                fontSize: '0.8125rem',
                overflowX: 'auto'
              }}
            >
              {JSON.stringify(health, null, 2)}
            </pre>
          </div>
        )}

        {error && (
          <p style={{ color: '#f87171', marginTop: '0.5rem', fontFamily: 'var(--font-mono)' }}>
            Error: {error}
          </p>
        )}
      </section>

      <section className="card">
        <h2>Planned Pipelines (Upcoming Milestones)</h2>
        <ul>
          <li>
            Browser Creator Studio media capture via <code>getUserMedia()</code>
          </li>
          <li>WebRTC publishing to MediaMTX gateway</li>
          <li>FFmpeg adaptive bitrate HLS transcoding</li>
          <li>
            Viewer playback with <code>hls.js</code> and HTML5 video
          </li>
        </ul>
      </section>
    </main>
  );
}
