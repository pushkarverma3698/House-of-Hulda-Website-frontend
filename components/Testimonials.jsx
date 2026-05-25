'use client';
import { useState, useRef, useEffect } from 'react';
import { gsap } from '../lib/gsap';
import styles from './Testimonials.module.css';

const REVIEWS = [
  {
    quote: "A true sanctuary. We spent three days just watching the mist roll through the valley from our wooden balcony. The architecture perfectly frames the Himalayas.",
    author: "Elena & Marcus",
    origin: "Berlin, Germany"
  },
  {
    quote: "The Deodar Suite feels like sleeping in the canopy of the forest. The attention to detail in the woodwork and the warmth of the hospitality is unmatched.",
    author: "Rohan S.",
    origin: "Mumbai, India"
  },
  {
    quote: "Waking up to golden light hitting the snow peaks, followed by a warm Himachali breakfast — House of Hulda is the mountain home I've always dreamt of.",
    author: "Sarah Jenkins",
    origin: "London, UK"
  }
];

export default function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);
  const quoteRef = useRef(null);
  const timerRef = useRef(null);
  const isHovering = useRef(false);

  const goTo = (index) => {
    if (!quoteRef.current || index === activeIndex) return;
    gsap.to(quoteRef.current, {
      opacity: 0,
      y: -24,
      duration: 0.35,
      ease: 'power2.in',
      onComplete: () => {
        setActiveIndex(index);
        gsap.fromTo(
          quoteRef.current,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }
        );
      },
    });
  };

  const advance = () => {
    if (!isHovering.current) {
      setActiveIndex((prev) => {
        const next = (prev + 1) % REVIEWS.length;
        goTo(next);
        return next;
      });
    }
  };

  useEffect(() => {
    timerRef.current = setInterval(advance, 6000);
    return () => clearInterval(timerRef.current);
  }, []);

  return (
    <section className={`section ${styles.testimonials}`}>
      <div className="container">
        <div
          className={styles.carousel}
          onMouseEnter={() => { isHovering.current = true; }}
          onMouseLeave={() => { isHovering.current = false; }}
        >
          <div className={styles.decorQuote} aria-hidden="true">&ldquo;</div>

          <div ref={quoteRef} className={styles.wrap}>
            <blockquote className={`heading-lg ${styles.quoteText}`}>
              {REVIEWS[activeIndex].quote}
            </blockquote>
            <div className={styles.authorGroup}>
              <p className={styles.author}>{REVIEWS[activeIndex].author}</p>
              <p className={styles.origin}>{REVIEWS[activeIndex].origin}</p>
            </div>
          </div>

          <div className={styles.dots} role="tablist" aria-label="Reviews">
            {REVIEWS.map((_, i) => (
              <button
                key={i}
                role="tab"
                aria-selected={i === activeIndex}
                aria-label={`Review ${i + 1}`}
                className={`${styles.dot} ${i === activeIndex ? styles.active : ''}`}
                onClick={() => goTo(i)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
