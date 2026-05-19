'use client';
import { useState } from 'react';
import styles from './DateRangePicker.module.css';

function pad(n) { return String(n).padStart(2, '0'); }
function toYMD(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
function fromYMD(str) { return str ? new Date(str + 'T00:00:00') : null; }
function formatDisplay(date) {
  if (!date) return '';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
function diffDays(a, b) {
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

const today = toYMD(new Date());

export default function DateRangePicker({ checkIn, checkOut, onChange }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.field}>
        <label className={styles.label}>Check-in</label>
        <input
          type="date"
          className={styles.input}
          value={checkIn}
          min={today}
          onChange={(e) => onChange({ checkIn: e.target.value, checkOut })}
        />
        <span className={styles.display}>
          {checkIn ? formatDisplay(fromYMD(checkIn)) : 'Select date'}
        </span>
      </div>
      <div className={styles.arrow} aria-hidden="true">→</div>
      <div className={styles.field}>
        <label className={styles.label}>Check-out</label>
        <input
          type="date"
          className={styles.input}
          value={checkOut}
          min={checkIn || today}
          onChange={(e) => onChange({ checkIn, checkOut: e.target.value })}
        />
        <span className={styles.display}>
          {checkOut ? formatDisplay(fromYMD(checkOut)) : 'Select date'}
        </span>
      </div>
      {checkIn && checkOut && (
        <div className={styles.nights}>
          {diffDays(fromYMD(checkIn), fromYMD(checkOut))} nights
        </div>
      )}
    </div>
  );
}
