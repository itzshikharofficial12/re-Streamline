import React from 'react';
import Link from 'next/link';
import { Logo } from './Logo';

export function AuthBrandingPanel() {
  return (
    <section className="auth-left-panel" aria-label="Streamline Branding">
      <div className="auth-left-brand">
        <Link href="/" className="brand-link" aria-label="Streamline Home">
          <Logo variant="full" size={28} />
        </Link>
      </div>

      <div className="auth-hero-copy">
        <h1 className="auth-hero-title">
          Create.
          <br />
          Stream.
          <br />
          <span className="auth-highlight-cyan">Together.</span>
        </h1>
        <p className="auth-hero-desc">
          A seamless way to go live, collaborate and share with the world.
        </p>
      </div>

      <div className="auth-left-footer">
        <span className="auth-caption-line" aria-hidden="true" />
        <span className="auth-caption-text">BUILT FOR CREATORS</span>
      </div>
    </section>
  );
}

export default AuthBrandingPanel;
