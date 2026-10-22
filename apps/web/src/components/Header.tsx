import React from 'react';
import Link from 'next/link';
import { Logo } from './Logo';

export interface HeaderProps {
  showAboutLink?: boolean;
}

export function Header({ showAboutLink = true }: HeaderProps) {
  return (
    <header className="site-header" role="banner">
      <div className="header-inner">
        <div className="header-brand">
          <Link href="/" aria-label="Streamline Home" className="brand-link">
            <Logo variant="full" size={26} />
          </Link>
        </div>

        <nav className="header-nav" aria-label="Main Navigation">
          {showAboutLink && (
            <Link href="/about" className="nav-link nav-link-muted">
              About
            </Link>
          )}
          <Link href="/login" className="nav-link nav-link-white">
            Log in
          </Link>
          <Link href="/signup" className="nav-pill-button">
            Sign up
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;
