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
import { CelestialPlanetarium } from '@/components/sky/CelestialPlanetarium'
import { DateDial } from '@/components/astro/DateDial'
import { EIGHTEEN_GODS, CelestialGod } from '@/content/eighteen'
import { whatsappLink } from '@/lib/site-config'
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
      
      sections.forEach((section, idx) => {
        const textWrapper = section.querySelector('.story-scrim')
        if (textWrapper) {
          const elements = Array.from(textWrapper.children);
          
          if (idx === 0) {
            // First section is hero arrival: starts fully visible and fades up smoothly on scroll
            gsap.set(elements, { opacity: 1, y: 0, filter: 'blur(0px)', scale: 1 });
            const tl = gsap.timeline({
              scrollTrigger: {
                trigger: section,
                scroller: document.getElementById('scroll-wrapper') || window,
                start: 'top top',
                end: 'bottom 20%',
                scrub: 1.2,
              }
            });
            tl.to(elements, {
              y: -20,
              duration: 0.5,
              ease: 'none'
            })
            .to(elements, { 
              opacity: 0, 
              y: -60, 
              filter: 'blur(16px)', 
              scale: 1.05, 
              duration: 0.35, 
              ease: 'power3.in',
              stagger: 0.03
            });
            return;
          }

          if (idx === sections.length - 1) {
            // Final section is the destination (First Light / Reservation):
            // Smooth arrival with graceful deceleration into its resting pose.
            // Never exits or blurs away — settles with power3.out and sine.out into perfect center.
            gsap.set(elements, { opacity: 0, y: 50, filter: 'blur(16px)', scale: 0.96 });
            const tl = gsap.timeline({
              scrollTrigger: {
                trigger: section,
                scroller: document.getElementById('scroll-wrapper') || window,
                start: 'top 80%',
                end: 'bottom bottom',
                scrub: 1.2,
              }
            });
            tl.to(elements, {
              opacity: 1,
              y: 0,
              filter: 'blur(0px)',
              scale: 1,
              duration: 0.7,
              ease: 'power3.out',
              stagger: 0.04
            })
            .to(elements, {
              y: -4,
              duration: 0.3,
              ease: 'sine.out'
            });
            return;
          }

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
        <section className="cine-section snap-start [scroll-snap-stop:always] relative h-[140vh]" data-time-start="0" data-time-end="1.8">
          <div className="sticky top-0 h-[100dvh] flex flex-col justify-center items-start px-6 sm:px-12 md:px-24 pr-16 md:pr-24 pb-24 md:pb-0">
            <div className="story-scrim relative z-10 space-y-4 md:space-y-6 max-w-2xl pointer-events-auto">
              <p className="hud-mono text-amber tracking-[0.25em] text-xs md:text-sm font-medium uppercase flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-amber animate-rec shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                HOUSE OF HULDA
              </p>
              <h1 className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-normal uppercase leading-[1.02] tracking-tight text-cream drop-shadow-lg">
                THE ROAD STOPS<br />AT RUMSU.
              </h1>
              <p className="text-cream/90 font-serif italic text-lg sm:text-xl md:text-2xl drop-shadow-md">
                Naggar · Himachal Pradesh
              </p>
              <p className="hud-mono text-amber-300/90 text-xs sm:text-sm tracking-widest uppercase [text-shadow:0_1px_6px_rgba(0,0,0,0.5)]">
                2,180 m
              </p>
              <div className="pt-2">
                <Link
                  href="/book"
                  className="inline-flex items-center gap-3 px-8 py-3.5 rounded-full bg-amber-500 hover:bg-amber-400 text-ink font-semibold hud-mono text-xs tracking-widest uppercase transition-all duration-300 shadow-[0_0_24px_rgba(245,158,11,0.4)] hover:shadow-[0_0_32px_rgba(245,158,11,0.7)] hover:scale-105 active:scale-95"
                >
                  Reserve
                  <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* L-02: 1.8s to 3.5s · The Architecture */}
        <section className="cine-section snap-start [scroll-snap-stop:always] relative h-[140vh]" data-time-start="1.8" data-time-end="3.5">
          <div className="sticky top-0 h-[100dvh] flex flex-col justify-center px-6 sm:px-12 md:px-24 pr-16 md:pr-24 pb-24 md:pb-0">
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
                  className="group px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/20 hover:border-amber-400/80 text-amber-300 text-xs hud-mono tracking-widest transition-all uppercase pointer-events-auto shadow-2xl backdrop-blur-xl hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0f17]"
                >
                  Inspect Architecture
                  <span className="inline-block transition-transform duration-300 group-hover:translate-x-1.5 ml-2">→</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* L-03: 3.5s to 5.2s · The Hearth */}
        <section className="cine-section snap-start [scroll-snap-stop:always] relative h-[140vh]" data-time-start="3.5" data-time-end="5.2">
          <div className="sticky top-0 h-[100dvh] flex flex-col justify-center items-end text-right px-6 sm:px-12 md:px-24 pl-16 md:pl-24 pb-24 md:pb-0">
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
                  className="group px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/20 hover:border-amber-400/80 text-amber-300 text-xs hud-mono tracking-widest transition-all uppercase pointer-events-auto shadow-2xl backdrop-blur-xl hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0f17]"
                >
                  View The Hearth
                  <span className="inline-block transition-transform duration-300 group-hover:translate-x-1.5 ml-2">→</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* L-07: 5.2s to 6.8s · The Eighteen Gods Celestial Planetarium */}
        <section className="cine-section snap-start [scroll-snap-stop:always] relative h-[150vh]" data-time-start="5.2" data-time-end="6.8">
          <div className="sticky top-0 h-[100dvh] flex flex-col justify-center px-4 sm:px-8 md:px-12 max-w-6xl mx-auto w-full pb-20 md:pb-0">
            <div className="story-scrim relative z-10 w-full pointer-events-auto">
              <CelestialPlanetarium onSelectGod={setSelectedStar} />
            </div>
          </div>
        </section>

        {/* L-08: 6.8s to 8.0s · Ephemeris & Date Selector */}
        <section className="cine-section snap-start [scroll-snap-stop:always] relative h-[150vh]" data-time-start="6.8" data-time-end="8.0">
          <div className="sticky top-0 h-[100dvh] w-full flex flex-col justify-center pb-24 md:pb-0 bg-[#0a0f17] bg-[radial-gradient(ellipse_at_center,_rgba(16,24,38,0.75)_0%,_#0a0f17_85%)]">
            <div className="px-3 sm:px-8 md:px-16 max-w-6xl mx-auto w-full">
              <div className="story-scrim pointer-events-auto">
                <DateDial />
              </div>
            </div>
          </div>
        </section>

        {/* L-09: 8.0s to 9.2s · The Valley Commons */}
        <section className="cine-section snap-start [scroll-snap-stop:always] relative h-[140vh]" data-time-start="8.0" data-time-end="9.2">
          <div className="sticky top-0 h-[100dvh] flex flex-col justify-center px-4 sm:px-8 md:px-16 max-w-6xl mx-auto w-full pb-24 md:pb-0">
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
        <section id="the-invitation" className="cine-section snap-start [scroll-snap-stop:always] relative h-[140vh]" data-time-start="9.2" data-time-end="10.0">
          <div className="sticky top-0 h-[100dvh] flex flex-col justify-center items-center px-6 text-center pb-24 md:pb-0">
            <div className="story-scrim relative z-10 space-y-10 md:space-y-12 max-w-2xl pointer-events-auto flex flex-col items-center">
              
              <div className="space-y-6 md:space-y-8">
                <p className="hud-mono text-amber tracking-eyebrow text-[10px] md:text-xs">
                  L-10 <span className="opacity-50 font-sans font-light mx-1.5">/</span> 06:05 <span className="opacity-50 font-sans font-light mx-1.5">/</span> FIRST LIGHT
                </p>
                
                <h2 className="font-display text-5xl sm:text-7xl md:text-[5.5rem] font-normal text-cream leading-[0.9] drop-shadow-xl">
                  <span className="italic block mb-1 md:mb-3 text-cream/90">Sunrise</span>
                  <span>at 06:14.</span>
                </h2>
                
                <p className="text-cream/80 text-sm sm:text-base leading-relaxed drop-shadow-md font-body max-w-sm mx-auto">
                  The shadow of the ridge slides down the orchard. The fire is still burning. Your morning coffee is ready.
                </p>
              </div>

              {/* Elegant divider */}
              <div className="w-8 h-px bg-cream/20"></div>

              <div className="space-y-8 flex flex-col items-center w-full">
                <Link
                  href="/book"
                  scroll={false}
                  className="group px-12 py-[18px] rounded-full bg-cream/95 hover:bg-white text-ink font-body text-[11px] font-bold uppercase tracking-eyebrow transition-all duration-500 ease-exhale shadow-[0_10px_40px_rgba(0,0,0,0.6)] hover:shadow-[0_10px_50px_rgba(255,255,255,0.15)] hover:scale-[1.03] active:scale-95 flex items-center justify-center gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                >
                  Reserve The Stay
                  <svg className="w-[15px] h-[15px] transition-transform duration-500 ease-exhale group-hover:translate-x-1.5 text-amber" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
                
                <a
                  href={whatsappLink("Hello House of Hulda! I have a few questions before reserving a stay.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-body text-[10px] tracking-label text-cream/50 hover:text-amber transition-colors duration-300 flex flex-col items-center gap-2 group uppercase"
                >
                  <span>Inquire with our host</span>
                  <div className="h-px w-4 group-hover:w-full bg-amber/30 group-hover:bg-amber transition-all duration-500 ease-exhale"></div>
                </a>
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
