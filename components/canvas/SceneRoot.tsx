'use client'

import { Canvas } from '@react-three/fiber'
import { Director } from './Director'
import { EphemerisLight } from './EphemerisLight'
import { SkyBox } from './SkyBox'
import { StarField } from './StarField'
import { Embers } from './Embers'
import { Atmosphere } from './Atmosphere'
import { PostProcessing } from './PostProcessing'
import { Suspense, memo, useEffect, useState } from 'react'
import { useNight } from '@/lib/store/night'

const detectCoarsePointer = (): boolean => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768
}

/** The film canvas covers this one completely until it starts dissolving at
 *  t = 0.64. Waking at 0.55 leaves the scene nine percent of the page — several
 *  seconds of scrolling — to settle its damped camera and its particles before
 *  the first pixel of it is visible. */
const WAKE_T = 0.55

export const SceneRoot = memo(function SceneRoot() {
  const [isCoarsePointer] = useState(detectCoarsePointer)

  /**
   * Do not render a sky nobody can see.
   *
   * Measured on a phone at ten scroll stops: the film canvas reports opacity 1
   * from t = 0 to t = 0.62, and this canvas reports opacity 1 the whole time
   * underneath it. So for the first 55% of the page — six of the nine acts —
   * a skybox, two thousand star points, embers, drifting atmosphere and a
   * critically-damped camera were being shaded at full rate behind a fully
   * opaque photograph.
   *
   * On a desktop that is wasted watts. In a hand it is heat, and heat is the
   * one design flaw a visitor feels physically: the phone warms, the SoC
   * throttles, and the site gets progressively worse the longer someone stays
   * with it. The people who scroll furthest were being punished hardest.
   */
  const [awake, setAwake] = useState(() =>
    typeof window === 'undefined' ? false : useNight.getState().t > WAKE_T
  )

  useEffect(() => {
    const unsub = useNight.subscribe((state) => {
      const next = state.t > WAKE_T
      setAwake((prev) => (prev === next ? prev : next))
    })
    return () => unsub()
  }, [])

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
        // `never` stops the render loop without tearing down the GL context —
        // the scene keeps its buffers and resumes instantly, so nothing has to
        // be re-uploaded at the moment the dissolve begins.
        frameloop={awake ? 'always' : 'never'}
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
