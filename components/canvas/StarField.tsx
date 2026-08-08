'use client'

import { useFrame } from '@react-three/fiber'
import { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { useNight } from '@/lib/store/night'
import { getSolarState } from '@/lib/astro/sun'

// Generates procedural star points representing the bright star catalog
function generateStarPositions(count: number = 1800) {
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const sizes = new Float32Array(count)

  const colorPalette = [
    new THREE.Color('#9BB0FF'), // O/B type blue
    new THREE.Color('#CAD8FF'), // A type white-blue
    new THREE.Color('#FBF8FF'), // F type white
    new THREE.Color('#FFF4EA'), // G type yellow (like Sun)
    new THREE.Color('#FFD2A1'), // K type orange
    new THREE.Color('#FFAD51'), // M type red
  ]

  for (let i = 0; i < count; i++) {
    // Distribute randomly on a celestial sphere of radius 350
    const u = Math.random()
    const v = Math.random()
    const theta = u * 2.0 * Math.PI
    const phi = Math.acos(2.0 * v - 1.0)
    const radius = 350

    const x = radius * Math.sin(phi) * Math.cos(theta)
    const y = radius * Math.sin(phi) * Math.sin(theta)
    const z = radius * Math.cos(phi)

    positions[i * 3] = x
    positions[i * 3 + 1] = y
    positions[i * 3 + 2] = z

    // Random star color from spectral classes
    const c = colorPalette[Math.floor(Math.random() * colorPalette.length)]
    colors[i * 3] = c.r
    colors[i * 3 + 1] = c.g
    colors[i * 3 + 2] = c.b

    // Size based on magnitude simulation (power law)
    sizes[i] = Math.pow(Math.random(), 3) * 3.5 + 0.8
  }

  return { positions, colors, sizes }
}

export function StarField() {
  const pointsRef = useRef<THREE.Points>(null)
  const materialRef = useRef<THREE.PointsMaterial>(null)

  const { positions, colors } = useMemo(() => generateStarPositions(2000), [])

  useFrame((_, dt) => {
    const t = useNight.getState().t
    const solar = getSolarState(t)

    // Sidereal rotation — star sphere rotates slowly around Earth axis
    if (pointsRef.current) {
      pointsRef.current.rotation.y = t * Math.PI * 0.4
      pointsRef.current.rotation.z = 0.56 // 32.12° latitude tilt
    }

    // Stars fade in smoothly as sun descends below -4° to -14° (nautical & astro dark)
    if (materialRef.current) {
      let visibility = 0
      if (solar.altitude <= -4) {
        visibility = Math.min(1, Math.max(0, (-4 - solar.altitude) / 10))
      }
      materialRef.current.opacity = visibility
      materialRef.current.transparent = true
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        ref={materialRef}
        size={1.8}
        vertexColors
        sizeAttenuation={false}
        opacity={0}
        transparent
        depthWrite={false}
      />
    </points>
  )
}
