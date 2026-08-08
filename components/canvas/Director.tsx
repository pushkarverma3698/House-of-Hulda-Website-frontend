'use client'

import { useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { useNight } from '@/lib/store/night'
import { damp } from 'maath/easing'

// CatmullRom splines for the camera position and aim target
const posKnots = [
  new THREE.Vector3(0, 2, 10),      // L-01: Valley road entrance
  new THREE.Vector3(0, 2, 5),       // L-02: Kath-Kuni courtyard
  new THREE.Vector3(0, 1.5, 2),     // L-03: Alpenglow balcony view
  new THREE.Vector3(0, 1.2, 0.5),   // L-04: Suite interior & outdoor tub
  new THREE.Vector3(0, 0.2, -0.2),  // L-05: Tub water level (Inversion)
  new THREE.Vector3(0, 1.8, -2),    // L-06: Hearth fire & courtyard tilt
  new THREE.Vector3(0, 2.5, -4),    // L-07: Telescope mounting deck
  new THREE.Vector3(0, 4.0, -8),    // L-08: Wide Milky Way panoramic view
  new THREE.Vector3(0, 2.0, 10),    // L-09: Himalayan dawn sunrise
]

const aimKnots = [
  new THREE.Vector3(0, 2, 0),
  new THREE.Vector3(0, 1.5, 0),
  new THREE.Vector3(0, 1.2, -5),
  new THREE.Vector3(0, 1.0, -5),
  new THREE.Vector3(0, -2.0, -5),  // Looking down into tub reflection (Inversion)
  new THREE.Vector3(0, 8.0, -10),  // Looking up at sky igniting
  new THREE.Vector3(0, 12.0, -20), // Telescope aiming at deep space
  new THREE.Vector3(0, 15.0, -30), // Milky Way zenith
  new THREE.Vector3(0, 3.0, -20),  // Sunrise horizon
]

const posCurve = new THREE.CatmullRomCurve3(posKnots, false, 'catmullrom', 0.35)
const aimCurve = new THREE.CatmullRomCurve3(aimKnots, false, 'catmullrom', 0.5)

// The focal length (FOV) mapping based on progress t
const FOV_AT = (t: number) => {
  if (t < 0.08) return 28 // L-01 (85mm equivalent)
  if (t < 0.20) return 34 // L-02 (65mm)
  if (t < 0.32) return 30 // L-03 (75mm)
  if (t < 0.44) return 40 // L-04 (50mm)
  // L-05 (Vertigo Contra-zoom: 40° -> 78°)
  if (t < 0.56) {
    const localT = (t - 0.44) / (0.56 - 0.44)
    return THREE.MathUtils.lerp(40, 78, localT)
  }
  if (t < 0.70) return 78 // L-06 (22mm wide)
  if (t < 0.84) return 12 // L-07 Telescope (200mm optics)
  if (t < 0.94) return 82 // L-08 (20mm sky view)
  return 45 // L-09 Dawn (45mm)
}

// Camera Z-rotation roll for L-05 Vertigo Inversion (0° -> 180° roll)
const INVERSION_ROLL_AT = (t: number) => {
  if (t < 0.44) return 0
  if (t > 0.56) return Math.PI // 180° flipped
  const localT = (t - 0.44) / (0.56 - 0.44)
  // Smoothstep interpolation for 180° roll
  const smoothT = localT * localT * (3 - 2 * localT)
  return smoothT * Math.PI
}

export function Director() {
  const { camera } = useThree()
  const smooth = useRef(0)
  const aimTarget = useRef(new THREE.Vector3())

  useFrame((state, dt) => {
    const t = useNight.getState().t

    // Critical damping (lambda 3.2 for 70mm heavy physical feel)
    damp(smooth, 'current', t, 3.2, dt)

    // Evaluate position and aim splines
    posCurve.getPointAt(smooth.current, camera.position)
    aimCurve.getPointAt(smooth.current, aimTarget.current)

    // Camera lookAt
    camera.lookAt(aimTarget.current)

    // Handheld camera noise (disabled during telescope act L-07)
    const act = useNight.getState().act
    const handheldWeight = act === 'L-07' ? 0 : 1
    const noise = Math.sin(state.clock.elapsedTime * 0.12) * 0.0006 * handheldWeight

    // L-05 Vertigo Inversion Z-Roll + Handheld noise
    const rollAngle = INVERSION_ROLL_AT(smooth.current)
    camera.rotation.z = rollAngle + noise

    // Smooth FOV interpolation
    const targetFov = FOV_AT(smooth.current)
    if (Math.abs((camera as THREE.PerspectiveCamera).fov - targetFov) > 0.1) {
      damp(camera as any, 'fov', targetFov, 2.5, dt)
      ;(camera as THREE.PerspectiveCamera).updateProjectionMatrix()
    }
  })

  return null
}
