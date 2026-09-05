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
      const updateRaf = (time: number) => {
        lenis.raf(time * 1000);
      };
      gsap.ticker.add(updateRaf);
      gsap.ticker.lagSmoothing(0);

      return () => {
        gsap.ticker.remove(updateRaf);
      };
    }
  }, [lenis]);

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.065, // Luxurious, weighted cinematic easing
        wheelMultiplier: 0.95,
        touchMultiplier: 1.25,
        infinite: false,
        smoothWheel: true,
        syncTouch: false, // Fluid native touch inertia on mobile
      }}
    >
      {children}
    </ReactLenis>
  );
}
