'use client'

import { useFrame } from '@react-three/fiber'
import { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { useNight } from '@/lib/store/night'

const COUNT = 180

function generateEmbers() {
  const positions = new Float32Array(COUNT * 3)
  const speeds = new Float32Array(COUNT)
  const offsets = new Float32Array(COUNT)

  for (let i = 0; i < COUNT; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 18
    positions[i * 3 + 1] = (Math.random() - 0.5) * 10
    positions[i * 3 + 2] = (Math.random() - 0.5) * 14
    speeds[i]  = Math.random() * 0.012 + 0.003
    offsets[i] = Math.random() * Math.PI * 2
  }

  return { positions, speeds, offsets }
}

export function Embers() {
  const pointsRef = useRef<THREE.Points>(null)
  const materialRef = useRef<THREE.PointsMaterial>(null)
  const { positions, speeds, offsets } = useMemo(() => generateEmbers(), [])

  useFrame((state, _dt) => {
    const t = useNight.getState().t

    if (pointsRef.current) {
      const pos = pointsRef.current.geometry.attributes.position.array as Float32Array
      const elapsed = state.clock.elapsedTime

      for (let i = 0; i < COUNT; i++) {
        // Slow upward drift
        pos[i * 3 + 1] += speeds[i]
        // Gentle horizontal sinusoidal shimmer — firefly motion
        pos[i * 3]     += Math.sin(elapsed * 0.3 + offsets[i]) * 0.005
        pos[i * 3 + 2] += Math.cos(elapsed * 0.25 + offsets[i]) * 0.005
        // Wrap vertically
        if (pos[i * 3 + 1] > 5) pos[i * 3 + 1] = -5
      }

      pointsRef.current.geometry.attributes.position.needsUpdate = true
    }

    // Only visible in the hearth + night window: t=0.48 to t=0.88
    if (materialRef.current) {
      let opacity = 0
      if (t > 0.48 && t <= 0.60) {
        opacity = (t - 0.48) / 0.12
      } else if (t > 0.60 && t <= 0.80) {
        opacity = 1.0
      } else if (t > 0.80 && t <= 0.88) {
        opacity = 1.0 - (t - 0.80) / 0.08
      }
      materialRef.current.opacity = Math.max(0, Math.min(0.75, opacity * 0.75))
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        ref={materialRef}
        size={0.06}
        color="#f5a623"
        transparent
        opacity={0}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  )
}
