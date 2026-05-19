'use client';
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '../lib/gsap';
import styles from './Experience.module.css';

const EXPERIENCES = [
  {
    title: "Mountain Trails",
    desc: "Guided hikes through ancient deodar forests to hidden waterfalls.",
    icon: "↑",
    label: "Trek",
  },
  {
    title: "Apple Orchards",
    desc: "Walk through private orchards and pluck fresh Himalayan apples.",
    icon: "✦",
    label: "Harvest",
  },
  {
    title: "Art & Heritage",
    desc: "Visit the nearby Roerich Art Gallery and Naggar Castle.",
    icon: "◇",
    label: "Culture",
  },
  {
    title: "Local Cuisine",
    desc: "Savor traditional Himachali dham and farm-to-table organic meals.",
    icon: "◉",
    label: "Food",
  },
  {
    title: "Bonfire Nights",
    desc: "Cozy evenings under a blanket of stars with local music and stories.",
    icon: "△",
    label: "Evening",
  },
  {
    title: "Monsoon Walks",
    desc: "Experience the magic of mountain rain with hot chai on the balcony.",
    icon: "~",
    label: "Season",
  },
];

export default function Experience() {
  const sectionRef = useRef(null);

  useGSAP(() => {
    const cards = sectionRef.current.querySelectorAll('[data-card]');
    gsap.set(cards, { opacity: 0, y: 50 });

    ScrollTrigger.batch(cards, {
      onEnter: (batch) => {
        gsap.to(batch, {
          opacity: 1,
          y: 0,
          stagger: 0.1,
          duration: 0.8,
          ease: 'power3.out',
        });
      },
      start: 'top 88%',
      once: true,
    });

    const header = sectionRef.current.querySelectorAll('[data-header]');
    gsap.set(header, { opacity: 0, y: 30 });
    ScrollTrigger.batch(header, {
      onEnter: (batch) => {
        gsap.to(batch, { opacity: 1, y: 0, stagger: 0.12, duration: 0.8, ease: 'power3.out' });
      },
      start: 'top 85%',
      once: true,
    });
  }, { scope: sectionRef });

  return (
    <section id="experience" className={`section ${styles.experience}`} ref={sectionRef}>
      <div className={styles.divider}>
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none">
          <path d="M0,80 L0,40 C200,65 350,10 500,45 C650,80 800,0 1000,35 C1200,70 1350,20 1440,55 L1440,80 Z" fill="var(--hearth-bg, #F5F0E8)" />
        </svg>
      </div>

      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <div className={styles.header}>
          <p className="eyebrow" data-header style={{ marginBottom: '1rem', color: 'var(--gold-light)' }}>
            Beyond The Room
          </p>
          <h2 className="heading-xl" data-header style={{ color: 'var(--snow)' }}>
            The Naggar Experience
          </h2>
        </div>

        <div className={styles.grid}>
          {EXPERIENCES.map((exp, i) => (
            <div key={i} className={styles.card} data-card>
              <div className={styles.cardTop}>
                <span className={styles.label}>{exp.label}</span>
                <span className={styles.iconSymbol} aria-hidden="true">{exp.icon}</span>
              </div>
              <h3 className="heading-md" style={{ color: 'var(--snow)' }}>{exp.title}</h3>
              <p className={styles.desc}>{exp.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
