'use client'

import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Preloader } from '@/components/film/Preloader'
import { ScrubDebugOverlay } from '@/components/film/ScrubDebugOverlay'
import { Marketplace } from '@/components/film/Marketplace'
import { Soundscape } from '@/components/film/Soundscape'
import { Navigation } from '@/components/film/Navigation'
import { ReserveDock } from '@/components/film/ReserveDock'
import { FilmReel } from '@/components/film/FilmReel'
import { StarCard } from '@/components/sky/StarCard'
import { DateDial } from '@/components/astro/DateDial'
import { EIGHTEEN_GODS, CelestialGod } from '@/content/eighteen'
import { useState, useEffect, useRef } from 'react'
import { ScrollCanvas } from '@/components/canvas/ScrollCanvas'
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
      // Atmospheric entrance and exit easing for each story beat
      const sections = gsap.utils.toArray('.cine-section') as HTMLElement[]
      
      sections.forEach((section) => {
        const textWrapper = section.querySelector('.story-scrim')
        if (textWrapper) {
          const elements = Array.from(textWrapper.children);
          gsap.set(elements, { opacity: 0, y: 60, filter: 'blur(16px)', scale: 0.95 });
          
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: section,
              scroller: document.getElementById('scroll-wrapper') || window,
              start: 'top 85%',
              end: 'bottom 15%',
              scrub: 1.2,
            }
          });
          
          tl.to(elements, { 
            opacity: 1, 
            y: 15, 
            filter: 'blur(0px)', 
            scale: 1, 
            duration: 0.25, 
            ease: 'power3.out',
            stagger: 0.05
          })
          .to(elements, {
            y: -15,
            duration: 0.5,
            ease: 'none'
          })
          .to(elements, { 
            opacity: 0, 
            y: -60, 
            filter: 'blur(16px)', 
            scale: 1.05, 
            duration: 0.25, 
            ease: 'power3.in',
            stagger: 0.03
          }, ">-0.1");
        }
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <main ref={containerRef} className="relative bg-transparent text-cream font-body selection:bg-amber selection:text-ink">
      
      {/* 2026 Apple-Tier Scrubbed Cinematic Image Sequence */}
      <ScrollCanvas />

      <Navigation />
            <Soundscape />
      <FilmReel />
      <ReserveDock />
      <Preloader />
      <ScrubDebugOverlay />

      <div className="cine-overlay" aria-hidden="true" />

      {/* Master Cinematic Narrative Track */}
      <div className="relative z-10 pointer-events-none flex flex-col">

        {/* L-01: 0s to 1.8s · The Valley Opening */}
        <section className="cine-section relative h-[140vh]" data-time-start="0" data-time-end="1.8">
          <div className="sticky top-0 h-[100dvh] flex flex-col justify-center items-start px-6 sm:px-12 md:px-24 pr-16 md:pr-24">
            <div className="story-scrim relative z-10 z-10 space-y-4 md:space-y-6 max-w-2xl pointer-events-auto">
              <p className="hud-mono text-amber tracking-widest text-[10px] md:text-xs flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-amber animate-ping" />
                L-01 · 15:40 · ALT 2,180M
              </p>
              <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-normal leading-[1.05] text-cream drop-shadow-md">
                The road stops<br />at Rumsu.
              </h1>
              <p className="text-cream/90 text-sm sm:text-base md:text-lg leading-relaxed max-w-xl drop-shadow-md">
                Above it, the trail to Chandrakhani — where a storm once tore a basket of eighteen gods off a rishi&apos;s head and scattered them across these peaks.
              </p>
              <p className="text-amber-300/80 text-xs sm:text-sm hud-mono tracking-wide [text-shadow:0_1px_6px_rgba(0,0,0,0.5)]">
                They&apos;re still up there. We have a telescope.
              </p>
            </div>
          </div>
        </section>

        {/* L-02: 1.8s to 3.5s · The Architecture */}
        <section className="cine-section relative h-[140vh]" data-time-start="1.8" data-time-end="3.5">
          <div className="sticky top-0 h-[100dvh] flex flex-col justify-center px-6 sm:px-12 md:px-24 pr-16 md:pr-24">
            <div className="story-scrim relative z-10 space-y-4 md:space-y-6 max-w-lg pointer-events-auto">
              <p className="hud-mono text-amber tracking-widest text-[10px] md:text-xs">
                L-02 · 16:15 · THE APPROACH
              </p>
              <h2 className="font-display text-3xl sm:text-5xl md:text-6xl font-normal leading-tight text-cream drop-shadow-md">
                Built like a fortress.<br /><span className="italic text-amber-200/90">Smells like pine.</span>
              </h2>
              <p className="text-cream/90 text-sm sm:text-base leading-relaxed drop-shadow-md">
                Kath-kuni architecture doesn&apos;t use nails. It weaves solid deodar cedar and metamorphic slate into a joint that flexes with the mountain.
              </p>
              <div>
                <button 
                  onClick={() => setIsSandboxOpen(true)}
                  className="px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/20 hover:border-amber-400/80 text-amber-300 text-xs hud-mono tracking-widest transition-all uppercase pointer-events-auto shadow-2xl backdrop-blur-xl hover:scale-105 active:scale-95"
                >
                  Inspect Architecture →
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* L-03: 3.5s to 5.2s · The Hearth */}
        <section className="cine-section relative h-[140vh]" data-time-start="3.5" data-time-end="5.2">
          <div className="sticky top-0 h-[100dvh] flex flex-col justify-center items-end text-right px-6 sm:px-12 md:px-24 pl-16 md:pl-24">
            <div className="story-scrim relative z-10 space-y-4 md:space-y-6 max-w-lg pointer-events-auto">
              <p className="hud-mono text-amber tracking-widest text-[10px] md:text-xs">
                L-03 · 18:30 · THE HEARTH
              </p>
              <h2 className="font-display text-3xl sm:text-5xl md:text-6xl font-normal leading-tight text-cream drop-shadow-md">
                Cold outside.<br /><span className="italic text-amber-300">Warm inside.</span>
              </h2>
              <p className="text-cream/90 text-sm sm:text-base leading-relaxed drop-shadow-md">
                The woodstove is always running. Dinner is slow-cooked, and the stories outlast the embers.
              </p>
              <div>
                <button 
                  onClick={() => setIsGalleryOpen(true)}
                  className="px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/20 hover:border-amber-400/80 text-amber-300 text-xs hud-mono tracking-widest transition-all uppercase pointer-events-auto shadow-2xl backdrop-blur-xl hover:scale-105 active:scale-95"
                >
                  View The Hearth →
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* L-07: 5.2s to 6.8s · The Eighteen Gods */}
        <section className="cine-section relative h-[150vh]" data-time-start="5.2" data-time-end="6.8">
          <div className="sticky top-0 h-[100dvh] flex flex-col justify-center px-4 sm:px-8 md:px-16 max-w-6xl mx-auto w-full">
            <div className="story-scrim relative z-10 space-y-4 md:space-y-6 pointer-events-auto">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
                <div className="space-y-2">
                  <p className="hud-mono text-amber tracking-widest text-[10px] md:text-xs flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber animate-pulse" />
                    L-07 · 19:45 · BORTLE CLASS 1
                  </p>
                  <h2 className="font-display text-2xl sm:text-4xl md:text-5xl font-normal text-cream leading-tight">
                    The Eighteen Gods.
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-400 max-w-xl">
                    Tap a deity to view astronomical alignment and folklore over Naggar Ridge.
                  </p>
                </div>
              </div>

              {/* Scrollable deity grid for mobile & expansive grid for desktop */}
              <div className="flex gap-2.5 pt-2 overflow-x-auto sm:grid sm:grid-cols-3 lg:grid-cols-6 pb-2 [scrollbar-width:none]">
                {EIGHTEEN_GODS.map((god) => (
                  <button
                    key={god.id}
                    onClick={() => setSelectedStar(god)}
                    className="w-[42vw] sm:w-auto shrink-0 sm:shrink p-3 rounded-xl bg-white/[0.03] hover:bg-amber-400/[0.1] border border-white/[0.08] hover:border-amber-400/40 text-left transition-all group shadow-sm min-h-20 flex flex-col justify-between"
                  >
                    <div className="flex justify-between items-start w-full">
                      <span className="hud-mono text-[9px] text-amber-400/70">
                        #{god.id.toString().padStart(2, '0')}
                      </span>
                      <span className="hud-mono text-[8px] text-cream/40 uppercase">
                        {god.constellation.slice(0, 3)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-display text-sm text-cream/90 group-hover:text-amber-300 transition-colors">
                        {god.deity}
                      </h3>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* L-08: 6.8s to 8.0s · Ephemeris & Date Selector */}
        <section className="cine-section relative h-[150vh]" data-time-start="6.8" data-time-end="8.0">
          <div className="sticky top-0 h-[100dvh] flex flex-col justify-center px-3 sm:px-8 md:px-16 max-w-6xl mx-auto w-full">
            <div className="story-scrim pointer-events-auto">
              <DateDial />
            </div>
          </div>
        </section>

        {/* L-09: 8.0s to 9.2s · The Valley Commons */}
        <section className="cine-section relative h-[140vh]" data-time-start="8.0" data-time-end="9.2">
          <div className="sticky top-0 h-[100dvh] flex flex-col justify-center px-4 sm:px-8 md:px-16 max-w-6xl mx-auto w-full">
            <div className="story-scrim relative z-10 space-y-4 md:space-y-6 pointer-events-auto">
              <p className="hud-mono text-amber tracking-widest text-[10px] md:text-xs">
                L-09 · 02:27 · THE VALLEY COMMONS
              </p>
              <h2 className="font-display text-2xl sm:text-4xl md:text-5xl font-normal text-cream">
                Crafted in the Valley.
              </h2>
              <Marketplace />
            </div>
          </div>
        </section>

        {/* L-10: 9.2s to 10.0s · First Light & Booking */}
        <section className="cine-section relative h-[140vh]" data-time-start="9.2" data-time-end="10.0">
          <div className="sticky top-0 h-[100dvh] flex flex-col justify-center items-center px-6 text-center">
            <div className="story-scrim relative z-10 space-y-6 md:space-y-8 max-w-xl pointer-events-auto">
              <p className="hud-mono text-amber tracking-widest text-[10px] md:text-xs">
                L-10 · 06:05 · FIRST LIGHT
              </p>
              <h2 className="font-display text-4xl sm:text-6xl md:text-7xl font-normal text-cream leading-tight drop-shadow-md">
                Sunrise at 06:14.
              </h2>
              <p className="text-cream/90 text-sm sm:text-base leading-relaxed drop-shadow-md">
                The shadow of the ridge slides down the orchard. The fire is still burning. Your morning coffee is ready.
              </p>
              <div>
                <Link
                  href="/book"
                  scroll={false}
                  className="px-10 py-4 rounded-full bg-amber-400 hover:bg-amber-300 text-black font-mono text-xs font-bold uppercase tracking-widest transition-all shadow-[0_0_30px_rgba(245,158,11,0.4)] hover:scale-105 active:scale-95 inline-block"
                >
                  Reserve The Stay →
                </Link>
              </div>
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
