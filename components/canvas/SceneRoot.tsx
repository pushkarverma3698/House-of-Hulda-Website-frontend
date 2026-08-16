'use client'

import { Canvas } from '@react-three/fiber'
import { Director } from './Director'
import { EphemerisLight } from './EphemerisLight'
import { SkyBox } from './SkyBox'
import { StarField } from './StarField'
import { Embers } from './Embers'
import { Atmosphere } from './Atmosphere'
import { PostProcessing } from './PostProcessing'
import { Suspense } from 'react'

import { memo } from 'react'

export const SceneRoot = memo(function SceneRoot() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none bg-transparent">
      <Canvas
        camera={{ position: [0, 2, 10], fov: 28 }}
        gl={{ antialias: false, powerPreference: 'high-performance', alpha: true }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0)
        }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          {/* Camera Director Spline & Inversion Controls */}
          <Director />
          
          {/* Real-time Solar & Star Environment */}
          <EphemerisLight />
          <SkyBox />
          <StarField />
          
          {/* Post-Processing Stack (Dynamic Bloom, Vignette, Noise, CA) */}
          <PostProcessing />
          
          {/* Organic Embers & Fireflies replacing the placeholder */}
          <Embers />

          {/* Falling snow/mist overlay for deep night acts */}
          <Atmosphere />
        </Suspense>
      </Canvas>
    </div>
  )
})
SceneRoot.displayName = 'SceneRoot'
