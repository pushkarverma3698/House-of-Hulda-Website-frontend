'use client';
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '../lib/gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './ParallaxDivider.module.css';

export default function ParallaxDivider() {
  const containerRef = useRef(null);
  const imageRef = useRef(null);

  useGSAP(() => {
    gsap.to(imageRef.current, {
      y: '20%',
      ease: 'none',
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });
  }, { scope: containerRef });

  return (
    <section className={styles.container} ref={containerRef}>
      <div className={styles.imageWrap}>
        <img 
          ref={imageRef}
          src="/images/misty-divider.png" 
          alt="Misty landscape in Naggar" 
          className={styles.image}
        />
        <div className={styles.overlay}></div>
      </div>
      <div className={styles.content}>
        <h2 className="display" style={{ color: 'var(--snow)', textAlign: 'center', lineHeight: 1.2 }}>
          "The clearest way into the Universe<br/>is through a forest wilderness."
        </h2>
        <p className="eyebrow" style={{ marginTop: '2rem', color: 'var(--accent-light)' }}>— John Muir</p>
      </div>
    </section>
  );
}
