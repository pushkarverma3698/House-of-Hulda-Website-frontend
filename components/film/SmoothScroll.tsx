'use client';

import { ReactLenis, useLenis } from 'lenis/react';

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  // Configured for cinematic, heavy, fluid feel
  return (
    <ReactLenis root options={{ lerp: 0.05, syncTouch: true, smoothWheel: true }}>
      {children}
    </ReactLenis>
  );
}
