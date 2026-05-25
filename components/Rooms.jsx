'use client';
import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '../lib/gsap';
import MagneticButton from './MagneticButton';
import styles from './Rooms.module.css';

const ROOMS = [
  {
    id: 'whisperwood-suite',
    name: 'The Whisperwood Suite',
    price: '₹4,500',
    guests: 2,
    description: 'A spacious wooden sanctuary overlooking ancient cedar forests. Features a private balcony and a hand-carved copper tub filled with fresh mountain spring water.',
    features: ['Private Balcony', 'Forest-View Tub', 'King Cedar Bed', 'Hearthside Seating'],
    image: 'https://images.unsplash.com/photo-1519974719765-e6559eac2575?auto=format&fit=crop&q=80&w=1400',
  },
  {
    id: 'cloudloft-sanctuary',
    name: 'The Cloudloft Sanctuary',
    price: '₹5,500',
    guests: 3,
    description: 'Panoramic floor-to-ceiling glass framing the entire Kullu Valley. Wake up to the Himalayan golden hour directly from your bed, complete with a private brass telescope.',
    features: ['Valley Panorama', 'Brass Telescope', 'Stone Hearth', 'Queen Bed'],
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=1400',
  },
  {
    id: 'amber-hearth-room',
    name: 'The Amber Hearth Room',
    price: '₹3,500',
    guests: 2,
    description: 'Cozy, intimate, and wrapped in local river stone. A traditional crackling fireplace and rich hand-woven Himachali woolens make snowy mountain nights magical.',
    features: ['Stone Fireplace', 'Himachali Woolens', 'Garden Outlook', 'Double Bed'],
    image: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=1400',
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

    // Recompute scrollWidth once eager images settle
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
        01 / 03
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
                loading="eager"
                decoding="async"
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
                <div className={styles.pricing}>
                  <span className={styles.price}>{room.price}</span>
                  <span className={styles.priceLabel}> / night · up to {room.guests} guests</span>
                </div>
                <MagneticButton>
                  <a href={`#booking?room=${room.id}`} className={styles.bookBtn}>
                    Book this Room
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
