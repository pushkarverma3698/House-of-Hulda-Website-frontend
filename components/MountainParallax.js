"use client";

import { useRef } from 'react';
import { gsap, ScrollTrigger } from '../lib/gsap';
import { useGSAP } from '@gsap/react';
import styles from './MountainParallax.module.css';
import Image from 'next/image';

export default function MountainParallax({ children }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const bgRef = useRef(null);
  const cabinRef = useRef(null);
  const treesRef = useRef(null);
  const mistRef = useRef(null);

  useGSAP(() => {
    if (!sceneRef.current) return;

    // All parallax triggers use the scene container (the hero viewport)
    const trigger = {
      trigger: sceneRef.current,
      start: 'top top',
      end: 'bottom top',
      scrub: true,
    };

    // Background mountains — drift down slowly
    gsap.to(bgRef.current, {
      y: '25%', ease: 'none',
      scrollTrigger: trigger,
    });

    // Cabin/Middle — moving up slightly
    gsap.to(cabinRef.current, {
      y: '-15%', ease: 'none',
      scrollTrigger: trigger,
    });

    // Foreground trees — rush upward fastest
    gsap.to(treesRef.current, {
      y: '-45%', ease: 'none',
      scrollTrigger: trigger,
    });

    // Mist — opacity fade and slight upward movement
    gsap.to(mistRef.current, {
      y: '-20%',
      opacity: 0.1,
      ease: 'none',
      scrollTrigger: {
        trigger: sceneRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });

  }, { scope: containerRef });

  return (
    <div className={styles.wrapper} ref={containerRef}>

      {/* ═══ THE SCENE — 100vh hero with all mountain layers ═══ */}
      <div className={styles.scene} ref={sceneRef}>

        {/* Sky gradient — pure CSS, no SVG needed */}
        <div className={styles.sky} />

        {/* Subtle film grain texture over the sky */}
        <div className={styles.grain} />

        {/* Layer 1: Himalayan Background (z:1) */}
        <div className={styles.mountainLayer} ref={bgRef} style={{ zIndex: 1 }}>
          <Image src="/mountains/parallax-bg.jpg" alt="Himalayan landscape" fill className={styles.layerImage} priority />
        </div>

        {/* Layer 2: House of Hulda A-Frame (z:5) */}
        <div className={styles.cabinLayer} ref={cabinRef} style={{ zIndex: 5 }}>
          <Image src="/mountains/parallax-house.png" alt="House of Hulda" fill className={styles.layerImage} priority />
        </div>

        {/* Layer 3: Foreground Trees (z:8) */}
        <div className={styles.treesLayer} ref={treesRef} style={{ zIndex: 8 }}>
          <Image src="/mountains/parallax-fg-trees.png" alt="Deodar branches framing view" fill className={styles.layerImage} priority />
        </div>

        {/* Layer 4: Floating Organic Mist (z:9) */}
        <div className={styles.mistLayer} ref={mistRef} style={{ zIndex: 9 }}>
          <div className={styles.mistAnimationWrapper}>
            <Image src="/mountains/parallax-mist.png" alt="" fill className={`${styles.layerImage} ${styles.mistImage}`} priority />
          </div>
        </div>

        {/* Children (Hero text) — overlays the mountain scene */}
        {children}

        {/* Mist — CSS gradient sitting between hills and content */}
        <div className={styles.mistBand} />

      </div>

    </div>
  );
}
