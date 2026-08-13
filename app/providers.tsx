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
    const isHome = pathname === '/'
    const lenis = new Lenis({
      lerp: 0.08,
      wheelMultiplier: 0.85,
      syncTouch: isHome,
    })
    lenisInstance = lenis

    const updateStore = (progress: number) => {
      const p = Math.max(0, Math.min(1, progress))
      const solar = getSolarState(p)
      useNight.setState({
        t: p,
        act: actFor(p),
        sunAlt: solar.altitude,
        nightBlend: solar.altitude < -12 ? 1 : solar.altitude > 2 ? 0 : (2 - solar.altitude) / 14,
      })
    }

    lenis.on('scroll', ({ progress }: { progress: number }) => {
      updateStore(progress)
    })

    // Native scroll fallback listener
    const onNativeScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      if (maxScroll > 0) {
        const progress = window.scrollY / maxScroll
        updateStore(progress)
      }
    }
    window.addEventListener('scroll', onNativeScroll, { passive: true })

    let rafId: number
    function raf(time: number) {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('scroll', onNativeScroll)
      lenis.destroy()
      lenisInstance = null
    }
  }, [pathname])

  // Handle route changes: reset scroll and force resize
  useEffect(() => {
    if (lenisInstance) {
      lenisInstance.scrollTo(0, { immediate: true })
      // Delay resize slightly to allow Next.js to render the new DOM
      setTimeout(() => {
        lenisInstance?.resize()
      }, 100)
    }
  }, [pathname])

  return <>{children}</>
}
