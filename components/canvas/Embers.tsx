'use client'

import { useFrame } from '@react-three/fiber'
import { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { useNight } from '@/lib/store/night'
import { getPointSprite } from '@/lib/three/pointSprite'

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
  const sprite = useMemo(() => getPointSprite(), [])

  useFrame((state, _dt) => {
    const t = useNight.getState().t

    // Only visible in the hearth + night window: t=0.48 to t=0.88
    let opacity = 0
    if (t > 0.48 && t <= 0.60) {
      opacity = (t - 0.48) / 0.12
    } else if (t > 0.60 && t <= 0.80) {
      opacity = 1.0
    } else if (t > 0.80 && t <= 0.88) {
      opacity = 1.0 - (t - 0.80) / 0.08
    }

    if (materialRef.current) {
      materialRef.current.opacity = Math.max(0, Math.min(0.75, opacity * 0.75))
    }

    // Skip the CPU integration and the full position-buffer re-upload while
    // invisible — that is ~60% of the scroll spent animating nothing.
    if (opacity <= 0) {
      if (pointsRef.current) pointsRef.current.visible = false
      return
    }

    if (pointsRef.current) {
      pointsRef.current.visible = true
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
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        ref={materialRef}
        // Larger than the old 0.06 because the sprite's falloff means most of
        // the quad is transparent — the lit core is about a third of it, so the
        // ember reads at roughly its previous size but as a glow, not a block.
        size={0.16}
        map={sprite}
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
