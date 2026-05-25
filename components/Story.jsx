'use client';
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '../lib/gsap';
import styles from './Story.module.css';

export default function Story() {
  const containerRef = useRef(null);
  const titleRef = useRef(null);
  const imageRef = useRef(null);
  const contentRef = useRef(null);

  useGSAP(() => {
    gsap.from(titleRef.current, {
      y: 80,
      opacity: 0,
      duration: 0.8,
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 60%',
        end: 'top 30%',
        scrub: 1,
      },
    });

    gsap.from(imageRef.current, {
      clipPath: 'inset(100% 0 0 0)',
      duration: 1,
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 50%',
        end: 'top 20%',
        scrub: 1.5,
      },
    });

    gsap.from(contentRef.current, {
      y: 60,
      opacity: 0,
      duration: 0.8,
      scrollTrigger: {
        trigger: contentRef.current,
        start: 'top 70%',
        end: 'top 40%',
        scrub: 1,
      },
    });
  }, { scope: containerRef });

  return (
    <section id="story" className={`section ${styles.section}`} ref={containerRef}>
      <div className="container">
        <div className={styles.header}>
          <p className="eyebrow" style={{ marginBottom: '1rem', color: 'var(--gold-light)' }}>
            Our Journey
          </p>
          <h2 className="heading-xl" ref={titleRef}>
            Where Mountains Meet Home
          </h2>
        </div>

        <div className={styles.content}>
          <div className={styles.imageWrapper}>
            <img
              ref={imageRef}
              src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=800"
              alt="Naggar mountain valley"
              className={styles.storyImage}
            />
            <div className={styles.imageOverlay}></div>
          </div>

          <div className={styles.text} ref={contentRef}>
            <p className="body-lg">
              Nestled in the heart of Naggar, at 6,000 feet above sea level, House of Hulda was born from a simple dream: to create a sanctuary where the boundary between wilderness and comfort dissolves.
            </p>

            <p className="body-lg" style={{ marginTop: '1.5rem' }}>
              Every stone was placed with intention. Every window frames a view of deodar forests and Himalayan peaks. Every evening, mist curls through the valley, carrying with it the whisper of ancient mountains and the warmth of home.
            </p>

            <p className="body-lg" style={{ marginTop: '1.5rem' }}>
              We built this not as a hotel, but as an extension of our own mountain home. Each room tells a story—of cedar forests, of golden sunrises over the Kullu Valley, of crackling fireplaces on snowy nights. Here, you don't just stay; you belong.
            </p>

            <p className="body-lg" style={{ marginTop: '1.5rem', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
              "The mountains are calling, and we must go." — John Muir
            </p>

            <div className={styles.stats}>
              <div className={styles.stat}>
                <p className={styles.statNumber}>6,000 ft</p>
                <p className={styles.statLabel}>Elevation above sea level</p>
              </div>
              <div className={styles.stat}>
                <p className={styles.statNumber}>3</p>
                <p className={styles.statLabel}>Sanctuaries of wood & light</p>
              </div>
              <div className={styles.stat}>
                <p className={styles.statNumber}>∞</p>
                <p className={styles.statLabel}>Mountain memories</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
