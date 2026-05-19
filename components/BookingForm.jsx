'use client';
import { useState } from 'react';
import DateRangePicker from './DateRangePicker';
import RoomSelector from './RoomSelector';
import MagneticButton from './MagneticButton';
import { rooms } from '../lib/roomData';
import styles from './BookingForm.module.css';

const WHATSAPP_NUMBER = '919XXXXXXXXX'; // Replace with actual WhatsApp number

function diffDays(a, b) {
  return Math.round((new Date(b) - new Date(a)) / (1000 * 60 * 60 * 24));
}

function buildWhatsAppMessage(data) {
  const room = rooms.find((r) => r.id === data.room);
  const nights = data.checkIn && data.checkOut ? diffDays(data.checkIn, data.checkOut) : 0;
  const total = room && nights > 0 ? room.pricePerNight * nights : 0;

  return encodeURIComponent(
    `Hello! I'd like to book a stay at House of Hulda.\n\n` +
    `Room: ${room?.name || data.room}\n` +
    `Check-in: ${data.checkIn}\n` +
    `Check-out: ${data.checkOut}\n` +
    `Guests: ${data.guests}\n` +
    `Nights: ${nights}\n` +
    (total > 0 ? `Estimated Total: ₹${total.toLocaleString()}\n` : '') +
    `\nName: ${data.name}\n` +
    `Phone: ${data.phone}\n` +
    (data.requests ? `Special Requests: ${data.requests}` : '')
  );
}

const INITIAL = {
  checkIn: '', checkOut: '', room: '', guests: 2,
  name: '', email: '', phone: '', requests: '',
};

export default function BookingForm() {
  const [form, setForm] = useState(INITIAL);
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errors, setErrors] = useState({});

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const validate = () => {
    const e = {};
    if (!form.checkIn) e.checkIn = 'Required';
    if (!form.checkOut) e.checkOut = 'Required';
    if (form.checkIn && form.checkOut && form.checkIn >= form.checkOut) e.checkOut = 'Must be after check-in';
    if (!form.room) e.room = 'Please select a room';
    if (!form.name.trim()) e.name = 'Required';
    if (!form.phone.trim()) e.phone = 'Required';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setStatus('loading');

    try {
      // Send email via API route
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error('API error');

      // Open WhatsApp in new tab
      const msg = buildWhatsAppMessage(form);
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank');

      setStatus('success');
      setForm(INITIAL);
    } catch {
      setStatus('error');
    }
  };

  const selectedRoom = rooms.find((r) => r.id === form.room);
  const nights = form.checkIn && form.checkOut ? diffDays(form.checkIn, form.checkOut) : 0;
  const total = selectedRoom && nights > 0 ? selectedRoom.pricePerNight * nights : 0;

  if (status === 'success') {
    return (
      <section id="booking" className={`section ${styles.section}`}>
        <div className={`container ${styles.successWrap}`}>
          <div className={styles.successCard}>
            <span className={styles.successIcon}>✓</span>
            <h2 className="heading-lg" style={{ marginBottom: '1rem' }}>Booking Request Sent!</h2>
            <p className="body-lg" style={{ marginBottom: '2rem', maxWidth: '40ch' }}>
              Your WhatsApp message has been prepared. We&apos;ll confirm your reservation within 24 hours.
            </p>
            <button className="btn-primary" onClick={() => setStatus('idle')}>
              Make Another Booking
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="booking" className={`section ${styles.section}`}>
      <div className="container">
        <div className={styles.header}>
          <p className="eyebrow" style={{ marginBottom: '1rem' }}>Reserve Your Stay</p>
          <h2 className="heading-xl" style={{ marginBottom: '0.5rem' }}>Book House of Hulda</h2>
          <p className="body-lg" style={{ maxWidth: '50ch' }}>
            Fill in the details below and we&apos;ll send you a WhatsApp confirmation within 24 hours.
          </p>
        </div>

        <div className={styles.formLayout}>
          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            {/* Dates */}
            <div className={styles.formGroup}>
              <DateRangePicker
                checkIn={form.checkIn}
                checkOut={form.checkOut}
                onChange={({ checkIn, checkOut }) => {
                  set('checkIn', checkIn);
                  set('checkOut', checkOut);
                }}
              />
              {(errors.checkIn || errors.checkOut) && (
                <p className={styles.error}>{errors.checkIn || errors.checkOut}</p>
              )}
            </div>

            {/* Room selector */}
            <div className={styles.formGroup}>
              <RoomSelector
                selectedRoom={form.room}
                onChange={(id) => set('room', id)}
              />
              {errors.room && <p className={styles.error}>{errors.room}</p>}
            </div>

            {/* Guests */}
            <div className={styles.formGroup}>
              <label className={styles.fieldLabel}>Number of Guests</label>
              <div className={styles.counter}>
                <button
                  type="button"
                  className={styles.counterBtn}
                  onClick={() => set('guests', Math.max(1, form.guests - 1))}
                  aria-label="Decrease guests"
                >−</button>
                <span className={styles.counterVal}>{form.guests}</span>
                <button
                  type="button"
                  className={styles.counterBtn}
                  onClick={() => set('guests', Math.min(selectedRoom?.maxGuests || 4, form.guests + 1))}
                  aria-label="Increase guests"
                >+</button>
              </div>
            </div>

            {/* Contact info */}
            <div className={styles.row}>
              <div className={styles.formGroup}>
                <label className={styles.fieldLabel} htmlFor="name">Your Name *</label>
                <input
                  id="name"
                  type="text"
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  placeholder="Priya Sharma"
                  className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                />
                {errors.name && <p className={styles.error}>{errors.name}</p>}
              </div>
              <div className={styles.formGroup}>
                <label className={styles.fieldLabel} htmlFor="phone">Phone / WhatsApp *</label>
                <input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => set('phone', e.target.value)}
                  placeholder="+91 98765 43210"
                  className={`${styles.input} ${errors.phone ? styles.inputError : ''}`}
                />
                {errors.phone && <p className={styles.error}>{errors.phone}</p>}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.fieldLabel} htmlFor="email">Email (optional)</label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder="priya@example.com"
                className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
              />
              {errors.email && <p className={styles.error}>{errors.email}</p>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.fieldLabel} htmlFor="requests">Special Requests (optional)</label>
              <textarea
                id="requests"
                value={form.requests}
                onChange={(e) => set('requests', e.target.value)}
                placeholder="Dietary requirements, late check-in, anniversary setup..."
                className={styles.textarea}
                rows={3}
              />
            </div>

            {status === 'error' && (
              <p className={styles.errorBanner}>
                Something went wrong. Please try again or WhatsApp us directly.
              </p>
            )}

            <MagneticButton>
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={status === 'loading'}
              >
                {status === 'loading' ? 'Sending…' : 'Book via WhatsApp →'}
              </button>
            </MagneticButton>
          </form>

          {/* Price summary sidebar */}
          <div className={styles.summary}>
            <div className={styles.summaryCard}>
              <p className="eyebrow" style={{ marginBottom: '1.5rem' }}>Your Stay</p>
              {selectedRoom ? (
                <>
                  <div className={styles.summaryRoom}>
                    <img src={selectedRoom.image} alt={selectedRoom.name} className={styles.summaryImg} />
                    <div>
                      <p className={styles.summaryRoomName}>{selectedRoom.name}</p>
                      <p className={styles.summaryPrice}>₹{selectedRoom.pricePerNight.toLocaleString()} / night</p>
                    </div>
                  </div>
                  <div className={styles.dividerLine} />
                  <div className={styles.summaryRows}>
                    <div className={styles.summaryRow}>
                      <span>Nights</span>
                      <span>{nights > 0 ? nights : '—'}</span>
                    </div>
                    <div className={styles.summaryRow}>
                      <span>Guests</span>
                      <span>{form.guests}</span>
                    </div>
                    {total > 0 && (
                      <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
                        <span>Estimated Total</span>
                        <span>₹{total.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <p className={styles.summaryEmpty}>Select a room to see pricing</p>
              )}
              <div className={styles.summaryNote}>
                <span className={styles.whatsappIcon}>✓</span>
                Confirmation via WhatsApp + Email within 24 hours
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
