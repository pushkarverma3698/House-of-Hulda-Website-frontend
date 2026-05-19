'use client';
import { useRef } from 'react';
import { gsap } from '../lib/gsap';

// Wraps any child with a magnetic pull effect on desktop.
// On touch devices, renders children directly with no effect.
export default function MagneticButton({ children, strength = 0.35, className = '' }) {
  const wrapRef = useRef(null);

  const onMouseMove = (e) => {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * strength;
    const y = (e.clientY - rect.top - rect.height / 2) * strength;
    gsap.to(el, { x, y, duration: 0.4, ease: 'power2.out' });
  };

  const onMouseLeave = () => {
    gsap.to(wrapRef.current, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.3)' });
  };

  return (
    <div
      ref={wrapRef}
      className={`magnetic ${className}`}
      style={{ display: 'inline-block' }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </div>
  );
}
