'use client'

import { useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { useNight } from '@/lib/store/night'
import { damp, damp3 } from 'maath/easing'

// The camera focal length (FOV) mapping based on progress t
const FOV_AT = (t: number) => {
  if (t < 0.70) return 45 // Standard lens for ground phases
  if (t < 0.84) return 12 // L-07 Telescope (200mm optics) locking onto the deep sky
  if (t < 0.94) return 82 // L-08 (20mm sky view)
  return 45 // L-09 Dawn (45mm)
}

export function Director() {
  const { camera } = useThree()
  const smooth = useRef(0)
  
  // Keep camera locked at origin (0,0,0) - NO TRANSLATION.
  // The seam and the starfield do not have geometry to support parallax.
  
  const currentLookAt = useRef(new THREE.Vector3(0, 0, -10))
  const targetLookAt = useRef(new THREE.Vector3(0, 0, -10))

  useFrame((state, dt) => {
    const t = useNight.getState().t

    // Critical damping (lambda 3.2 for 70mm heavy physical feel)
    damp(smooth, 'current', t, 3.2, dt)

    // Calculate rotational orientation target based on scroll progress
    if (smooth.current < 0.6) {
      // Act I & II: Looking straight at the horizon where the photographic dissolve happens
      targetLookAt.current.set(0, 0, -10)
    } else if (smooth.current < 0.85) {
      // Act III: Pan up into the night sky (Zenith)
      const panProgress = (smooth.current - 0.6) / 0.25
      targetLookAt.current.set(0, panProgress * 10, -10 + (panProgress * 10)) 
    } else {
      // Dawn: Settle back towards the horizon
      const settleProgress = (smooth.current - 0.85) / 0.15
      targetLookAt.current.set(0, 10 - (settleProgress * 10), 0 - (settleProgress * 10))
    }

    // Smoothly orient the camera
    damp3(currentLookAt.current, targetLookAt.current, 2.5, dt)
    camera.position.set(0, 0, 0)
    camera.lookAt(currentLookAt.current)

    // Handheld camera noise (disabled during telescope act L-07)
    const act = useNight.getState().act
    const handheldWeight = act === 'L-07' ? 0 : 1
    const noise = Math.sin(state.clock.elapsedTime * 0.12) * 0.0006 * handheldWeight
    camera.rotation.z = noise

    // Smooth FOV interpolation
    const targetFov = FOV_AT(smooth.current)
    if (Math.abs((camera as THREE.PerspectiveCamera).fov - targetFov) > 0.1) {
      damp(camera as any, 'fov', targetFov, 2.5, dt)
      ;(camera as THREE.PerspectiveCamera).updateProjectionMatrix()
    }
  })

  return null
}
