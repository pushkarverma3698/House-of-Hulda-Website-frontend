'use client';
import { useEffect, useRef } from 'react';
import Image from 'next/image';
import styles from './About.module.css';

export default function About() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });

    const reveals = sectionRef.current.querySelectorAll('.reveal');
    reveals.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section id="about" className={`section ${styles.about}`} ref={sectionRef}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.imageCol}>
          <div className={`${styles.imageWrap} reveal`}>
            <Image 
              src="/mountains/parallax-house.png" 
              alt="House of Hulda Exterior" 
              width={800}
              height={1000}
              className={styles.image}
              priority
            />
            <div className={styles.imageCaption}>
              Est. 2024
            </div>
          </div>
        </div>
        
        <div className={styles.textCol}>
          <p className="eyebrow reveal reveal-delay-1">The Philosophy</p>
          <h2 className="heading-xl reveal reveal-delay-2" style={{ margin: '1.5rem 0' }}>
            A Home in the Clouds
          </h2>
          <div className="reveal reveal-delay-3">
            <p className="body-lg" style={{ marginBottom: '1.5rem' }}>
              Perched at an elevation of 2,000 meters in the ancient village of Naggar, the House of Hulda is more than a retreat—it&apos;s a return to a simpler, deeper way of living.
            </p>
            <p className="body-lg" style={{ marginBottom: '2.5rem' }}>
              Built with traditional Himachali Kath Kuni architecture, every wooden beam and stone wall holds the warmth of local craftsmanship. Here, time slows down to the rhythm of floating mist and rustling deodar pines. 
            </p>
          </div>
          
          <div className={`${styles.stats} reveal reveal-delay-4`}>
            <div className={styles.stat}>
              <span className={styles.statNumber}>2k</span>
              <span className={styles.statLabel}>Meters Elevation</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>4</span>
              <span className={styles.statLabel}>Boutique Rooms</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>∞</span>
              <span className={styles.statLabel}>Mountain Views</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
