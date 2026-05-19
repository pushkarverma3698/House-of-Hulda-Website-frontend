'use client';
import { useEffect, useRef } from 'react';
import { gsap } from '../lib/gsap';
import { useCart } from '../context/CartContext';
import MagneticButton from './MagneticButton';
import styles from './CartDrawer.module.css';

const WHATSAPP_NUMBER = '919XXXXXXXXX'; // Replace with actual number

function buildMessage(items, subtotal) {
  const lines = items.map(
    (i) => `- ${i.name}${i.weight ? ` (${i.weight})` : ''} × ${i.qty} = ₹${(i.price * i.qty).toLocaleString()}`
  );
  return encodeURIComponent(
    `Hi! I'd like to order from House of Hulda:\n` +
    lines.join('\n') +
    `\nTotal: ₹${subtotal.toLocaleString()}\n` +
    `Please confirm availability and share payment details.`
  );
}

export default function CartDrawer() {
  const { state, dispatch, itemCount, subtotal } = useCart();
  const drawerRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!drawerRef.current) return;
    if (state.isOpen) {
      gsap.to(drawerRef.current, { x: '0%', duration: 0.45, ease: 'power3.out' });
      gsap.to(overlayRef.current, { opacity: 1, pointerEvents: 'auto', duration: 0.35 });
    } else {
      gsap.to(drawerRef.current, { x: '100%', duration: 0.4, ease: 'power3.in' });
      gsap.to(overlayRef.current, { opacity: 0, pointerEvents: 'none', duration: 0.3 });
    }
  }, [state.isOpen]);

  const close = () => dispatch({ type: 'CLOSE_CART' });

  const checkout = () => {
    const msg = buildMessage(state.items, subtotal);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank');
    dispatch({ type: 'CLEAR_CART' });
    close();
  };

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        className={styles.overlay}
        style={{ opacity: 0, pointerEvents: 'none' }}
        onClick={close}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        ref={drawerRef}
        className={styles.drawer}
        style={{ transform: 'translateX(100%)' }}
        aria-label="Shopping cart"
        aria-modal="true"
        role="dialog"
      >
        <div className={styles.header}>
          <div>
            <p className="eyebrow" style={{ marginBottom: '0.25rem' }}>Your Cart</p>
            <p className={styles.itemCount}>{itemCount} item{itemCount !== 1 ? 's' : ''}</p>
          </div>
          <button className={styles.closeBtn} onClick={close} aria-label="Close cart">✕</button>
        </div>

        <div className={styles.items}>
          {state.items.length === 0 ? (
            <div className={styles.empty}>
              <p>Your cart is empty.</p>
              <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--stone)' }}>
                Explore our collection of Himachali products.
              </p>
            </div>
          ) : (
            state.items.map((item) => (
              <div key={item.id} className={styles.item}>
                <img src={item.image} alt={item.name} className={styles.itemImg} />
                <div className={styles.itemInfo}>
                  <p className={styles.itemName}>{item.name}</p>
                  {item.weight && <p className={styles.itemWeight}>{item.weight}</p>}
                  <p className={styles.itemPrice}>₹{item.price.toLocaleString()}</p>
                </div>
                <div className={styles.qtyControls}>
                  <button
                    className={styles.qtyBtn}
                    onClick={() =>
                      item.qty === 1
                        ? dispatch({ type: 'REMOVE_ITEM', id: item.id })
                        : dispatch({ type: 'UPDATE_QTY', id: item.id, qty: item.qty - 1 })
                    }
                    aria-label="Decrease quantity"
                  >−</button>
                  <span className={styles.qty}>{item.qty}</span>
                  <button
                    className={styles.qtyBtn}
                    onClick={() => dispatch({ type: 'UPDATE_QTY', id: item.id, qty: item.qty + 1 })}
                    aria-label="Increase quantity"
                  >+</button>
                </div>
              </div>
            ))
          )}
        </div>

        {state.items.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.subtotalRow}>
              <span>Subtotal</span>
              <span className={styles.subtotal}>₹{subtotal.toLocaleString()}</span>
            </div>
            <p className={styles.footerNote}>Shipping calculated on confirmation</p>
            <MagneticButton strength={0.2}>
              <button className={styles.checkoutBtn} onClick={checkout}>
                Order via WhatsApp →
              </button>
            </MagneticButton>
          </div>
        )}
      </aside>
    </>
  );
}
