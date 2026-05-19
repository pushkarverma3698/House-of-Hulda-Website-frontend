'use client';
import { useState, useEffect } from 'react';
import styles from './Navbar.module.css';

// Inline SVG monogram — stylised "H" framed by deodar fronds.
function Mark() {
  return (
    <svg
      className={styles.mark}
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* outer ring */}
      <circle cx="16" cy="16" r="14.5" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.55" />
      {/* deodar peak silhouette */}
      <path
        d="M5 22 L11 13 L13 16 L16 9 L19 16 L21 13 L27 22 Z"
        fill="currentColor"
        opacity="0.18"
      />
      {/* H letterform */}
      <path
        d="M11 10 L11 22 M21 10 L21 22 M11 16 L21 16"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { href: '#stay', label: 'The Stay' },
    { href: '#experience', label: 'Experience' },
    { href: '#marketplace', label: 'Market' },
    { href: '#story', label: 'Our Story' },
  ];

  return (
    <>
      <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
        <div className={styles.inner}>
          {/* Logo */}
          <a href="#" className={styles.logo} aria-label="House of Hulda — Home">
            <Mark />
            <span className={styles.logoMain}>House of Hulda</span>
          </a>

          {/* Desktop Links */}
          <ul className={styles.links}>
            {navLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href} className={styles.link}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Reserve CTA (desktop) */}
          <a href="#booking" className={styles.reserve}>
            Reserve
          </a>

          {/* Hamburger (mobile) */}
          <button
            className={`${styles.hamburger} ${menuOpen ? styles.open : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className={`${styles.mobileMenu} ${menuOpen ? styles.mobileOpen : ''}`}>
        <ul className={styles.mobileLinks}>
          {navLinks.map((link) => (
            <li key={link.href}>
              <a href={link.href} className={styles.mobileLink} onClick={() => setMenuOpen(false)}>
                {link.label}
              </a>
            </li>
          ))}
          <li>
            <a href="#booking" className={styles.mobileReserve} onClick={() => setMenuOpen(false)}>
              Reserve a Stay
            </a>
          </li>
        </ul>
      </div>
    </>
  );
}
