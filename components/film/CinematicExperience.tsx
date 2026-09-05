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
import { useState } from 'react'

const CanvasRoot = dynamic(
  () => import('@/components/canvas/CanvasRoot').then((mod) => mod.CanvasRoot),
  { ssr: false }
)

const HeritageSandbox = dynamic(
  () => import('@/components/canvas/HeritageSandbox').then((mod) => mod.HeritageSandbox),
  { ssr: false }
)

const WebGLGallery = dynamic(
  () => import('@/components/canvas/WebGLGallery').then((mod) => mod.WebGLGallery),
  { ssr: false }
)

// Stagger delays for deity grid cascade
const STAGGER_MS = [0,40,80,120,160,200,240,280,320,360,400,440,480,520,560,600,640,680]

export function CinematicExperience() {
  const [selectedStar, setSelectedStar] = useState<CelestialGod | null>(null)
  const [isHearthMenuOpen, setIsHearthMenuOpen] = useState(false)
  const [isSandboxOpen, setIsSandboxOpen] = useState(false)
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)

  return (
    <main className="relative min-h-[950svh] bg-transparent text-cream font-body selection:bg-amber selection:text-ink">
      {/* z-0 Fixed WebGL Master Cinematic Canvas (3D Volumetric Depth Planes, Dynamic SkyBoxes, Embers, PostProcessing) */}
      <CanvasRoot />

      {/* Navigation Header */}
      <Navigation />

      {/* z-20 Fixed UI Overlays */}
      <TimeRail />
      <Soundscape />

      {/* Cinematic film-reel scroll progress — top of viewport */}
      <FilmReel />

      {/* The reserve a thumb can reach — phone only, from the first beat on */}
      <ReserveDock />

      {/* z-50 Initial Atmospheric Loader */}
      <Preloader />

      {/* Scrub telemetry — renders only with ?debug=perf in the URL */}
      <ScrubDebugOverlay />

      {/* Cinematic overlay: vignette + film grain tied to every act */}
      <div className="cine-overlay" aria-hidden="true" />

      {/* z-10 Transparent Scroll Spacers with Story Beats */}
      <div className="relative z-10 pointer-events-none">

        {/* ═══════════════════════════════════════════
            L-01: 15:40 — THE ROAD STOPS AT RUMSU
            Text lives on the ground — no box.
            A deep bottom gradient anchors it.
        ═══════════════════════════════════════════ */}
        <section className="relative h-[120svh] flex flex-col justify-end pb-44 sm:pb-36 px-8 md:px-24">
          <div data-beat="left" className="story-scrim story-scrim-left relative space-y-5 max-w-2xl">
            <p className="hud-mono text-amber tracking-widest text-[10px] flex items-center gap-2 hero-hint-enter"
              style={{ animationDelay: '0.4s' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-amber animate-ping" />
              L-01 · 15:40 · ALT 2,180M
            </p>
            <h1 className="hero-title-enter font-display text-4xl md:text-6xl lg:text-7xl font-normal leading-[1.05] text-cream text-glow-amber">
              The road stops<br />at Rumsu.
            </h1>
            <p className="hero-sub-enter text-cream/90 text-base md:text-lg leading-relaxed max-w-xl text-glow-amber">
              Above it, the trail to Chandrakhani — where a storm once tore a basket of eighteen gods off a rishi&apos;s head and scattered them across these peaks.
            </p>
            <p className="hero-sub-enter text-amber/70 text-sm hud-mono tracking-wide text-glow-amber"
              style={{ animationDelay: '1.5s' }}>
              They&apos;re still up there. We have a telescope.
            </p>
            <div className="hero-hint-enter pt-3 flex items-center gap-2 text-cream/60 text-[10px] hud-mono tracking-widest"
              style={{ animationDelay: '1.9s' }}>
              <span className="animate-bounce inline-block">↓</span> SCROLL TO DESCEND INTO THE VALLEY
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            L-02: 16:23 — THE WATER
            Right-side alignment, no box
        ═══════════════════════════════════════════ */}
        <section className="relative h-[120svh] flex flex-col justify-center px-8 md:px-24 items-start">
          <div data-beat="left" className="story-scrim story-scrim-left relative space-y-4 max-w-lg text-left">
            <p className="hud-mono text-amber tracking-widest text-[10px]">
              L-02 · 16:23 · GLACIAL SPRINGS
            </p>
            <h2 className="font-display text-3xl md:text-5xl font-normal text-cream leading-tight text-glow-amber">
              You will hear it<br />before you see it.
            </h2>
            <p className="text-cream/90 text-sm md:text-base leading-relaxed text-glow-amber">
              Glacial melt from Chandrakhani ridge. Piped into cedar soaking tubs and copper kitchen urns. Cold enough to bite. Pure enough to drink without a filter.
            </p>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            L-03: 17:07 — DEODAR AND STONE
            Left-side, centered placement
        ═══════════════════════════════════════════ */}
        <section className="relative h-[120svh] flex flex-col justify-center px-8 md:px-24">
          <div data-beat="left" className="story-scrim story-scrim-left relative space-y-4 max-w-xl">
            <p className="hud-mono text-amber tracking-widest text-[10px]">
              L-03 · 17:07 · KATH-KUNI ARCHITECTURE
            </p>
            <h2 className="font-display text-3xl md:text-5xl font-normal text-cream leading-tight text-glow-amber">
              Deodar and stone.
            </h2>
            <p className="text-cream/90 text-sm md:text-base leading-relaxed text-glow-amber">
              Stacked in alternating courses of dressed mountain schist and hand-hewn cedar. No mortar. No iron nails. The structure tightens with winter frost and breathes with earth tremors.
            </p>
            <p className="text-amber/60 text-xs hud-mono tracking-wide text-glow-amber">
              500 years of mountain engineering in every beam.
            </p>
            <div className="pt-2 pointer-events-auto">
              <button
                onClick={() => setIsSandboxOpen(true)}
                className="inline-flex min-h-11 items-center px-5 py-2.5 rounded-full border border-amber/30 bg-ink/40 backdrop-blur-md text-amber hud-mono text-xs uppercase tracking-widest hover:border-amber hover:bg-amber/10 transition-all gap-2 shadow-lg hover:shadow-[0_0_20px_rgba(217,154,78,0.2)] active:scale-95"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber animate-ping" />
                ✦ Inspect 3D Joinery Model
              </button>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            L-04: 17:50 — THE ORCHARD TURNS
            Center, upper-third — the golden hour shot
        ═══════════════════════════════════════════ */}
        <section className="relative h-[120svh] flex flex-col justify-center items-center text-center px-8 md:px-24">
          <div data-beat="right" className="story-scrim relative space-y-4 max-w-2xl">
            <p className="hud-mono text-amber tracking-widest text-[10px]">
              L-04 · 17:50 · GOLDEN HOUR
            </p>
            <h2 className="font-display text-4xl md:text-6xl font-normal text-cream leading-tight text-glow-amber">
              The orchard turns<br />amber.
            </h2>
            <p className="text-cream/90 text-base md:text-lg leading-relaxed text-glow-amber">
              Ancient Royal Delicious apple trees. Long shadows across grass. The Pir Panjal crest holding the last direct ray of the day.
            </p>
            <p className="text-amber/70 text-sm hud-mono text-glow-amber">
              This light lasts twelve minutes.
            </p>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            L-05: 18:29 — THE LOFT
            Right-side panel, mid-section
        ═══════════════════════════════════════════ */}
        <section className="relative h-[120svh] flex flex-col justify-center px-8 md:px-24 items-end">
          <div data-beat="left" className="story-scrim story-scrim-right relative space-y-4 max-w-lg text-right">
            <p className="hud-mono text-amber tracking-widest text-[10px]">
              L-05 · 18:29 · THE LOFT
            </p>
            <h2 className="font-display text-3xl md:text-5xl font-normal text-cream leading-tight text-glow-amber">
              The Attic Sanctuary.
            </h2>
            <p className="text-cream/90 text-sm md:text-base leading-relaxed text-glow-amber">
              Low timber floor seating under a pitched slate roof. Handwoven Kullu blankets. A cup of mountain kahwa as the valley goes dark below you.
            </p>
            <p className="text-cream/60 text-xs hud-mono text-glow-amber">
              Warm light. Dusk settling. Nowhere else to be.
            </p>
            <div className="pt-2 pointer-events-auto flex justify-end">
              <button
                onClick={() => setIsGalleryOpen(true)}
                className="inline-flex min-h-11 items-center px-5 py-2.5 rounded-full border border-amber/30 bg-ink/40 backdrop-blur-md text-amber hud-mono text-xs uppercase tracking-widest hover:border-amber hover:bg-amber/10 transition-all gap-2 shadow-lg hover:shadow-[0_0_20px_rgba(217,154,78,0.2)] active:scale-95"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber animate-pulse" />
                ✦ Explore Suites (Liquid WebGL)
              </button>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            L-06: 19:07 — THE HEARTH
            Center cinematic panel with amber warmth
        ═══════════════════════════════════════════ */}
        <section className="relative h-[120svh] flex flex-col justify-center items-center text-center px-8 md:px-24">
          <div data-beat="right" className="story-scrim relative space-y-5 max-w-xl">
            <p className="hud-mono text-amber tracking-widest text-[10px]">
              L-06 · 19:07 · THE HEARTH
            </p>
            <h2 className="font-display text-4xl md:text-6xl font-normal text-cream leading-tight text-glow-amber">
              The Woodstove<br />Hearth.
            </h2>
            <p className="text-cream/90 text-base md:text-lg leading-relaxed text-glow-amber">
              A cast-iron stove burning aged deodar rootwood. Fresh siddu over wild walnut stuffing. Ghee poured hot at the table.
            </p>
            <p className="text-amber/70 text-sm hud-mono tracking-wide text-glow-amber">
              Outside, the temperature drops toward zero.<br />Inside, pure Himalayan warmth.
            </p>
            <div className="pt-8 pointer-events-auto">
              {!isHearthMenuOpen ? (
                <button
                  onClick={() => setIsHearthMenuOpen(true)}
                  className="inline-flex min-h-11 items-center px-5 py-2.5 rounded-full border border-amber/30 bg-ink/40 backdrop-blur-md text-amber hud-mono text-xs uppercase tracking-widest hover:border-amber hover:bg-amber/10 transition-all flex items-center justify-center gap-2 mx-auto shadow-lg hover:shadow-[0_0_20px_rgba(217,154,78,0.2)]"
                >
                  <span className="w-1 h-1 rounded-full bg-amber animate-ping" />
                  + In the Hearth
                </button>
              ) : (
                <div className="bg-ink/60 backdrop-blur-xl border border-amber/20 rounded-2xl p-6 text-left max-w-sm mx-auto shadow-2xl animate-in zoom-in-95 fade-in duration-300">
                  <div className="flex justify-between items-center mb-4">
                    <span className="hud-mono text-xs tracking-widest uppercase text-amber">
                      Heritage Menu
                    </span>
                    <button onClick={() => setIsHearthMenuOpen(false)} className="text-cream/50 hover:text-cream transition-colors">✕</button>
                  </div>
                  <ul className="space-y-4 font-display text-cream/90">
                    <li className="flex gap-3 items-start">
                      <span className="text-amber/50 mt-1">✦</span>
                      <div>
                        <p className="text-sm md:text-base text-amber/90">Fresh Siddu</p>
                        <p className="text-xs text-cream/60 font-body">Steamed yeast bread with wild walnut & opium seed stuffing.</p>
                      </div>
                    </li>
                    <li className="flex gap-3 items-start">
                      <span className="text-amber/50 mt-1">✦</span>
                      <div>
                        <p className="text-sm md:text-base text-amber/90">Apple Wood Smoked Trout</p>
                        <p className="text-xs text-cream/60 font-body">Caught in the Tirthan River, smoked slow over orchard trimmings.</p>
                      </div>
                    </li>
                    <li className="flex gap-3 items-start">
                      <span className="text-amber/50 mt-1">✦</span>
                      <div>
                        <p className="text-sm md:text-base text-amber/90">Wildflower Honey & Ghee</p>
                        <p className="text-xs text-cream/60 font-body">Poured hot over every meal. Raw and unfiltered.</p>
                      </div>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            L-07: 19:45 → 23:06 — THE EIGHTEEN GODS
            Interactive Celestial Registry
            Minimal glass panel — this IS an instrument
        ═══════════════════════════════════════════ */}
        <section className="relative min-h-[155svh] flex flex-col justify-center px-6 md:px-16 max-w-6xl mx-auto pt-36 pb-24">
          <div className="space-y-6 bg-ink/[0.88] md:bg-ink/[0.65] p-6 md:p-10 rounded-2xl md:backdrop-blur-xl border border-white/[0.07] shadow-2xl pointer-events-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-3">
                <p className="hud-mono text-amber tracking-widest text-[10px] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber animate-pulse" />
                  L-07 · 19:45 · BORTLE CLASS 1 CELESTIAL VAULT
                </p>
                <h2 className="font-display text-3xl md:text-5xl font-normal text-cream leading-tight">
                  The Eighteen Gods<br />in the Sky.
                </h2>
                <p className="text-cream/60 text-sm md:text-base max-w-lg leading-relaxed">
                  Select any celestial deity to bring up live astronomical coordinates and our 200mm balcony refractor telemetry.
                </p>
              </div>
              <span className="hud-mono text-[10px] text-amber/70 border border-amber/20 px-3 py-1.5 rounded-full self-start md:self-auto bg-amber/5">
                18 OBJECTS ACTIVE<span className="sm:hidden"> · SWIPE →</span>
              </span>
            </div>

            {/* Interactive Deities — a swipe on a phone, a grid from sm up.
                As a two-column grid this was nine rows deep, and it made L-07
                2,610px tall on a 390px phone: 3.1 screens, 23% of the whole
                page, the single largest block on the site — and it landed
                immediately after the hearth, so the film ended and handed the
                visitor a spreadsheet. A rail costs one screen instead of three,
                keeps the sky visible above and below the panel, and turns
                eighteen identical rows into something the thumb browses.
                `overscroll-x-contain` stops a swipe at the last card from
                triggering the browser's back gesture. */}
            <div className="flex gap-2.5 pt-2 overflow-x-auto overscroll-x-contain snap-x snap-mandatory -mx-6 px-6 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-3 lg:grid-cols-6 sm:overflow-visible sm:mx-0 sm:px-0">
              {EIGHTEEN_GODS.map((god, idx) => (
                <button
                  key={god.id}
                  onClick={() => setSelectedStar(god)}
                  className="w-[44%] shrink-0 snap-start sm:w-auto sm:shrink p-3 rounded-xl bg-white/[0.03] hover:bg-amber/[0.08] border border-white/[0.06] hover:border-amber/30 text-left transition-all group flex flex-col justify-between min-h-24 shadow-sm hover:shadow-[0_0_15px_rgba(217,154,78,0.15)] hover:scale-[1.02] active:scale-95"
                  style={{ animationDelay: `${STAGGER_MS[idx] || idx * 40}ms` }}
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
                    <h3 className="font-display text-sm text-cream/90 group-hover:text-amber/90 transition-colors leading-tight">
                      {god.deity}
                    </h3>
                    <p className="hud-mono text-[9px] text-cream/50 truncate mt-0.5">
                      {god.designation.split(' ').slice(0, 2).join(' ')}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {/* Interactive Ephemeris Date Picker & Stargazing Planner */}
            <DateDial />
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            L-08: 02:27 — THE VALLEY COMMONS
            Marketplace — minimal wrap, editorial
        ═══════════════════════════════════════════ */}
        <section className="relative min-h-[120svh] flex flex-col justify-center px-6 md:px-16 max-w-6xl mx-auto pt-36 pb-24">
          <div className="space-y-4 bg-ink/[0.90] md:bg-ink/[0.70] p-8 md:p-12 rounded-2xl md:backdrop-blur-xl border border-white/[0.06] shadow-2xl">
            <p className="hud-mono text-amber tracking-widest text-[10px]">
              L-08 · 02:27 · THE VALLEY COMMONS
            </p>
            <h2 className="font-display text-3xl md:text-5xl font-normal text-cream leading-tight">
              Crafted in the Valley.
            </h2>
            <p className="text-cream/60 text-sm md:text-base leading-relaxed max-w-2xl">
              Everything in House of Hulda comes from local Himalayan hands. Pure wool handlooms, raw wildflower honey, carved deodar keepsakes.
            </p>
            <Marketplace />
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            L-09: 06:05 — DAWN & INVITATION
            Full-bleed. No box. Text on first light.
        ═══════════════════════════════════════════ */}
        <section id="the-invitation" className="relative h-[100svh] flex flex-col justify-center items-center px-8 text-center">
          <div className="story-scrim relative space-y-7 max-w-xl">
            <p className="hud-mono text-amber tracking-widest text-[10px]">
              L-09 · 06:05 · FIRST LIGHT
            </p>
            <h2 className="font-display text-5xl md:text-7xl font-normal text-cream leading-tight text-glow-amber">
              Sunrise at 06:14.
            </h2>
            <p className="text-cream/90 text-base md:text-lg leading-relaxed text-glow-amber">
              One secluded residence. One private telescope.<br />
              Eighteen wonders you will remember for the rest of your life.
            </p>

            <Link
              href="/book"
              scroll={false}
              className="pointer-events-auto px-10 py-4 rounded-full bg-amber/10 border border-amber/30 text-amber hover:bg-amber/20 hover:border-amber/60 hud-mono tracking-widest transition-all backdrop-blur-md shadow-[0_0_15px_rgba(217,154,78,0.15)] hover:shadow-[0_0_20px_rgba(217,154,78,0.3)] active:scale-95 cursor-pointer text-xs uppercase font-bold text-center inline-block"
            >
              Reserve The Stay
            </Link>
          </div>
        </section>

      </div>

      {/* Celestial Deity Inspection Drawer */}
      {selectedStar && (
        <StarCard star={selectedStar} onClose={() => setSelectedStar(null)} />
      )}

      {/* Tactile Heritage 3D Sandbox Modal */}
      <HeritageSandbox
        isOpen={isSandboxOpen}
        onClose={() => setIsSandboxOpen(false)}
      />

      {/* Liquid Distortion WebGL Gallery Modal */}
      <WebGLGallery
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
      />
    </main>
  )
}
