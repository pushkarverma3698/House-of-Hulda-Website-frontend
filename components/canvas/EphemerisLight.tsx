'use client'

import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { useNight } from '@/lib/store/night'
import {
  getSolarState,
  getSunDirection,
  getSunColor,
  getSunIntensity,
  getPracticalIntensity,
} from '@/lib/astro/sun'

/**
 * EphemerisLight — the lighting rig for the entire film.
 *
 * Two light sources:
 * 1. DirectionalLight (the sun) — color, intensity, and direction
 *    all driven by SunCalc based on scroll progress `t`.
 * 2. PointLight (the warm practical) — a single #FF9A4D light
 *    representing the house windows. Below civil twilight,
 *    this becomes the dominant light and carries the emotional weight.
 *
 * Both are updated in useFrame (60fps) using getState() — never hooks.
 */
export function EphemerisLight() {
  const sunRef = useRef<THREE.DirectionalLight>(null)
  const practicalRef = useRef<THREE.PointLight>(null)
  const ambientRef = useRef<THREE.AmbientLight>(null)

  useFrame(() => {
    const t = useNight.getState().t
    const solar = getSolarState(t)
    const [sx, sy, sz] = getSunDirection(t)

    // --- Sun directional light ---
    if (sunRef.current) {
      sunRef.current.position.set(sx * 50, sy * 50, sz * 50)
      sunRef.current.color.set(getSunColor(solar.altitude))
      sunRef.current.intensity = getSunIntensity(solar.altitude)
    }

    // --- Warm practical (house windows) ---
    if (practicalRef.current) {
      practicalRef.current.intensity = getPracticalIntensity(solar.altitude)
    }

    // --- Ambient: dim blue at night, brighter during day ---
    if (ambientRef.current) {
      if (solar.altitude > 0) {
        ambientRef.current.color.set('#C8D8F0')
        ambientRef.current.intensity = 0.3
      } else {
        ambientRef.current.color.set('#1A1A2E')
        ambientRef.current.intensity = 0.08
      }
    }
  })

  return (
    <>
      <directionalLight
        ref={sunRef}
        position={[30, 30, 30]}
        intensity={1.2}
        color="#FFF4E0"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight
        ref={practicalRef}
        position={[0, 1.5, 0]} // Will be at the house window position
        color="#FF9A4D"
        intensity={0.1}
        distance={30}
        decay={2}
      />
      <ambientLight
        ref={ambientRef}
        intensity={0.3}
        color="#C8D8F0"
      />
    </>
  )
}
