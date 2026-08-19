'use client'

import { useFrame } from '@react-three/fiber'
import { useRef, useState } from 'react'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { useNight } from '@/lib/store/night'
import { getSolarState, getBloomThreshold } from '@/lib/astro/sun'
import type { BloomEffect } from 'postprocessing'

const detectCoarsePointer = (): boolean => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768
}

export function PostProcessing() {
  const bloomRef = useRef<BloomEffect>(null)

  // Resolved once, lazily, so the composer is never mounted-then-unmounted on
  // mobile — allocating and freeing two fullscreen float render targets during
  // first paint is itself a visible hitch.
  const [isCoarsePointer] = useState(detectCoarsePointer)

  useFrame(() => {
    if (!bloomRef.current) return
    const solar = getSolarState(useNight.getState().t)
    bloomRef.current.luminanceMaterial.threshold = getBloomThreshold(solar.altitude)
  })

  // On mobile the composer previously still ran Vignette + Noise. That is two
  // fullscreen fragment passes plus the composer's own render-target copies
  // every frame — for an effect the `.cine-overlay` CSS layer already draws for
  // free. The whole postprocessing stack is desktop-only.
  if (isCoarsePointer) return null

  // Two passes came out of this stack, for the same reason they were already
  // cut on mobile: the page stacks a WebGL canvas over a 2D canvas that is
  // blitting a film frame, and every fullscreen fragment pass here is taken out
  // of the film's render loop. Measured at 1512x900 dpr 2, that loop was
  // ticking at ~590 ms — under two frames a second — so the sharp tier could
  // not arrive while the page was moving.
  //
  //   Noise                — `.cine-overlay::after` already draws film grain,
  //                          as a compositor-cached CSS layer, for free. This
  //                          was the same effect paid for twice.
  //   ChromaticAberration  — over an already-graded film it buys very little,
  //                          and it is what split the star and ember sprites
  //                          into red and green fringes towards the edges of
  //                          the screen.
  //
  // Bloom stays: it is what makes the lit window and the star field glow, and
  // the star field is now what the last third of the page is actually made of.
  // Vignette stays because removing it is a look change — the CSS vignette is
  // only 15% and would need strengthening to compensate, on mobile too.
  return (
    <EffectComposer {...({ disableNormalPass: true } as any)} autoClear={false}>
      <Bloom
        ref={(el: any) => { bloomRef.current = el }}
        intensity={2.8}
        luminanceThreshold={0.85}
        luminanceSmoothing={0.15}
        mipmapBlur
      />
      <Vignette eskil={false} offset={0.3} darkness={0.85} />
    </EffectComposer>
  )
}
