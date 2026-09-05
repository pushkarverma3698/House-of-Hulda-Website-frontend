'use client'

import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Preloader } from '@/components/film/Preloader'
import { ScrubDebugOverlay } from '@/components/film/ScrubDebugOverlay'
import { TimeRail } from '@/components/film/TimeRail'
import { Marketplace } from '@/components/film/Marketplace'
import { Soundscape } from '@/components/film/Soundscape'
import { Navigation } from '@/components/film/Navigation'
import { ReserveDock } from '@/components/film/ReserveDock'
import { FilmReel } from '@/components/film/FilmReel'
import { StarCard } from '@/components/sky/StarCard'
import { DateDial } from '@/components/astro/DateDial'
import { EIGHTEEN_GODS, CelestialGod } from '@/content/eighteen'
import { useState, useEffect, useRef } from 'react'
import { CinematicScrubber } from '@/components/film/CinematicScrubber'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const HeritageSandbox = dynamic(
  () => import('@/components/canvas/HeritageSandbox').then((mod) => mod.HeritageSandbox),
  { ssr: false }
)

const WebGLGallery = dynamic(
  () => import('@/components/canvas/WebGLGallery').then((mod) => mod.WebGLGallery),
  { ssr: false }
)

export function CinematicExperience() {
  const [selectedStar, setSelectedStar] = useState<CelestialGod | null>(null)
  const [isSandboxOpen, setIsSandboxOpen] = useState(false)
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)

  const containerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    let ctx = gsap.context(() => {
      // Choreograph text fading during the sticky phase
      const sections = gsap.utils.toArray('.cine-section') as HTMLElement[]
      
      sections.forEach((section) => {
        const textWrapper = section.querySelector('.story-scrim')
        if (textWrapper) {
          gsap.fromTo(textWrapper, 
            { opacity: 0, y: 30, filter: 'blur(10px)' },
            { 
              opacity: 1, 
              y: 0, 
              filter: 'blur(0px)',
              duration: 1,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: section,
                start: 'top 50%',
                end: 'top 20%',
                scrub: 1
              }
            }
          )
          
          gsap.to(textWrapper, {
            opacity: 0,
            y: -30,
            filter: 'blur(10px)',
            ease: 'power3.in',
            scrollTrigger: {
              trigger: section,
              start: 'bottom 80%',
              end: 'bottom 50%',
              scrub: 1
            }
          })
        }
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <main ref={containerRef} className="relative bg-transparent text-cream font-body selection:bg-amber selection:text-ink">
      
      {/* 2026 Apple-Tier Scrubbed Cinematic Video with Responsive Injection */}
      <CinematicScrubber 
        desktopSrc="/videos/master_scroll_optimized.mp4" 
        mobileSrc="/videos/master_mobile_optimized.mp4"
      />

      <Navigation />
      <TimeRail />
      <Soundscape />
      <FilmReel />
      <ReserveDock />
      <Preloader />
      <ScrubDebugOverlay />

      <div className="cine-overlay" aria-hidden="true" />

      {/* The Master Cinematic Scroll Track */}
      <div className="relative z-10 pointer-events-none flex flex-col">

        {/* L-01: 0s to 2.5s */}
        <section className="cine-section relative h-[150vh]" data-time-start="0" data-time-end="2.5">
          <div className="sticky top-0 h-[100svh] flex flex-col justify-center items-start px-8 md:px-24">
            <div className="story-scrim relative space-y-5 max-w-2xl pointer-events-auto drop-shadow-2xl">
              <p className="hud-mono text-amber tracking-widest text-[10px] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber animate-ping" />
                L-01 · 15:40 · ALT 2,180M
              </p>
              <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-normal leading-[1.05] text-cream [text-shadow:0_4px_24px_rgba(0,0,0,0.8)]">
                The road stops<br />at Rumsu.
              </h1>
              <p className="text-cream/90 text-base md:text-lg leading-relaxed max-w-xl [text-shadow:0_2px_12px_rgba(0,0,0,0.8)]">
                Above it, the trail to Chandrakhani — where a storm once tore a basket of eighteen gods off a rishi&apos;s head and scattered them across these peaks.
              </p>
              <p className="text-amber/70 text-sm hud-mono tracking-wide [text-shadow:0_2px_12px_rgba(0,0,0,0.8)]">
                They&apos;re still up there. We have a telescope.
              </p>
            </div>
          </div>
        </section>

        {/* L-02: 2.5s to 4.5s */}
        <section className="cine-section relative h-[150vh]" data-time-start="2.5" data-time-end="4.5">
          <div className="sticky top-0 h-[100svh] flex flex-col justify-center px-8 md:px-24">
            <div className="story-scrim relative space-y-5 max-w-lg pointer-events-auto drop-shadow-2xl">
              <p className="hud-mono text-amber tracking-widest text-[10px]">
                L-02 · 16:15 · THE APPROACH
              </p>
              <h2 className="font-display text-4xl md:text-5xl font-normal leading-tight text-cream [text-shadow:0_4px_24px_rgba(0,0,0,0.8)]">
                Built like a fortress.<br />Smells like pine.
              </h2>
              <p className="text-cream/90 text-base leading-relaxed [text-shadow:0_2px_12px_rgba(0,0,0,0.8)]">
                Kath-kuni architecture doesn&apos;t use nails. It weaves solid deodar cedar and metamorphic slate into a joint that flexes with the mountain.
              </p>
              <button 
                onClick={() => setIsSandboxOpen(true)}
                className="mt-6 px-6 py-3 rounded-full bg-black/40 hover:bg-black/60 border border-white/20 text-xs hud-mono tracking-widest transition-all uppercase pointer-events-auto shadow-xl backdrop-blur-md"
              >
                Inspect Architecture
              </button>
            </div>
          </div>
        </section>

        {/* L-03: 4.5s to 6.5s */}
        <section className="cine-section relative h-[150vh]" data-time-start="4.5" data-time-end="6.5">
          <div className="sticky top-0 h-[100svh] flex flex-col justify-center items-end text-right px-8 md:px-24">
            <div className="story-scrim relative space-y-5 max-w-lg pointer-events-auto drop-shadow-2xl">
              <p className="hud-mono text-amber tracking-widest text-[10px]">
                L-03 · 18:30 · THE HEARTH
              </p>
              <h2 className="font-display text-4xl md:text-5xl font-normal leading-tight text-cream [text-shadow:0_4px_24px_rgba(0,0,0,0.8)]">
                Cold outside.<br />Warm inside.
              </h2>
              <p className="text-cream/90 text-base leading-relaxed [text-shadow:0_2px_12px_rgba(0,0,0,0.8)]">
                The woodstove is always running. Dinner is slow-cooked, and the stories outlast the embers.
              </p>
              <button 
                onClick={() => setIsGalleryOpen(true)}
                className="mt-6 px-6 py-3 rounded-full bg-black/40 hover:bg-black/60 border border-white/20 text-xs hud-mono tracking-widest transition-all uppercase pointer-events-auto shadow-xl backdrop-blur-md"
              >
                View The Hearth
              </button>
            </div>
          </div>
        </section>

        {/* L-07: 6.5s to 8.0s */}
        <section className="cine-section relative h-[150vh]" data-time-start="6.5" data-time-end="8.0">
          <div className="sticky top-0 h-[100svh] flex flex-col justify-center px-6 md:px-16 max-w-6xl mx-auto w-full">
            <div className="story-scrim space-y-6 bg-black/40 p-6 md:p-10 rounded-2xl backdrop-blur-xl border border-white/[0.07] shadow-2xl pointer-events-auto">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-3">
                  <p className="hud-mono text-amber tracking-widest text-[10px] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber animate-pulse" />
                    L-07 · 19:45 · BORTLE CLASS 1
                  </p>
                  <h2 className="font-display text-3xl md:text-5xl font-normal text-cream leading-tight">
                    The Eighteen Gods.
                  </h2>
                </div>
              </div>
              <div className="flex gap-2.5 pt-2 overflow-x-auto sm:grid sm:grid-cols-3 lg:grid-cols-6 snap-x snap-mandatory [scrollbar-width:none]">
                {EIGHTEEN_GODS.map((god, idx) => (
                  <button
                    key={god.id}
                    onClick={() => setSelectedStar(god)}
                    className="w-[44%] shrink-0 snap-start sm:w-auto sm:shrink p-3 rounded-xl bg-white/[0.03] hover:bg-amber/[0.08] border border-white/[0.06] text-left transition-all group shadow-sm min-h-24"
                  >
                    <div className="flex justify-between items-start w-full">
                      <span className="hud-mono text-[9px] text-amber/60">
                        #{god.id.toString().padStart(2, '0')}
                      </span>
                      <span className="hud-mono text-[8px] text-cream/40 uppercase">
                        {god.constellation.slice(0, 3)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-display text-sm text-cream/90 group-hover:text-amber/90 mt-2">
                        {god.deity}
                      </h3>
                    </div>
                  </button>
                ))}
              </div>
              <DateDial />
            </div>
          </div>
        </section>

        {/* L-08: 8.0s to 9.0s */}
        <section className="cine-section relative h-[150vh]" data-time-start="8.0" data-time-end="9.0">
          <div className="sticky top-0 h-[100svh] flex flex-col justify-center px-6 md:px-16 max-w-6xl mx-auto w-full">
            <div className="story-scrim space-y-4 bg-black/40 p-8 md:p-12 rounded-2xl backdrop-blur-xl border border-white/[0.06] pointer-events-auto">
              <p className="hud-mono text-amber tracking-widest text-[10px]">
                L-08 · 02:27 · THE VALLEY COMMONS
              </p>
              <h2 className="font-display text-3xl md:text-5xl font-normal text-cream">
                Crafted in the Valley.
              </h2>
              <Marketplace />
            </div>
          </div>
        </section>

        {/* L-09: 9.0s to 10.0s */}
        <section className="cine-section relative h-[150vh]" data-time-start="9.0" data-time-end="10.0">
          <div className="sticky top-0 h-[100svh] flex flex-col justify-center items-center px-8 text-center">
            <div className="story-scrim relative space-y-7 max-w-xl pointer-events-auto drop-shadow-2xl">
              <p className="hud-mono text-amber tracking-widest text-[10px]">
                L-09 · 06:05 · FIRST LIGHT
              </p>
              <h2 className="font-display text-5xl md:text-7xl font-normal text-cream leading-tight [text-shadow:0_4px_24px_rgba(0,0,0,0.8)]">
                Sunrise at 06:14.
              </h2>
              <Link
                href="/book"
                scroll={false}
                className="px-10 py-4 rounded-full bg-amber/10 border border-amber/30 text-amber hover:bg-amber/20 hover:border-amber/60 hud-mono tracking-widest transition-all shadow-[0_0_15px_rgba(217,154,78,0.15)] text-xs uppercase font-bold inline-block backdrop-blur-md"
              >
                Reserve The Stay
              </Link>
            </div>
          </div>
        </section>

      </div>

      {selectedStar && (
        <StarCard star={selectedStar} onClose={() => setSelectedStar(null)} />
      )}

      <HeritageSandbox isOpen={isSandboxOpen} onClose={() => setIsSandboxOpen(false)} />
      <WebGLGallery isOpen={isGalleryOpen} onClose={() => setIsGalleryOpen(false)} />
    </main>
  )
}
