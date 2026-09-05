'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useNight, actFor } from '@/lib/store/night';
import { getSolarState } from '@/lib/astro/sun';

/**
 * Singleton scroll state readable directly from inside R3F useFrame loops
 * and WebGL shaders without triggering React re-renders.
 */
export const scrollState = {
  /** Normalized page scroll: 0.0 to 1.0 */
  progress: 0,
  /** Smoothed scroll velocity for dynamic GLSL distortion */
  velocity: 0,
  /** Scroll direction: 1 = down, -1 = up */
  direction: 1,
};

let initialized = false;
let globalLenis: Lenis | null = null;

export function getLenis(): Lenis | null {
  return globalLenis;
}

/**
 * Binds Lenis smooth scrolling to GSAP ScrollTrigger via gsap.ticker.
 * Single unified RAF source with zero double-smoothing.
 * Also synchronizes the canonical narrative time into useNight store.
 */
export function useScrollRig() {
  useEffect(() => {
    if (initialized) return;
    initialized = true;

    gsap.registerPlugin(ScrollTrigger);

    const isCoarse =
      typeof window !== 'undefined' &&
      (window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768);

    const wrapper = document.getElementById('scroll-wrapper');
    const content = document.getElementById('scroll-content');

    if (wrapper) {
      ScrollTrigger.defaults({ scroller: wrapper });
    }
    const lenis = new Lenis({
      wrapper: wrapper || window,
      content: content || document.documentElement,
      lerp: isCoarse ? 0.12 : 0.09,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
      smoothWheel: true,
      syncTouch: false, // native momentum on mobile devices
    });
    globalLenis = lenis;

    const EPSILON = 1 / 4096;
    let lastP = -1;

    lenis.on('scroll', (e: Lenis) => {
      const p = e.limit > 0 ? Math.max(0, Math.min(1, e.scroll / e.limit)) : 0;
      scrollState.progress = p;
      scrollState.velocity = e.velocity;
      scrollState.direction = e.direction >= 0 ? 1 : -1;

      ScrollTrigger.update();

      // Throttle Zustand updates by EPSILON to avoid layout churn
      if (Math.abs(p - lastP) >= EPSILON) {
        lastP = p;
        const solar = getSolarState(p);
        useNight.setState({
          t: p,
          act: actFor(p),
          sunAlt: solar.altitude,
          nightBlend: solar.altitude < -12 ? 1 : solar.altitude > 2 ? 0 : (2 - solar.altitude) / 14,
        });
      }
    });

    const raf = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      ScrollTrigger.killAll();
      globalLenis = null;
      initialized = false;
    };
  }, []);
}
