'use client';

import React, { useState } from 'react';
import { api, ApiError } from '../lib/api';

type WaitlistState = 'idle' | 'loading' | 'success' | 'already_registered';

export function Hero() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<WaitlistState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (state === 'loading') return;

    setErrorMessage(null);

    const trimmed = email.trim();
    if (!trimmed) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    // Basic client-side email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setState('loading');

    try {
      await api.waitlist.join({ email: trimmed, source: 'homepage' });
      // State A: New email successfully saved
      setState('success');
    } catch (err: unknown) {
      if (err instanceof ApiError && (err.code === 'ALREADY_REGISTERED' || err.status === 409)) {
        // State B: Email already registered
        setState('already_registered');
        return;
      }

      // State C: Server or network error
      setState('idle');
      setErrorMessage('Something went wrong. Please try again.');
    }
  };

  const handleReset = () => {
    setState('idle');
    setEmail('');
    setErrorMessage(null);
  };

  return (
    <section className="hero-section" aria-labelledby="hero-title">
      <div className="hero-content">
        {/* Status Badge */}
        <div className="status-pill" role="status" aria-label="Current status: In Development">
          <span className="status-dot" aria-hidden="true" />
          <span className="status-text">IN DEVELOPMENT</span>
        </div>

        {/* Primary Headline */}
        <h1 id="hero-title" className="hero-headline">
          The future of <br className="hero-br" />
          streaming is being built.
        </h1>

        {/* Supporting Copy */}
        <p className="hero-description">
          A new way to stream, connect, and build your community — directly from your browser.
          We&apos;re working hard to bring it to you soon.
        </p>

        {/* Waitlist Form Area */}
        <div className="waitlist-area">
          {state === 'success' ? (
            <div className="waitlist-status-card" role="status" aria-live="polite">
              <div className="waitlist-status-icon" aria-hidden="true">
                ✓
              </div>
              <h2 className="waitlist-status-title">You&apos;re on the list!</h2>
              <p className="waitlist-status-desc">
                We&apos;ll let you know when Streamline is ready.
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="waitlist-reset-btn"
                aria-label="Register another email"
              >
                Join with another email
              </button>
            </div>
          ) : state === 'already_registered' ? (
            <div
              className="waitlist-status-card waitlist-status-card-notice"
              role="status"
              aria-live="polite"
            >
              <div className="waitlist-status-icon" aria-hidden="true">
                ℹ
              </div>
              <h2 className="waitlist-status-title">You&apos;re already on the list.</h2>
              <p className="waitlist-status-desc">
                We&apos;ll let you know when Streamline is ready.
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="waitlist-reset-btn"
                aria-label="Register another email"
              >
                Join with another email
              </button>
            </div>
          ) : (
            <>
              <form
                onSubmit={handleSubmit}
                className="waitlist-form"
                noValidate
                aria-label="Waitlist notification signup"
              >
                <label htmlFor="waitlist-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="waitlist-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="Enter your email address"
                  className="waitlist-input"
                  autoComplete="email"
                  spellCheck="false"
                  disabled={state === 'loading'}
                  aria-describedby={errorMessage ? 'waitlist-error' : 'waitlist-subtext'}
                  aria-invalid={errorMessage ? 'true' : 'false'}
                />
                <button type="submit" className="waitlist-button" disabled={state === 'loading'}>
                  {state === 'loading' ? 'Joining...' : 'Get notified'}
                </button>
              </form>

              {errorMessage && (
                <div
                  id="waitlist-error"
                  className="waitlist-feedback waitlist-feedback-error"
                  role="alert"
                >
                  {errorMessage}
                </div>
              )}

              <p id="waitlist-subtext" className="waitlist-subtext">
                Join the waitlist to be the first to know.
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export default Hero;
