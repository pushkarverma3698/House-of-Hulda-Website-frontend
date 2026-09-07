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
      {/* Header scrim. Protects typography legibility over bright snowline frames without harsh banding */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-36 -z-10 pointer-events-none bg-gradient-to-b from-black/85 via-black/35 to-transparent backdrop-blur-[2px]"
      />
      {/* Brand Stamp */}
      <div className="flex items-center gap-3 pointer-events-auto">
        <Link
          href="/"
          className="flex min-h-11 items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10 hover:border-amber-400/50 transition-all shadow-lg group"
        >
          <span className="font-display italic font-light text-xl text-cream group-hover:text-amber-300 transition-colors">
            H
          </span>
          <span className="hud-mono text-xs tracking-widest text-cream/90 uppercase group-hover:text-cream">
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
        <div className="hidden md:flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10 shadow-lg">
          <Link
            href="/stay"
            className="px-3 py-1 hud-mono text-xs tracking-wider text-cream/80 hover:text-amber-300 hover:drop-shadow-[0_0_8px_rgba(245,158,11,0.5)] transition-all"
          >
            Stay
          </Link>
          <span className="text-cream/20 text-xs">/</span>
          <Link
            href="/cafe"
            className="px-3 py-1 hud-mono text-xs tracking-wider text-cream/80 hover:text-amber-300 hover:drop-shadow-[0_0_8px_rgba(245,158,11,0.5)] transition-all"
          >
            Café
          </Link>
          <span className="text-cream/20 text-xs">/</span>
          <Link
            href="/naggar"
            className="px-3 py-1 hud-mono text-xs tracking-wider text-cream/80 hover:text-amber-300 hover:drop-shadow-[0_0_8px_rgba(245,158,11,0.5)] transition-all"
          >
            Naggar
          </Link>
          <span className="text-cream/20 text-xs">/</span>
          <Link
            href="/blog"
            className="px-3 py-1 hud-mono text-xs tracking-wider text-cream/80 hover:text-amber-300 hover:drop-shadow-[0_0_8px_rgba(245,158,11,0.5)] transition-all"
          >
            Stories
          </Link>
        </div>

        {/* Primary Reserve CTA */}
        <Link
          href="/book"
          scroll={false}
          className="inline-flex items-center min-h-11 px-5 py-2 rounded-full bg-amber-400/20 border border-amber-400/50 text-amber-300 hover:bg-amber-400/30 hover:border-amber-400/80 hud-mono tracking-widest transition-all backdrop-blur-md shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_25px_rgba(245,158,11,0.4)] active:scale-95 cursor-pointer"
        >
          Reserve
        </Link>

        {/* Mobile Menu Trigger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation menu"
          className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-cream/90 hover:border-amber-400/40 transition-colors"
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
        <div className="absolute top-20 right-6 w-64 bg-black/95 backdrop-blur-2xl border border-amber-500/20 rounded-2xl p-5 flex flex-col gap-3 shadow-[0_20px_50px_rgba(0,0,0,0.8)] pointer-events-auto md:hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="pb-2 border-b border-white/10 flex items-center justify-between">
            <span className="hud-mono text-[9px] text-amber-400 tracking-widest uppercase">The Estate</span>
            <span className="hud-mono text-[9px] text-cream/40">2,180M</span>
          </div>
          <Link
            href="/stay"
            onClick={() => setMenuOpen(false)}
            className="hud-mono text-xs tracking-wider text-cream/80 hover:text-amber-300 py-1.5 flex items-center justify-between group transition-colors"
          >
            <span>The Stay</span>
            <span className="text-amber-400/40 group-hover:text-amber-400 group-hover:translate-x-1 transition-all">→</span>
          </Link>
          <Link
            href="/cafe"
            onClick={() => setMenuOpen(false)}
            className="hud-mono text-xs tracking-wider text-cream/80 hover:text-amber-300 py-1.5 flex items-center justify-between group transition-colors"
          >
            <span>The Attic Café</span>
            <span className="text-amber-400/40 group-hover:text-amber-400 group-hover:translate-x-1 transition-all">→</span>
          </Link>
          <Link
            href="/naggar"
            onClick={() => setMenuOpen(false)}
            className="hud-mono text-xs tracking-wider text-cream/80 hover:text-amber-300 py-1.5 flex items-center justify-between group transition-colors"
          >
            <span>Explore Naggar</span>
            <span className="text-amber-400/40 group-hover:text-amber-400 group-hover:translate-x-1 transition-all">→</span>
          </Link>
          <Link
            href="/blog"
            onClick={() => setMenuOpen(false)}
            className="hud-mono text-xs tracking-wider text-cream/80 hover:text-amber-300 py-1.5 flex items-center justify-between group transition-colors"
          >
            <span>Himalayan Journal</span>
            <span className="text-amber-400/40 group-hover:text-amber-400 group-hover:translate-x-1 transition-all">→</span>
          </Link>
          <div className="pt-3 mt-1 border-t border-white/10">
            <Link
              href="/book"
              onClick={() => setMenuOpen(false)}
              className="w-full py-2.5 rounded-xl bg-amber-400/15 border border-amber-400/50 text-amber-300 hover:bg-amber-400 hover:text-black hud-mono text-[10px] uppercase font-bold tracking-widest flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <span>Reserve Room</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  )
})
Navigation.displayName = 'Navigation'
