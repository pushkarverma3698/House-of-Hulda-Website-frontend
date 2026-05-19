'use client';
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { products, categories } from '../../lib/productData';
import ProductCard from '../../components/ProductCard';
import { useCart } from '../../context/CartContext';
import styles from './page.module.css';

function CartIcon() {
  const { itemCount, dispatch } = useCart();
  return (
    <button
      className={styles.cartIcon}
      onClick={() => dispatch({ type: 'OPEN_CART' })}
      aria-label={`Open cart, ${itemCount} items`}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 01-8 0"/>
      </svg>
      {itemCount > 0 && <span className={styles.badge}>{itemCount}</span>}
    </button>
  );
}

export default function ShopPage() {
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = activeCategory === 'All'
    ? products
    : products.filter((p) => p.category === activeCategory);

  return (
    <>

      <div className={styles.page}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerInner}>
            <Link href="/" className={styles.backLink}>← House of Hulda</Link>
            <div className={styles.headerCenter}>
              <p className="eyebrow" style={{ marginBottom: '0.5rem' }}>
                Local Artisans · Naggar · Himachal Pradesh
              </p>
              <h1 className={`heading-xl ${styles.pageTitle}`}>From the Hills</h1>
            </div>
            <CartIcon />
          </div>
        </header>

        {/* Category filters */}
        <div className={styles.filters}>
          <div className={styles.filtersInner}>
            {categories.map((cat) => (
              <button
                key={cat}
                className={`${styles.filterBtn} ${activeCategory === cat ? styles.filterActive : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product grid */}
        <main className={styles.main}>
          <div className="container">
            <div className={styles.meta}>
              <p className={styles.resultCount}>
                {filtered.length} product{filtered.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className={styles.grid}>
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </main>

        {/* Footer strip */}
        <footer className={styles.shopFooter}>
          <p>All products are sourced directly from artisans and farmers in Himachal Pradesh.</p>
          <Link href="/" className={styles.footerLink}>← Back to House of Hulda</Link>
        </footer>
      </div>
    </>
  );
}
