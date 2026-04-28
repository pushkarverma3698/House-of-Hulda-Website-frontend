'use client';
import { useEffect, useRef } from 'react';
import styles from './Experience.module.css';

const EXPERIENCES = [
  { title: "Mountain Trails", desc: "Guided hikes through ancient deodar forests to hidden waterfalls.", icon: "🏔️" },
  { title: "Apple Orchards", desc: "Walk through our private orchards and pluck fresh Himalayan apples.", icon: "🍎" },
  { title: "Art & Heritage", desc: "Visit the nearby Roerich Art Gallery and Naggar Castle.", icon: "🏛️" },
  { title: "Local Cuisine", desc: "Savor traditional Himachali dham and farm-to-table organic meals.", icon: "🍲" },
  { title: "Bonfire Nights", desc: "Cozy evenings under a blanket of stars with local music and stories.", icon: "🔥" },
  { title: "Monsoon Walks", desc: "Experience the magic of mountain rain with hot chai on the balcony.", icon: "🌧️" }
];

export default function Experience() {
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
    <section id="experience" className={`section ${styles.experience}`} ref={sectionRef}>
      {/* Decorative mountain divider top */}
      <div className={styles.divider}>
        <svg viewBox="0 0 1440 100" preserveAspectRatio="none">
           <path d="M0,100 L0,50 C200,80 350,20 500,60 C650,100 800,0 1000,50 C1200,100 1350,30 1440,70 L1440,100 Z" fill="var(--bg)"/>
        </svg>
      </div>

      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <div className={styles.header}>
          <p className="eyebrow reveal" style={{ marginBottom: '1rem', color: 'var(--accent)' }}>Beyond The Room</p>
          <h2 className="heading-xl reveal reveal-delay-1" style={{ color: 'var(--snow)' }}>The Naggar Experience</h2>
        </div>

        <div className={styles.grid}>
          {EXPERIENCES.map((exp, i) => (
            <div 
              key={i} 
              className={`${styles.card} reveal`}
              style={{ transitionDelay: `${(i % 3) * 0.1}s` }}
            >
              <div className={styles.iconWrap}>
                <span className={styles.icon}>{exp.icon}</span>
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
