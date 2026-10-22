import React from 'react';
import Link from 'next/link';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { SpaceBackground } from '../../components/SpaceBackground';

export default function AboutPage() {
  return (
    <div className="landing-viewport">
      <SpaceBackground />
      <Header />

      <main className="about-main">
        <section className="about-card">
          <div className="status-pill" style={{ marginBottom: '1.25rem' }}>
            <span className="status-dot" aria-hidden="true" />
            <span className="status-text">ABOUT STREAMLINE</span>
          </div>

          <h1 className="about-title">A modern streaming platform for creators</h1>

          <p className="about-text">
            Streamline is an open-source live video streaming infrastructure platform designed to
            enable seamless in-browser broadcasting without requiring complex external software like
            OBS.
          </p>

          <div className="about-pillars">
            <div className="pillar">
              <h3>Browser Ingest</h3>
              <p>Capture camera and screen audio/video directly through standard web APIs.</p>
            </div>
            <div className="pillar">
              <h3>Adaptive HLS</h3>
              <p>Scalable transcoding and multi-bitrate live video distribution.</p>
            </div>
            <div className="pillar">
              <h3>Community First</h3>
              <p>Real-time chat, moderation controls, and low-latency creator interactions.</p>
            </div>
          </div>

          <div style={{ marginTop: '2.5rem' }}>
            <Link href="/" className="nav-pill-button" style={{ display: 'inline-block' }}>
              ← Return Home
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
