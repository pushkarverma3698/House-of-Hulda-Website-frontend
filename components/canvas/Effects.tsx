'use client';

import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  Vignette,
  Noise,
} from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { Vector2 } from 'three';
import { useState, useEffect } from 'react';

const detectCoarsePointer = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768;
};

/**
 * Cinematic post-processing pipeline.
 * Desktop: Bloom glow, subtle optical chromatic aberration, film grain, and vignette.
 * Mobile: Automatically bypassed to guarantee locked 60fps and zero thermal throttling.
 */
export function Effects() {
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    setIsMobile(detectCoarsePointer());
  }, []);

  // Strict mobile performance rule: bypass EffectComposer completely on mobile
  if (isMobile) {
    return null;
  }

  return (
    <EffectComposer multisampling={0}>
      <Bloom
        luminanceThreshold={0.65}
        luminanceSmoothing={0.3}
        intensity={1.2}
        mipmapBlur
      />
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={new Vector2(0.0006, 0.0006)}
        radialModulation
        modulationOffset={0.5}
      />
      <Noise opacity={0.028} blendFunction={BlendFunction.OVERLAY} />
      <Vignette eskil={false} offset={0.15} darkness={1.05} />
    </EffectComposer>
  );
}
