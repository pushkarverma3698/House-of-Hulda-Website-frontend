'use client'

import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
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

export function PostProcessing() {
  const bloomRef = useRef<BloomEffect>(null)

  useFrame(() => {
    const t = useNight.getState().t
    const solar = getSolarState(t)
    const targetThreshold = getBloomThreshold(solar.altitude)

    if (bloomRef.current) {
      bloomRef.current.luminanceMaterial.threshold = targetThreshold
    }
  })

  return (
    <EffectComposer disableNormalPass>
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
