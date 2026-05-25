'use client';
import { useRef } from 'react';
import Image from 'next/image';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '../lib/gsap';
import styles from './About.module.css';

export default function About() {
  const sectionRef = useRef(null);
  const imageWrapRef = useRef(null);
  const imageInnerRef = useRef(null); // wrapper div for Ken Burns (can't ref next/image directly)
  const counterRefs = useRef([]);

  useGSAP(() => {
    // Image clip-path reveal on scroll enter
    gsap.from(imageWrapRef.current, {
      clipPath: 'inset(100% 0 0 0)',
      duration: 1.4,
      ease: 'power4.out',
      scrollTrigger: {
        trigger: imageWrapRef.current,
        start: 'top 80%',
        once: true,
      },
    });

    // Ken Burns — ambient slow zoom on the cabin image (target wrapper div, not next/image)
    gsap.fromTo(
      imageInnerRef.current,
      { scale: 1, transformOrigin: '55% 50%' },
      { scale: 1.06, transformOrigin: '45% 50%', duration: 22, ease: 'none', repeat: -1, yoyo: true }
    );

    // Animated stat counters
    const targets = [2000, 4, null]; // null = infinity, handled separately
    counterRefs.current.forEach((el, i) => {
      if (!el || targets[i] === null) return;
      gsap.from({ val: 0 }, {
        val: targets[i],
        duration: 2,
        snap: { val: 1 },
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          once: true,
        },
        onUpdate() {
          el.textContent = this.targets()[0].val.toLocaleString();
        },
      });
    });

    // Text reveals with ScrollTrigger.batch for stagger
    ScrollTrigger.batch(sectionRef.current.querySelectorAll('[data-reveal]'), {
      onEnter: (batch) => {
        gsap.to(batch, {
          opacity: 1,
          y: 0,
          stagger: 0.1,
          duration: 0.9,
          ease: 'power3.out',
        });
      },
      start: 'top 85%',
      once: true,
    });

    gsap.set(sectionRef.current.querySelectorAll('[data-reveal]'), { opacity: 0, y: 40 });
  }, { scope: sectionRef });

  return (
    <section id="about" className={`section ${styles.about}`} ref={sectionRef}>
      <div className={`container ${styles.imageTopWrapper}`}>
        <div className={styles.imageCol}>
          <div className={styles.imageWrap} ref={imageWrapRef}>
            <div ref={imageInnerRef} style={{ width: '100%', height: '100%' }}>
              <Image
                src="/mountains/parallax-house.png"
                alt="House of Hulda — Kath Kuni architecture in Naggar"
                width={800}
                height={1000}
                className={styles.image}
                priority
              />
            </div>
            <div className={styles.imageCaption}>Est. 2024 · Naggar, HP</div>
          </div>
        </div>

        <div className={styles.textCol}>
          <p className="eyebrow" data-reveal>The Philosophy</p>
          <h2 className="heading-xl" data-reveal style={{ margin: '1.5rem 0' }}>
            A Home in the Clouds
          </h2>
          <div data-reveal>
            <p className="body-lg" style={{ marginBottom: '1.5rem' }}>
              Perched at 6,000 feet above sea level in Naggar, House of Hulda is a sanctuary where the boundary between wilderness and comfort dissolves.
            </p>
            <p className="body-lg" style={{ marginBottom: '1.5rem' }}>
              We built this not as a hotel, but as an extension of our own mountain home. Every stone placed with intention. Every window frames deodar forests and Himalayan peaks.
            </p>
            <p className="body-lg" style={{ marginBottom: '2.5rem', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
              "The mountains are calling, and we must go." — John Muir
            </p>
          </div>

          <div className={`${styles.stats}`} data-reveal>
            <div className={styles.stat}>
              <span
                className={styles.statNumber}
                ref={(el) => (counterRefs.current[0] = el)}
              >6,000</span>
              <span className={styles.statLabel}>Feet Elevation</span>
            </div>
            <div className={styles.stat}>
              <span
                className={styles.statNumber}
                ref={(el) => (counterRefs.current[1] = el)}
              >3</span>
              <span className={styles.statLabel}>Sanctuaries of Wood & Light</span>
            </div>
            <div className={styles.stat}>
              <span
                className={styles.statNumber}
                ref={(el) => (counterRefs.current[2] = el)}
              >∞</span>
              <span className={styles.statLabel}>Mountain Memories</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
