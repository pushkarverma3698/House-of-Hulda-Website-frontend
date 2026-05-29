'use client';
import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '../lib/gsap';
import MagneticButton from './MagneticButton';
import styles from './Rooms.module.css';

const ROOMS = [
  {
    id: 'deodar',
    name: 'The Deodar Suite',
    price: '₹4,500',
    guests: 2,
    description: 'A spacious wooden haven overlooking cedar forests. Features a private balcony and deep soaking tub filled with mountain spring water.',
    features: ['Private balcony', 'Soaking tub', 'Valley view', 'King bed'],
    image: 'https://images.unsplash.com/photo-1519974719765-e6559eac2575?auto=format&fit=crop&q=80&w=1400',
  },
  {
    id: 'valley',
    name: 'The Valley View',
    price: '₹5,500',
    guests: 3,
    description: 'Panoramic windows framing the entire Kullu Valley. Wake up to golden hour over the Himalayas directly from bed.',
    features: ['Floor-to-ceiling windows', 'Telescope', 'Fireplace', 'Queen bed'],
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=1400',
  },
  {
    id: 'fireplace',
    name: 'The Fireplace Room',
    price: '₹3,500',
    guests: 2,
    description: 'Cozy, intimate, and romantic. A traditional stone fireplace and rich woolen textiles make snowy nights magical.',
    features: ['Stone fireplace', 'Woolen textiles', 'Garden view', 'Double bed'],
    image: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=1400',
  },
  {
    id: 'attic',
    name: 'The Attic Nest',
    price: '₹6,500',
    guests: 4,
    description: 'A magical space under the eaves. Sloped wooden ceilings, skylights for stargazing, and an incredibly cozy family atmosphere.',
    features: ['Skylight windows', 'Sloped ceilings', 'Stargazing deck', 'Bunk + Queen'],
    image: 'https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?auto=format&fit=crop&q=80&w=1400',
  },
];

export default function Rooms() {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const progressRef = useRef(null);
  const counterRef = useRef(null);
  const [activeRoom, setActiveRoom] = useState(0);

  useGSAP(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const getDistance = () => track.scrollWidth - window.innerWidth;

    const tween = gsap.to(track, {
      x: () => -getDistance(),
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        pin: true,
        start: 'top top',
        end: () => `+=${getDistance()}`,
        scrub: 1,
        invalidateOnRefresh: true,
        anticipatePin: 1,
        onUpdate: (self) => {
          if (progressRef.current) {
            progressRef.current.style.transform = `scaleX(${self.progress})`;
          }
          const roomIndex = Math.min(
            Math.floor(self.progress * ROOMS.length),
            ROOMS.length - 1
          );
          setActiveRoom(roomIndex);
          if (counterRef.current) {
            counterRef.current.textContent = `0${roomIndex + 1} / 0${ROOMS.length}`;
          }
        },
      },
    });

    // Recompute scrollWidth once lazy Unsplash images settle
    const imgs = track.querySelectorAll('img');
    imgs.forEach((img) => {
      if (!img.complete) {
        img.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
      }
    });

    return () => tween.kill();
  }, { scope: sectionRef });

  return (
    <section id="rooms" className={styles.section} ref={sectionRef}>
      {/* Progress bar */}
      <div className={styles.progressBar}>
        <div className={styles.progressFill} ref={progressRef} />
      </div>

      {/* Counter */}
      <div className={styles.counter} ref={counterRef} aria-live="polite">
        01 / 04
      </div>

      {/* Section header */}
      <div className={styles.sectionHeader}>
        <p className="eyebrow" style={{ color: 'var(--gold-light)' }}>Rest &amp; Rejuvenate</p>
        <h2 className="heading-xl" style={{ color: 'var(--snow)' }}>Sanctuaries of Wood &amp; Light</h2>
      </div>

      {/* Horizontal track */}
      <div className={styles.track} ref={trackRef}>
        {ROOMS.map((room, i) => (
          <div key={room.id} className={styles.panel}>
            {/* Image half */}
            <div className={styles.imageHalf}>
              <img
                src={room.image}
                alt={room.name}
                className={styles.panelImage}
                loading={i === 0 ? 'eager' : 'lazy'}
              />
              <div className={styles.imageOverlay} />
            </div>

            {/* Content half */}
            <div className={styles.contentHalf}>
              <p className="eyebrow" style={{ color: 'var(--gold-light)', marginBottom: '1rem' }}>
                Room {String(i + 1).padStart(2, '0')}
              </p>
              <h3 className={`heading-xl ${styles.roomName}`}>{room.name}</h3>
              <p className={styles.roomDesc}>{room.description}</p>

              <ul className={styles.features}>
                {room.features.map((f) => (
                  <li key={f} className={styles.feature}>
                    <span className={styles.featureDot} />
                    {f}
                  </li>
                ))}
              </ul>

              <div className={styles.roomFooter}>
                <MagneticButton>
                  <a href="#booking" className={styles.bookBtn}>
                    Inquire Now
                  </a>
                </MagneticButton>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
