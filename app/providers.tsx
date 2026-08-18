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
    
    if (!wrapper || !content) return

    const lenis = new Lenis({
      wrapper,
      content,
      lerp: 0.08,
      wheelMultiplier: 0.85,
      // syncTouch must be false for wrapper scrolling to let the browser handle 
      // native scroll (which prevents URL bar collapse while keeping momentum)
      syncTouch: false,
    })
    lenisInstance = lenis

    // scrollHeight forces a layout flush, so it is measured on resize only,
    // never inside the frame loop.
    let maxScroll = 1
    let lastMeasuredWidth = -1
    const measure = () => {
      // Safari fires `resize` every time the dynamic URL bar animates, and BOTH
      // terms below move with it. Re-deriving maxScroll mid-scroll therefore
      // remaps `p` discontinuously, which the film shows as the frame index
      // jumping — exactly in sync with the toolbar sliding. Width is the only
      // thing that changes on a real resize or an orientation change, so gate
      // on it. (The layout is sized in `svh` for the same reason: svh is fixed
      // at the small-viewport size and does not track the toolbar.)
      if (window.innerWidth === lastMeasuredWidth) return
      lastMeasuredWidth = window.innerWidth
      const scrollHeight = wrapper ? wrapper.scrollHeight : document.documentElement.scrollHeight
      const clientHeight = wrapper ? wrapper.clientHeight : window.innerHeight
      maxScroll = Math.max(1, scrollHeight - clientHeight)
    }
    measure()
    window.addEventListener('resize', measure, { passive: true })

    // Single writer, sampled once per frame. Scroll events fire at unpredictable
    // rates (and in bursts during momentum); rAF sampling decouples store writes
    // — and therefore every downstream render — from event timing.
    const EPSILON = 1 / 4096
    let lastP = -1

    const sample = () => {
      const p = Math.max(0, Math.min(1, lenis.scroll / maxScroll))
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
      window.removeEventListener('resize', measure)
      lenis.destroy()
      lenisInstance = null
    }
  }, [pathname])



  return <>{children}</>
}
