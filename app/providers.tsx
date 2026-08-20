'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Lenis from 'lenis'
import { useNight, actFor } from '@/lib/store/night'
import { getSolarState } from '@/lib/astro/sun'

let lenisInstance: Lenis | null = null

export function getLenis() {
  return lenisInstance
}

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  useEffect(() => {
    const wrapper = document.getElementById('scroll-wrapper')
    const content = document.getElementById('scroll-content')
    
    // We provide a fallback to window scrolling for robust development rendering,
    // but the production wrapper locks the viewport to stop URL bar bouncing on mobile.
    const lenis = new Lenis({
      wrapper: wrapper || window,
      content: content || document.documentElement,
      lerp: 0.08,
      wheelMultiplier: 0.85,
      // syncTouch must be false for wrapper scrolling to let the browser handle 
      // native scroll (which prevents URL bar collapse while keeping momentum)
      syncTouch: false,
    })
    lenisInstance = lenis

    // Published for the ?debug=perf scrub harness (scripts/measure-scrub.mjs),
    // which needs to drive the playhead at an exact, repeatable velocity.
    // Wheel events cannot do that — Lenis transforms every delta — and writing
    // scrollTop cannot either, because Lenis owns that property and rewrites it
    // from its own lerped value on the next frame.
    if (typeof window !== 'undefined' && window.location.search.includes('debug')) {
      ;(window as unknown as { __lenis?: Lenis }).__lenis = lenis
    }

    // Single writer, sampled once per frame. Scroll events fire at unpredictable
    // rates (and in bursts during momentum); rAF sampling decouples store writes
    // — and therefore every downstream render — from event timing.
    const EPSILON = 1 / 4096
    let lastP = -1

    const sample = () => {
      // Lenis calculates `.limit` dynamically and correctly handles resize events.
      // This eliminates the need for manual scrollHeight - innerHeight math and
      // avoids iOS Safari resize jump bugs altogether.
      const p = lenis.limit > 0 ? Math.max(0, Math.min(1, lenis.scroll / lenis.limit)) : 0
      if (Math.abs(p - lastP) < EPSILON) return
      lastP = p

      const solar = getSolarState(p)
      useNight.setState({
        t: p,
        act: actFor(p),
        sunAlt: solar.altitude,
        nightBlend: solar.altitude < -12 ? 1 : solar.altitude > 2 ? 0 : (2 - solar.altitude) / 14,
      })
    }

    let rafId: number
    function raf(time: number) {
      lenis.raf(time)
      sample()
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
      lenisInstance = null
    }
  }, [pathname])



  return <>{children}</>
}
