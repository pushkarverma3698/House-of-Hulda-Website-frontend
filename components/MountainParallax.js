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
  const peaksRef = useRef(null);
  const treelineMidRef = useRef(null);
  const cabinRef = useRef(null);
  const treesRef = useRef(null);
  const mistRef = useRef(null);

  useGSAP(() => {
    if (!sceneRef.current) return;

    const trigger = {
      trigger: sceneRef.current,
      start: 'top top',
      end: 'bottom top',
      scrub: true,
    };

    // Layer 1: Background mountains — drift down slowest
    gsap.to(bgRef.current, { y: '25%', ease: 'none', scrollTrigger: trigger });

    // Layer 2: Snow peaks — slightly faster than bg
    gsap.to(peaksRef.current, { y: '18%', ease: 'none', scrollTrigger: trigger });

    // Layer 3: Mid treeline — medium-slow
    gsap.to(treelineMidRef.current, { y: '8%', ease: 'none', scrollTrigger: trigger });

    // Layer 4: Cabin — moves up as you scroll (medium)
    gsap.to(cabinRef.current, { y: '-15%', ease: 'none', scrollTrigger: trigger });

    // Layer 5: Foreground trees — rush upward fastest
    gsap.to(treesRef.current, { y: '-45%', ease: 'none', scrollTrigger: trigger });

    // Layer 6: Mist — fade and move upward
    gsap.to(mistRef.current, {
      y: '-20%',
      opacity: 0.1,
      ease: 'none',
      scrollTrigger: trigger,
    });

  }, { scope: containerRef });

  return (
    <div className={styles.wrapper} ref={containerRef}>
      <div className={styles.scene} ref={sceneRef}>

        {/* Sky gradient */}
        <div className={styles.sky} />

        {/* Film grain */}
        <div className={styles.grain} />

        {/* Horizon atmospheric glow — warm cinematic light at ridge line */}
        <div className={styles.horizonGlow} />

        {/* Layer 1: Himalayan background (z:1) */}
        <div className={styles.mountainLayer} ref={bgRef} style={{ zIndex: 1 }}>
          <Image src="/mountains/parallax-bg.jpg" alt="Himalayan landscape" fill sizes="100vw" className={styles.layerImage} priority />
        </div>

        {/* Layer 2: Snow peaks silhouettes (z:2) — SVG inline, no asset needed */}
        <div className={styles.mountainLayer} ref={peaksRef} style={{ zIndex: 2 }}>
          <svg className={styles.svgLayer} viewBox="0 0 1440 900" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
            {/* Far ridge — most distant, lightest blue */}
            <path d="M0 900 L0 680 L90 640 L160 600 L220 570 L280 540 L340 510 L400 490 L450 470 L500 450 L560 430 L620 410 L680 390 L740 380 L800 390 L860 370 L920 360 L980 375 L1040 355 L1100 370 L1160 385 L1220 400 L1280 420 L1340 440 L1390 460 L1440 475 L1440 900 Z" fill="#12243A" opacity="0.75"/>
            {/* Main peaks — jagged, more prominent */}
            <path d="M0 900 L0 720 L60 700 L100 680 L140 660 L180 620 L210 590 L240 560 L280 530 L310 500 L340 470 L370 450 L400 420 L430 400 L460 380 L490 360 L520 340 L550 360 L580 330 L610 310 L640 290 L670 310 L700 280 L730 260 L760 250 L790 270 L820 250 L850 270 L880 260 L910 280 L940 270 L970 290 L1000 310 L1030 330 L1060 310 L1090 340 L1120 360 L1150 380 L1180 400 L1210 420 L1240 445 L1270 465 L1300 490 L1330 515 L1370 545 L1410 575 L1440 600 L1440 900 Z" fill="#1A3050" opacity="0.9"/>
            {/* Snow caps highlight — softly lit peaks */}
            <path d="M610 310 L590 355 L635 355 Z M700 280 L678 328 L722 328 Z M730 260 L706 310 L754 310 Z M760 250 L734 302 L786 302 Z M790 270 L766 316 L814 316 Z M820 250 L796 300 L844 300 Z M850 270 L828 316 L872 316 Z" fill="rgba(200,220,255,0.55)"/>
            {/* Horizon glow — warm atmosphere at the ridge line */}
            <ellipse cx="720" cy="440" rx="500" ry="120" fill="rgba(100,130,180,0.08)"/>
          </svg>
        </div>

        {/* Layer 3: Mid-distance deodar treeline (z:3) — SVG inline, no asset needed */}
        <div className={styles.mountainLayer} ref={treelineMidRef} style={{ zIndex: 3 }}>
          <svg className={styles.svgLayer} viewBox="0 0 1440 900" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
            {/* Dense pine forest body */}
            <path d="M0 900 L0 730 L30 710 L60 690 L90 665 L120 645 L150 620 L180 598 L210 575 L240 555 L270 535 L300 515 L330 495 L360 478 L390 462 L420 448 L450 435 L480 422 L510 410 L540 422 L570 408 L600 395 L630 408 L660 395 L690 382 L720 370 L750 382 L780 368 L810 380 L840 368 L870 382 L900 395 L930 408 L960 395 L990 410 L1020 425 L1050 440 L1080 458 L1110 475 L1140 492 L1170 510 L1200 528 L1230 548 L1260 568 L1290 590 L1320 612 L1350 635 L1380 660 L1410 685 L1440 710 L1440 900 Z" fill="#0A180A" opacity="0.97"/>
            {/* Individual pine tips — adds texture and realism */}
            <path d="M40 710 L26 745 L54 745 Z M100 688 L84 726 L116 726 Z M160 660 L142 700 L178 700 Z M220 638 L202 678 L238 678 Z M280 616 L262 656 L298 656 Z M340 594 L322 634 L358 634 Z M400 575 L382 615 L418 615 Z M460 556 L442 596 L478 596 Z M520 538 L502 578 L538 578 Z M580 520 L562 560 L598 560 Z M640 508 L622 548 L658 548 Z M700 495 L682 535 L718 535 Z M760 483 L742 523 L778 523 Z M820 493 L802 533 L838 533 Z M880 505 L862 545 L898 545 Z M940 520 L922 560 L958 560 Z M1000 535 L982 575 L1018 575 Z M1060 552 L1042 592 L1078 592 Z M1120 572 L1102 612 L1138 612 Z M1180 592 L1162 632 L1198 632 Z M1240 614 L1222 654 L1258 654 Z M1300 638 L1282 678 L1318 678 Z M1360 662 L1342 702 L1378 702 Z M1420 688 L1402 728 L1438 728 Z" fill="#122012" opacity="0.9"/>
          </svg>
        </div>

        {/* Layer 4: Kath Kuni cabin (z:5) */}
        <div className={styles.cabinLayer} ref={cabinRef} style={{ zIndex: 5 }}>
          <Image src="/mountains/parallax-house.png" alt="House of Hulda" fill sizes="100vw" className={styles.layerImage} priority />
        </div>

        {/* Layer 5: Foreground trees (z:8) */}
        <div className={styles.treesLayer} ref={treesRef} style={{ zIndex: 8 }}>
          <Image src="/mountains/parallax-fg-trees.png" alt="Deodar branches" fill sizes="100vw" className={styles.layerImage} priority />
        </div>

        {/* Layer 6: Mist (z:9) */}
        <div className={styles.mistLayer} ref={mistRef} style={{ zIndex: 9 }}>
          <div className={styles.mistAnimationWrapper}>
            <Image src="/mountains/parallax-mist.png" alt="" fill sizes="100vw" className={`${styles.layerImage} ${styles.mistImage}`} priority />
          </div>
        </div>

        {/* Hero text overlay */}
        {children}

        {/* Bottom gradient transition */}
        <div className={styles.mistBand} />

      </div>
    </div>
  );
}
