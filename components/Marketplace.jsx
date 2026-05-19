'use client';
import { useRef } from 'react';
import Link from 'next/link';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '../lib/gsap';
import { featuredProducts } from '../lib/productData';
import ProductCard from './ProductCard';
import styles from './Marketplace.module.css';

export default function Marketplace() {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);

  useGSAP(() => {
    // Reveal header
    const header = sectionRef.current.querySelectorAll('[data-reveal]');
    gsap.set(header, { opacity: 0, y: 30 });
    ScrollTrigger.batch(header, {
      onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, stagger: 0.1, duration: 0.8, ease: 'power3.out' }),
      start: 'top 85%',
      once: true,
    });

    // Cards reveal
    const cards = sectionRef.current.querySelectorAll('[data-card]');
    gsap.set(cards, { opacity: 0, y: 40 });
    ScrollTrigger.batch(cards, {
      onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, stagger: 0.1, duration: 0.7, ease: 'power3.out' }),
      start: 'top 88%',
      once: true,
    });
  }, { scope: sectionRef });

  return (
    <section id="marketplace" className={`section ${styles.section}`} ref={sectionRef}>
      <div className="container">
        <div className={styles.header}>
          <div>
            <p className="eyebrow" data-reveal style={{ marginBottom: '1rem' }}>
              Local Artisans · Naggar · Himachal
            </p>
            <h2 className="heading-xl" data-reveal>From the Hills</h2>
          </div>
          <p className={`body-lg ${styles.headerDesc}`} data-reveal>
            Handpicked goods from Himalayan artisans — honey, wool, cedar wood crafts, and mountain wellness. Shipped directly from Naggar.
          </p>
        </div>

        <div className={styles.grid}>
          {featuredProducts.map((product) => (
            <div key={product.id} data-card>
              <ProductCard product={product} />
            </div>
          ))}

          {/* CTA card */}
          <div className={`${styles.ctaCard}`} data-card>
            <div className={styles.ctaInner}>
              <p className="eyebrow" style={{ color: 'var(--gold-light)', marginBottom: '1rem' }}>
                12+ Products
              </p>
              <h3 className={`heading-lg ${styles.ctaTitle}`}>
                Explore All Products
              </h3>
              <p className={styles.ctaDesc}>
                Pantry, textiles, crafts & wellness — all from local Himachali makers.
              </p>
              <Link href="/shop" className={styles.ctaBtn}>
                Visit the Shop →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
