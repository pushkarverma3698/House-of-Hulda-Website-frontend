'use client';
import styles from './RoomSelector.module.css';
import { rooms } from '../lib/roomData';

export default function RoomSelector({ selectedRoom, onChange }) {
  return (
    <div className={styles.wrap}>
      <p className={styles.groupLabel}>Select Room</p>
      <div className={styles.grid}>
        {rooms.map((room) => (
          <label
            key={room.id}
            className={`${styles.card} ${selectedRoom === room.id ? styles.selected : ''}`}
          >
            <input
              type="radio"
              name="room"
              value={room.id}
              checked={selectedRoom === room.id}
              onChange={() => onChange(room.id)}
              className={styles.radio}
            />
            <img src={room.image} alt={room.name} className={styles.image} />
            <div className={styles.info}>
              <span className={styles.name}>{room.name}</span>
              <span className={styles.price}>₹{room.pricePerNight.toLocaleString()}/night</span>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
