'use client';
import { useEffect, useRef } from 'react';
import styles from './ParallaxDivider.module.css';

export default function ParallaxDivider() {
  const containerRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current || !imageRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const viewHeight = window.innerHeight;
      
      // Calculate how far the section is from the center of the viewport
      if (rect.top <= viewHeight && rect.bottom >= 0) {
        // Map scroll percentage to a Y translation value (from -20% to +20%)
        const scrollPercent = (viewHeight - rect.top) / (viewHeight + rect.height);
        const yPos = (scrollPercent - 0.5) * 40; // -20% to 20%
        
        imageRef.current.style.transform = `translateY(${yPos}%) scale(1.2)`;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Trigger once on mount
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className={styles.container} ref={containerRef}>
      <div className={styles.imageWrap}>
        <img 
          ref={imageRef}
          src="https://images.unsplash.com/photo-1542384701-c0e46eadea3b?auto=format&fit=crop&q=80&w=2000" 
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
