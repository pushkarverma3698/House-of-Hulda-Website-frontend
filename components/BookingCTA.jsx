'use client';
import { useEffect, useRef } from 'react';
import styles from './BookingCTA.module.css';

export default function BookingCTA() {
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
    <section id="contact" className={`section ${styles.booking}`} ref={sectionRef}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.grid}>
          <div className={styles.textCol}>
            <p className="eyebrow reveal" style={{ color: 'var(--primary)' }}>Plan Your Stay</p>
            <h2 className={`heading-xl reveal reveal-delay-1 ${styles.title}`}>
              Ready to retreat to the mountains?
            </h2>
            <p className="body-lg reveal reveal-delay-2" style={{ color: 'var(--primary)', opacity: 0.8, marginBottom: '2rem' }}>
              Send us your desired dates and we will get back to you with availability and details to curate your perfect Himalayan stay.
            </p>
            
            <div className={`${styles.contactInfo} reveal reveal-delay-3`}>
              <p><strong>Email:</strong> stay@houseofhulda.com</p>
              <p><strong>Location:</strong> Naggar Castle Road, Kullu, HP 175130</p>
            </div>
          </div>
          
          <div className={`${styles.formCol} reveal`}>
            <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Name</label>
                <input type="text" className={styles.input} placeholder="Jane Doe" />
              </div>
              
              <div className={styles.formGroup}>
                <label className={styles.label}>Email</label>
                <input type="email" className={styles.input} placeholder="jane@example.com" />
              </div>
              
              <div className={styles.rowGroup}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Check-in</label>
                  <input type="date" className={styles.input} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Guests</label>
                  <select className={styles.input}>
                    <option>1-2 Guests</option>
                    <option>3-4 Guests</option>
                    <option>Whole Property</option>
                  </select>
                </div>
              </div>
              
              <button type="submit" className={`btn-primary ${styles.submitBtn}`}>
                Request Booking
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
