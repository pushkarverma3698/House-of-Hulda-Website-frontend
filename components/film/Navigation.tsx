'use client'

import Link from 'next/link'
import { useState, useEffect, useRef, memo } from 'react'

export const Navigation = memo(function Navigation({
  onOpenBooking,
}: {
  onOpenBooking?: () => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [hidden, setHidden] = useState(false)
  const lastYRef = useRef(0)

  /**
   * Yield while reading, return on the way back up.
   *
   * The header is fixed over a film whose copy moves through the whole
   * viewport, so there is no position for it that the story text never reaches.
   * Measured across the scroll, it was covering the eyebrow of act after act —
   * including "SCROLL TO DESCEND INTO THE VALLEY", the one instruction a
   * first-time visitor needs, and "L-04 · 17:50 · GOLDEN HOUR". Getting out of
   * the way while the viewer is moving forward is the only thing that fixes
   * that for every act at once, and it is the behaviour people already expect.
   */
  useEffect(() => {
    const scrollContainer = document.getElementById('scroll-wrapper') || window
    
    lastYRef.current = scrollContainer === window ? window.scrollY : (scrollContainer as HTMLElement).scrollTop
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const y = scrollContainer === window ? window.scrollY : (scrollContainer as HTMLElement).scrollTop
        const dy = y - lastYRef.current
        // Ignore sub-pixel jitter and the rubber-band at the very top; only a
        // deliberate 12px of travel changes the state.
        if (Math.abs(dy) > 12) {
          setHidden(y > 220 && dy > 0)
          lastYRef.current = y
        }
        ticking = false
      })
    }
    scrollContainer.addEventListener('scroll', onScroll, { passive: true })
    return () => scrollContainer.removeEventListener('scroll', onScroll)
  }, [])

  // Never leave the menu open behind a hidden header.
  useEffect(() => {
    if (hidden && menuOpen) setMenuOpen(false)
  }, [hidden, menuOpen])

  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 flex items-center justify-between px-6 md:px-12 py-5 pointer-events-none transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        hidden ? '-translate-y-full' : 'translate-y-0'
      }`}
    >
      {/* Header scrim. The bar floats directly on the film, and over a bright
          frame — the opening cloud-and-snowline shot especially — the amber
          "Reserve" measured close to its background. A gradient is composited,
          not re-blurred per frame, so it costs nothing while scrolling. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-32 -z-10 pointer-events-none bg-gradient-to-b from-ink/75 via-ink/35 to-transparent"
      />
      {/* Brand Stamp */}
      <div className="flex items-center gap-3 pointer-events-auto">
        <Link
          href="/"
          className="flex min-h-11 items-center gap-2.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/5 hover:border-amber/30 transition-colors shadow-lg group"
        >
          <span className="font-display italic font-light text-xl text-cream group-hover:text-amber transition-colors">
            H
          </span>
          <span className="hud-mono text-xs tracking-widest text-cream/90 uppercase">
            House of Hulda
          </span>
        </Link>
        <span className="hidden sm:inline-block hud-mono text-[10px] text-cream/40 tracking-wider">
          RUMSU · 2,180M
        </span>
      </div>

      {/* Film-safe minimal nav */}
      <nav className="flex items-center gap-2 md:gap-3 pointer-events-auto">
        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-1 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/5 shadow-lg">
          <Link
            href="/stay"
            className="px-3 py-1 hud-mono text-xs tracking-wider text-cream/80 hover:text-amber transition-colors"
          >
            Stay
          </Link>
          <span className="text-cream/20 text-xs">/</span>
          <Link
            href="/cafe"
            className="px-3 py-1 hud-mono text-xs tracking-wider text-cream/80 hover:text-amber transition-colors"
          >
            Café
          </Link>
          <span className="text-cream/20 text-xs">/</span>
          <Link
            href="/naggar"
            className="px-3 py-1 hud-mono text-xs tracking-wider text-cream/80 hover:text-amber transition-colors"
          >
            Naggar
          </Link>
          <span className="text-cream/20 text-xs">/</span>
          <Link
            href="/blog"
            className="px-3 py-1 hud-mono text-xs tracking-wider text-cream/80 hover:text-amber transition-colors"
          >
            Stories
          </Link>
        </div>

        {/* Primary Reserve CTA */}
        {/* min-h-11 is the 44px floor: this was a 95x33 target, and it is the
            primary conversion control on the page. */}
        <Link
          href="/book"
          scroll={false}
          className="inline-flex items-center min-h-11 px-5 py-2 rounded-full bg-amber/15 border border-amber/40 text-amber hover:bg-amber/25 hover:border-amber/60 hud-mono tracking-widest transition-all backdrop-blur-md shadow-[0_0_15px_rgba(217,154,78,0.15)] hover:shadow-[0_0_20px_rgba(217,154,78,0.3)] active:scale-95 cursor-pointer"
        >
          Reserve
        </Link>

        {/* Mobile Menu Trigger — was 34x34, under the 44px minimum for the
            page's primary navigation control. */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation menu"
          className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-full bg-black/40 backdrop-blur-md border border-white/5 text-cream/90"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile Drawer Menu */}
      {menuOpen && (
        <div className="absolute top-20 right-6 w-48 bg-black/90 backdrop-blur-xl border border-white/5 rounded-2xl p-4 flex flex-col gap-3 shadow-2xl pointer-events-auto md:hidden animate-in fade-in zoom-in-95 duration-200">
          <Link
            href="/stay"
            onClick={() => setMenuOpen(false)}
            className="hud-mono text-xs tracking-wider text-cream/80 hover:text-amber py-1"
          >
            The Stay
          </Link>
          <Link
            href="/cafe"
            onClick={() => setMenuOpen(false)}
            className="hud-mono text-xs tracking-wider text-cream/80 hover:text-amber py-1"
          >
            The Attic Café
          </Link>
          <Link
            href="/naggar"
            onClick={() => setMenuOpen(false)}
            className="hud-mono text-xs tracking-wider text-cream/80 hover:text-amber py-1"
          >
            Explore Naggar
          </Link>
          <Link
            href="/blog"
            onClick={() => setMenuOpen(false)}
            className="hud-mono text-xs tracking-wider text-cream/80 hover:text-amber py-1"
          >
            Himalayan Journal
          </Link>
        </div>
      )}
    </header>
  )
})
Navigation.displayName = 'Navigation'
