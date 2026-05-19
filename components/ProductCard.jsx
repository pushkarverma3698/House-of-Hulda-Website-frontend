'use client';
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '../lib/gsap';
import { useCart } from '../context/CartContext';
import MagneticButton from './MagneticButton';
import styles from './ProductCard.module.css';

export default function ProductCard({ product }) {
  const { dispatch } = useCart();
  const imgRef = useRef(null);

  const addToCart = () => {
    dispatch({
      type: 'ADD_ITEM',
      item: {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        weight: product.weight,
      },
    });
  };

  return (
    <div className={styles.card}>
      <div className={styles.imageWrap}>
        <img
          ref={imgRef}
          src={product.image}
          alt={product.name}
          className={styles.image}
          loading="lazy"
        />
        <span className={styles.category}>{product.category}</span>
      </div>

      <div className={styles.content}>
        <div className={styles.top}>
          <h3 className={styles.name}>{product.name}</h3>
          {product.weight && <span className={styles.weight}>{product.weight}</span>}
        </div>
        <p className={styles.desc}>{product.description}</p>

        <div className={styles.footer}>
          <span className={styles.price}>₹{product.price.toLocaleString()}</span>
          <MagneticButton strength={0.25}>
            <button className={styles.addBtn} onClick={addToCart} aria-label={`Add ${product.name} to cart`}>
              + Add
            </button>
          </MagneticButton>
        </div>
      </div>
    </div>
  );
}
