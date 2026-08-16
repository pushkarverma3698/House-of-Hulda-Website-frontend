'use client'

import { useFrame } from '@react-three/fiber'
import { useRef, useState } from 'react'
import {
  EffectComposer,
  Bloom,
  Vignette,
  Noise,
  ChromaticAberration,
} from '@react-three/postprocessing'
import { useNight } from '@/lib/store/night'
import { getSolarState, getBloomThreshold } from '@/lib/astro/sun'
import type { BloomEffect } from 'postprocessing'
import * as THREE from 'three'

const detectCoarsePointer = (): boolean => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768
}

export function PostProcessing() {
  const bloomRef = useRef<BloomEffect>(null)

  // Resolved once, lazily, so the composer is never mounted-then-unmounted on
  // mobile — allocating and freeing two fullscreen float render targets during
  // first paint is itself a visible hitch.
  const [isCoarsePointer] = useState(detectCoarsePointer)

  useFrame(() => {
    if (!bloomRef.current) return
    const solar = getSolarState(useNight.getState().t)
    bloomRef.current.luminanceMaterial.threshold = getBloomThreshold(solar.altitude)
  })

  // On mobile the composer previously still ran Vignette + Noise. That is two
  // fullscreen fragment passes plus the composer's own render-target copies
  // every frame — for an effect the `.cine-overlay` CSS layer already draws for
  // free. The whole postprocessing stack is desktop-only.
  if (isCoarsePointer) return null

  return (
    <EffectComposer {...({ disableNormalPass: true } as any)} autoClear={false}>
      <Bloom
        ref={bloomRef}
        intensity={2.8}
        luminanceThreshold={0.85}
        luminanceSmoothing={0.15}
        mipmapBlur
      />
      <ChromaticAberration
        offset={new THREE.Vector2(0.0012, 0.0012)}
        radialModulation={true}
        modulationOffset={0.15}
      />
      <Vignette eskil={false} offset={0.3} darkness={0.85} />
      <Noise opacity={0.085} />
    </EffectComposer>
  )
}
