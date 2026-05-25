'use client';
import { useRef } from 'react';
import styles from './Hero.module.css';
import AnimatedText from '@/components/AnimatedText';
import MagneticButton from '@/components/MagneticButton';

export default function Hero() {
  const heroRef = useRef(null);

  return (
    <header className={styles.hero} ref={heroRef}>
      <div className={styles.content}>
        <div className="container">
          <p className={`eyebrow ${styles.eyebrow}`}>
            Naggar, Himachal Pradesh &nbsp;·&nbsp; 2,000m Elevation
          </p>
          <AnimatedText tag="h1" className={`${styles.title} display`}>
            House of Hulda
          </AnimatedText>
          <AnimatedText tag="p" className={styles.subtitle} delay={0.2}>
            A sanctuary above the clouds. Where the Himalayas meet warmth, wood, and wonder.
          </AnimatedText>
          <div className={styles.actions}>
            <MagneticButton>
              <a href="#booking" className={styles.crystalBtn}>
                <span className={styles.crystalGlow}></span>
                Book a Stay
              </a>
            </MagneticButton>
            <MagneticButton>
              <a href="#marketplace" className={styles.ghostBtn}>
                From the Hills ↓
              </a>
            </MagneticButton>
          </div>
        </div>
      </div>

      <div className={styles.scrollHint}>
        <span className={styles.scrollLine} />
      </div>
    </header>
  );
}
