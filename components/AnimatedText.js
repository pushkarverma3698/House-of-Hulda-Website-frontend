"use client";

import { useRef, useEffect } from 'react';
import { gsap, ScrollTrigger } from '../lib/gsap';
import { useGSAP } from '@gsap/react';
import SplitType from 'split-type';
import styles from './AnimatedText.module.css';

export default function AnimatedText({ children, className = "", tag: Tag = "div", delay = 0 }) {
  const textRef = useRef(null);

  useGSAP(() => {
    if (!textRef.current) return;

    // Split text into lines and words
    const split = new SplitType(textRef.current, { types: 'lines, words' });
    
    // Set initial state for the words: wrapped in a hidden overflow and translated down
    gsap.set(split.words, { yPercent: 100, opacity: 0 });

    ScrollTrigger.create({
      trigger: textRef.current,
      start: "top 85%", // Triggers when the top of the element hits 85% of the viewport height
      onEnter: () => {
        gsap.to(split.words, {
          yPercent: 0,
          opacity: 1,
          duration: 1.2,
          ease: "power4.out",
          stagger: 0.05,
          delay: delay
        });
      },
      once: true
    });

    return () => {
      split.revert(); // clean up on unmount
    };
  }, { scope: textRef });

  return (
    <Tag className={`${styles.animatedText} ${className}`} ref={textRef}>
      {children}
    </Tag>
  );
}
