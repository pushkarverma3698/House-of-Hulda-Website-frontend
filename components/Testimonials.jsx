'use client';
import { useEffect, useRef } from 'react';
import styles from './Testimonials.module.css';

const REVIEWS = [
  {
    quote: "A true sanctuary. We spent three days just watching the mist roll through the valley from our wooden balcony. The architecture perfectly frames the Himalayas.",
    author: "Elena & Marcus",
    origin: "Berlin, Germany"
  },
  {
    quote: "The Deodar Suite feels like you're sleeping in the canopy of the forest. The attention to detail in the woodwork and the warmth of the hospitality is unmatched.",
    author: "Rohan S.",
    origin: "Mumbai, India"
  },
  {
    quote: "Waking up to the golden light hitting the snow peaks, followed by a warm Himachali breakfast—House of Hulda is the mountain home I've always dreamt of.",
    author: "Sarah Jenkins",
    origin: "London, UK"
  }
];

export default function Testimonials() {
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
    <section className={`section ${styles.testimonials}`} ref={sectionRef}>
      <div className="container">
        <div className={styles.carousel}>
          {/* We'll just show the first one for the MVP, or stack them cleanly */}
          <div className={`${styles.wrap} reveal`}>
            <div className={styles.quoteMark}>"</div>
            <h3 className={`heading-lg ${styles.quoteText}`}>{REVIEWS[0].quote}</h3>
            <div className={styles.authorGroup}>
              <p className={styles.author}>{REVIEWS[0].author}</p>
              <p className={styles.origin}>{REVIEWS[0].origin}</p>
            </div>
            
            <div className={styles.dots}>
              <button className={`${styles.dot} ${styles.active}`} aria-label="Review 1"></button>
              <button className={styles.dot} aria-label="Review 2"></button>
              <button className={styles.dot} aria-label="Review 3"></button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
