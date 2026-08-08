'use client'

import { useFrame } from '@react-three/fiber'
import { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { useNight } from '@/lib/store/night'
import { getSolarState, getSkyColors } from '@/lib/astro/sun'

const vertexShader = /* glsl */ `
  varying vec3 vWorldPosition;
  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  uniform vec3 uTopColor;
  uniform vec3 uBottomColor;
  uniform float uOffset;
  uniform float uExponent;
  uniform float uOpacity;
  varying vec3 vWorldPosition;

  void main() {
    float h = normalize(vWorldPosition + vec3(0.0, uOffset, 0.0)).y;
    float factor = max(pow(max(h, 0.0), uExponent), 0.0);
    gl_FragColor = vec4(mix(uBottomColor, uTopColor, factor), uOpacity);
  }
`

export function SkyBox() {
  const materialRef = useRef<THREE.ShaderMaterial>(null)

  const uniforms = useMemo(
    () => ({
      uTopColor: { value: new THREE.Color('#020408') },
      uBottomColor: { value: new THREE.Color('#0A0810') },
      uOffset: { value: 33 },
      uExponent: { value: 0.6 },
      uOpacity: { value: 0 },
    }),
    []
  )

  useFrame(() => {
    const t = useNight.getState().t
    const solar = getSolarState(t)
    const [topHex, bottomHex] = getSkyColors(solar.altitude)

    if (materialRef.current) {
      materialRef.current.uniforms.uTopColor.value.set(topHex)
      materialRef.current.uniforms.uBottomColor.value.set(bottomHex)
      // Skybox fades in as we approach nightfall (t > 0.70)
      const skyOpacity = Math.max(0, Math.min(1, (t - 0.70) / 0.20))
      materialRef.current.uniforms.uOpacity.value = skyOpacity
    }
  })

  return (
    <mesh scale={[-1, 1, 1]}>
      <sphereGeometry args={[400, 32, 15]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        side={THREE.BackSide}
        transparent
        depthWrite={false}
      />
    </mesh>
  )
}
