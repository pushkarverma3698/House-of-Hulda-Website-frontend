'use client'

import { useFrame } from '@react-three/fiber'
import { useRef, useMemo, useEffect } from 'react'
import * as THREE from 'three'
import { useNight } from '@/lib/store/night'

const COUNT = 300

function generateSnow() {
  const positions = new Float32Array(COUNT * 3)
  const speeds = new Float32Array(COUNT)
  const offsets = new Float32Array(COUNT)

  for (let i = 0; i < COUNT; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 20
    positions[i * 3 + 1] = (Math.random() - 0.5) * 15
    positions[i * 3 + 2] = (Math.random() - 0.5) * 15
    speeds[i]  = Math.random() * 0.02 + 0.005
    offsets[i] = Math.random() * Math.PI * 2
  }

  return { positions, speeds, offsets }
}

export function Atmosphere() {
  const pointsRef = useRef<THREE.Points>(null)
  const materialRef = useRef<THREE.PointsMaterial>(null)
  const { positions, speeds, offsets } = useMemo(() => generateSnow(), [])

  // Create a procedural radial texture for soft particles
  const texture = useMemo(() => {
    if (typeof document === 'undefined') return null
    const canvas = document.createElement('canvas')
    canvas.width = 32
    canvas.height = 32
    const context = canvas.getContext('2d')
    if (context) {
      const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16)
      gradient.addColorStop(0, 'rgba(255,255,255,1)')
      gradient.addColorStop(1, 'rgba(255,255,255,0)')
      context.fillStyle = gradient
      context.fillRect(0, 0, 32, 32)
    }
    return new THREE.CanvasTexture(canvas)
  }, [])

  useFrame((state) => {
    const t = useNight.getState().t

    if (pointsRef.current) {
      const pos = pointsRef.current.geometry.attributes.position.array as Float32Array
      const elapsed = state.clock.elapsedTime

      for (let i = 0; i < COUNT; i++) {
        // Slow downward drift
        pos[i * 3 + 1] -= speeds[i]
        // Gentle horizontal sway
        pos[i * 3]     += Math.sin(elapsed * 0.5 + offsets[i]) * 0.005
        
        // Wrap vertically
        if (pos[i * 3 + 1] < -7) pos[i * 3 + 1] = 7
      }

      pointsRef.current.geometry.attributes.position.needsUpdate = true
    }

    // Visible in the deep night (t > 0.6)
    if (materialRef.current) {
      let opacity = 0
      if (t > 0.60 && t <= 0.70) {
        opacity = (t - 0.60) / 0.10
      } else if (t > 0.70) {
        opacity = 1.0
      }
      materialRef.current.opacity = Math.max(0, Math.min(0.4, opacity * 0.4))
    }
  })

  if (!texture) return null

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        ref={materialRef}
        size={0.15}
        color="#ffffff"
        map={texture}
        transparent
        opacity={0}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  )
}
