'use client';
import { useRef } from 'react';
import styles from './Hero.module.css';
import AnimatedText from '@/components/AnimatedText';

export default function Hero() {
  const heroRef = useRef(null);

  return (
    <header className={styles.hero} ref={heroRef}>
      {/* Hero content floats above all mountain layers via z-index */}
      <div className={styles.content}>
        <div className="container">
          <p className="eyebrow" style={{ color: 'var(--snow)' }}>Naggar, Himachal Pradesh</p>
          <AnimatedText tag="h1" className={`${styles.title} display`}>
            House of Hulda
          </AnimatedText>
          <AnimatedText tag="p" className={styles.subtitle} delay={0.2}>
            A sanctuary above the clouds. Where the Himalayas meet warmth, wood, and wonder.
          </AnimatedText>
          <div className={styles.actions}>
            <a href="#marketplace" className={styles.crystalBtn}>
              <span className={styles.crystalGlow}></span>
              Enter Marketplace
            </a>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className={styles.scrollHint}>
        <span className={styles.scrollLine} />
      </div>
    </header>
  );
}
