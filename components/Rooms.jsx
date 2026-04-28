'use client';
import { useEffect, useRef } from 'react';
import styles from './Rooms.module.css';

const ROOMS = [
  {
    id: 'deodar',
    name: 'The Deodar Suite',
    description: 'A spacious wooden haven overlooking the cedar forests. Features a private balcony and deep soaking tub.',
    image: 'https://images.unsplash.com/photo-1519974719765-e6559eac2575?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'valley',
    name: 'The Valley View',
    description: 'Panoramic windows framing the entire Kullu Valley. Wake up to the golden hour over the Himalayas directly from bed.',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'fireplace',
    name: 'The Fireplace Room',
    description: 'Cozy, intimate, and romantic. Features a traditional stone fireplace and rich woolen textiles for snowy nights.',
    image: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'attic',
    name: 'The Attic Nest',
    description: 'A magical space under the eaves. Sloped wooden ceilings, skylights for stargazing, and an incredibly cozy atmosphere.',
    image: 'https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?auto=format&fit=crop&q=80&w=1000'
  }
];

export default function Rooms() {
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
    <section id="rooms" className="section section-alt" ref={sectionRef}>
      <div className="container">
        <div className={styles.header}>
          <div>
            <p className="eyebrow reveal" style={{ marginBottom: '1rem' }}>Rest & Rejuvenate</p>
            <h2 className="heading-xl reveal reveal-delay-1">Sanctuaries of Wood & Light</h2>
          </div>
          <div className="reveal reveal-delay-2">
            <p className={`body-lg ${styles.headerText}`}>
              Four unique rooms, each lovingly designed using local cedar wood. Natural light pours through large windows, blurring the boundary between the indoors and the majestic peaks outside.
            </p>
          </div>
        </div>

        <div className={styles.grid}>
          {ROOMS.map((room, i) => (
            <div 
              key={room.id} 
              className={`${styles.card} reveal`}
              style={{ transitionDelay: `${i * 0.15 + 0.2}s` }}
            >
              <div className={styles.imageWrap}>
                <img src={room.image} alt={room.name} className={styles.image} />
                <div className={styles.overlay}>
                  <button className={styles.viewBtn}>View details</button>
                </div>
              </div>
              <div className={styles.content}>
                <h3 className="heading-lg">{room.name}</h3>
                <p className={styles.desc}>{room.description}</p>
                <div className={styles.actions}>
                  <button className="btn-ghost">Book this room <span aria-hidden="true">&rarr;</span></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
