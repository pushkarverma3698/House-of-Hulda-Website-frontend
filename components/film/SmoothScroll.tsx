'use client';

import { ReactLenis, useLenis } from 'lenis/react';
import { useEffect } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenis = useLenis(ScrollTrigger.update);

  useEffect(() => {
    if (lenis) {
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
      ScrollTrigger.normalizeScroll(true); // Safari fix
    }
    return () => {
      gsap.ticker.remove((time) => {
        lenis?.raf(time * 1000);
      });
    };
  }, [lenis]);

  return (
    <ReactLenis root options={{ lerp: 0.05, syncTouch: true, smoothWheel: true }}>
      {children}
    </ReactLenis>
  );
}
