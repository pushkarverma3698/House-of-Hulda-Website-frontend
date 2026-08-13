'use client'

import Link from 'next/link'
import { useState, memo } from 'react'

export const Navigation = memo(function Navigation({
  onOpenBooking,
}: {
  onOpenBooking?: () => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 inset-x-0 z-40 flex items-center justify-between px-6 md:px-12 py-5 pointer-events-none">
      {/* Brand Stamp */}
      <div className="flex items-center gap-3 pointer-events-auto">
        <Link
          href="/"
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/5 hover:border-amber/30 transition-colors shadow-lg group"
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
        <Link
          href="/book"
          scroll={false}
          className="px-[24px] py-[10px] rounded-full bg-amber/90 text-[11.5px] font-medium uppercase tracking-[0.1em] text-ink shadow-[0_4px_20px_rgba(217,154,78,0.3)] transition-all duration-300 ease-exhale hover:bg-amber hover:shadow-[0_0_30px_rgba(217,154,78,0.5)] active:scale-95 active:shadow-[0_0_10px_rgba(217,154,78,0.3)] backdrop-blur-md"
        >
          Reserve
        </Link>

        {/* Mobile Menu Trigger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation menu"
          className="md:hidden p-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/5 text-cream/90"
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
