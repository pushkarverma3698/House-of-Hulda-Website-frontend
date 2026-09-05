'use client';

import { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerformanceMonitor, Preload } from '@react-three/drei';
import { CameraRig } from './CameraRig';
import { Effects } from './Effects';
import { CinematicSpine } from './CinematicSpine';

const detectCoarsePointer = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768;
};

/**
 * Global R3F Canvas Root.
 * Mounted once at z-0 behind the semantic HTML scroll tree.
 * Automatically manages DPR clamping and performance scaling.
 */
export function CanvasRoot({ children }: { children?: React.ReactNode }) {
  const [dpr, setDpr] = useState(1.5);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mobile = detectCoarsePointer();
    setIsMobile(mobile);
    if (mobile) setDpr(1.0);
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none bg-ink select-none overflow-hidden">
      <Canvas
        dpr={dpr}
        gl={{
          antialias: !isMobile,
          powerPreference: 'high-performance',
          alpha: true,
          stencil: false,
          depth: true,
        }}
        camera={{ fov: 42, near: 0.1, far: 120, position: [0, 1.2, 8] }}
        style={{ pointerEvents: 'none' }}
      >
        <PerformanceMonitor
          onDecline={() => setDpr(1.0)}
          onIncline={() => setDpr(isMobile ? 1.0 : 1.5)}
        />
        <CameraRig />
        <Effects />
        <Suspense fallback={null}>
          {children || <CinematicSpine />}
          <Preload all />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default CanvasRoot;
