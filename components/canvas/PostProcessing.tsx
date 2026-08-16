'use client'

import { useFrame } from '@react-three/fiber'
import { useRef, useState, useEffect } from 'react'
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
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(
        window.innerWidth < 768 || 
        ('ontouchstart' in window) || 
        (navigator.maxTouchPoints && navigator.maxTouchPoints > 0)
      )
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useFrame(() => {
    const t = useNight.getState().t
    const solar = getSolarState(t)
    const targetThreshold = getBloomThreshold(solar.altitude)

    if (bloomRef.current) {
      bloomRef.current.luminanceMaterial.threshold = targetThreshold
    }
  })

  return (
    // @ts-expect-error — disableNormalPass is correct in v3 runtime but types lag
    <EffectComposer disableNormalPass autoClear={false}>
      {isMobile ? null : (
        <Bloom
          ref={bloomRef}
          intensity={2.8}
          luminanceThreshold={0.85}
          luminanceSmoothing={0.15}
          mipmapBlur
        />
      )}
      {isMobile ? null : (
        <ChromaticAberration
          offset={new THREE.Vector2(0.0012, 0.0012)}
          radialModulation={true}
          modulationOffset={0.15}
        />
      )}
      <Vignette eskil={false} offset={0.3} darkness={0.85} />
      <Noise opacity={0.085} />
    </EffectComposer>
  )
}
