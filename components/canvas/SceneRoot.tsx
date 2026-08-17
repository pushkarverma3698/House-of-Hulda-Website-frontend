'use client'

import { Canvas } from '@react-three/fiber'
import { Director } from './Director'
import { EphemerisLight } from './EphemerisLight'
import { SkyBox } from './SkyBox'
import { StarField } from './StarField'
import { Embers } from './Embers'
import { Atmosphere } from './Atmosphere'
import { PostProcessing } from './PostProcessing'
import { Suspense, memo, useState } from 'react'

const detectCoarsePointer = (): boolean => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768
}

export const SceneRoot = memo(function SceneRoot() {
  const [isCoarsePointer] = useState(detectCoarsePointer)

  return (
    <div className="fixed inset-0 z-0 pointer-events-none bg-transparent">
      <Canvas
        camera={{ position: [0, 2, 10], fov: 28 }}
        gl={{ antialias: false, powerPreference: 'high-performance', alpha: true }}
        // R3F defaults its own root div to pointer-events:auto — spread after
        // the wrapper div's pointer-events-none above, so it wins the cascade
        // and silently re-enables hit-testing on this element, regardless of
        // the Tailwind class stating the opposite intent. Nothing in this
        // scene (stars, sky, embers, atmosphere, camera) is interactive, so
        // the button/link underneath should always win the hit test; without
        // this it intermittently doesn't, and a real tap on Reserve or the
        // audio toggle can land on the sky instead of the control.
        style={{ pointerEvents: 'none' }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0)
        }}
        // This canvas composites on top of an already-fullscreen 2D frame
        // canvas. At dpr 2 on a 390pt phone that is a second 1.3M-pixel
        // transparent layer rasterised every frame. Its content is stars, faint
        // particles and a gradient — none of which resolve detail worth 4x the
        // fragment cost.
        dpr={isCoarsePointer ? 1 : [1, 2]}
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
