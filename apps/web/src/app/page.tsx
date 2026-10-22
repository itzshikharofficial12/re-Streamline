import React from 'react';
import type { Metadata } from 'next';
import { Header } from '../components/Header';
import { Hero } from '../components/Hero';
import { Footer } from '../components/Footer';
import { SpaceBackground } from '../components/SpaceBackground';

export const metadata: Metadata = {
  title: 'Streamline — The future of streaming is being built',
  description:
    'A new way to stream, connect, and build your community — directly from your browser. We are working hard to bring it to you soon.',
  icons: {
    icon: '/favicon.svg'
  }
};

export default function HomePage() {
  return (
    <div className="landing-viewport">
      {/* Cinematic space background with subtle stars and planetary horizon */}
      <SpaceBackground />

      {/* Primary Navigation Header */}
      <Header />

      {/* Hero with status pill, headline, copy, and waitlist area */}
      <main className="landing-main">
        <Hero />
      </main>

      {/* Restrained Footer */}
      <Footer />
    </div>
  );
}
