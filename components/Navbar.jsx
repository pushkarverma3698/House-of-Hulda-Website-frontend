'use client';
import { useState, useEffect } from 'react';
import styles from './Navbar.module.css';

const palettes = [
  { id: 'A', label: 'Misty Deodar', swatch: ['#1A2E1A', '#C4956A', '#F5F2ED'] },
  { id: 'B', label: 'Monsoon Cedar', swatch: ['#1F2B1F', '#A67C52', '#F0E8DC'] },
  { id: 'C', label: 'Alpine Hearth', swatch: ['#4A6741', '#B8845A', '#F5F5F0'] },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [palette, setPalette] = useState('A');
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-palette', palette);
  }, [palette]);

  const navLinks = [
    { href: '#stay', label: 'The Stay' },
    { href: '#experience', label: 'Experience' },
    { href: '#story', label: 'Our Story' },
  ];

  return (
    <>
      <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
        <div className={styles.inner}>
          {/* Logo */}
          <a href="#" className={styles.logo}>
            <span className={styles.logoIcon}>⌂</span>
            <span className={styles.logoText}>
              <span className={styles.logoMain}>House of Hulda</span>
              <span className={styles.logoSub}>Naggar · Himachal Pradesh</span>
            </span>
          </a>

          {/* Desktop Links */}
          <ul className={styles.links}>
            {navLinks.map(link => (
              <li key={link.href}>
                <a href={link.href} className={styles.link}>{link.label}</a>
              </li>
            ))}
          </ul>

          {/* Right side */}
          <div className={styles.right}>
            {/* Palette Switcher */}
            <div className={styles.palettePicker}>
              <button
                className={styles.paletteBtn}
                onClick={() => setPaletteOpen(!paletteOpen)}
                title="Switch color palette"
                aria-label="Color theme switcher"
              >
                <span className={styles.paletteIconDots}>
                  {palettes.find(p => p.id === palette)?.swatch.map((c, i) => (
                    <span key={i} style={{ background: c }} className={styles.dot} />
                  ))}
                </span>
                <span className={styles.paletteLabel}>Palette</span>
              </button>

              {paletteOpen && (
                <div className={styles.paletteDropdown}>
                  <p className={styles.paletteTitle}>Choose a vibe</p>
                  {palettes.map(p => (
                    <label key={p.id} className={styles.paletteOption}>
                      <input
                        type="radio"
                        name="palette"
                        value={p.id}
                        checked={palette === p.id}
                        onChange={() => { setPalette(p.id); setPaletteOpen(false); }}
                        className={styles.paletteRadio}
                      />
                      <span className={styles.paletteSwatches}>
                        {p.swatch.map((c, i) => (
                          <span key={i} style={{ background: c }} className={styles.swatchPill} />
                        ))}
                      </span>
                      <span className={styles.paletteName}>{p.label}</span>
                      {palette === p.id && <span className={styles.paletteCheck}>✓</span>}
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Hamburger */}
            <button
              className={`${styles.hamburger} ${menuOpen ? styles.open : ''}`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className={`${styles.mobileMenu} ${menuOpen ? styles.mobileOpen : ''}`}>
        <ul className={styles.mobileLinks}>
          {navLinks.map(link => (
            <li key={link.href}>
              <a href={link.href} className={styles.mobileLink} onClick={() => setMenuOpen(false)}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
