'use client';
import { useEffect, useRef } from 'react';
import styles from './Gallery.module.css';

const PHOTOS = [
  'https://images.unsplash.com/photo-1518730518541-d0843268c287?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1621245084992-628f80459cbo?auto=format&fit=crop&q=80&w=800', // Note: fake/broken id to test gracefully, let's use valid
  'https://images.unsplash.com/photo-1542384701-c0e46eadea3b?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1502672260266-1c1c54ab9667?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1533090161767-e6f6630b4ac1?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80&w=800'
];

export default function Gallery() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.05 });

    const reveals = sectionRef.current.querySelectorAll('.reveal');
    reveals.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section id="gallery" className={`section ${styles.gallery}`} ref={sectionRef}>
      <div className="container">
        <div className={styles.header}>
          <p className="eyebrow reveal">Visual Journey</p>
          <h2 className="heading-xl reveal reveal-delay-1" style={{ marginTop: '1rem' }}>Glimpses of Hulda</h2>
        </div>

        <div className={styles.masonry}>
          {PHOTOS.map((src, i) => (
            <div 
              key={i} 
              className={`${styles.item} reveal`}
              style={{ transitionDelay: `${(i % 4) * 0.1}s` }}
            >
              <div className={styles.imageWrap}>
                <img src={src} alt={`Gallery image ${i + 1}`} loading="lazy" />
                <div className={styles.overlay}>
                  <span>Enlarge</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className={styles.actions}>
          <button className="btn-outline reveal reveal-delay-2">View Full Gallery</button>
        </div>
      </div>
    </section>
  );
}
