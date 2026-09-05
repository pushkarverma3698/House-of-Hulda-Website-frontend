'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useNight } from '@/lib/store/night'

interface EphemerisDate {
  day: number
  dateStr: string
  darkFrom: string
  darkUntil: string
  darkHours: string
  moonIllum: string
  moonPhase: string
  godsCount: number
  highlight: string
  bortle: string
}

const AUGUST_DATES: EphemerisDate[] = [
  { day: 11, dateStr: '11 Aug', darkFrom: '20:39', darkUntil: '04:13', darkHours: '7.6 h', moonIllum: '2%', moonPhase: 'Waxing Crescent', godsCount: 18, highlight: 'The Ring Nebula climbs to 89° zenith overhead.', bortle: 'Class 1' },
  { day: 12, dateStr: '12 Aug', darkFrom: '20:38', darkUntil: '04:14', darkHours: '7.6 h', moonIllum: '6%', moonPhase: 'Waxing Crescent', godsCount: 18, highlight: 'Perseid Meteor Shower peak — 60+ meteors/hr.', bortle: 'Class 1' },
  { day: 13, dateStr: '13 Aug', darkFrom: '20:37', darkUntil: '04:15', darkHours: '7.6 h', moonIllum: '12%', moonPhase: 'Waxing Crescent', godsCount: 17, highlight: 'Cygnus Loop Supernova Remnant at peak altitude.', bortle: 'Class 1' },
  { day: 14, dateStr: '14 Aug', darkFrom: '20:36', darkUntil: '04:16', darkHours: '7.6 h', moonIllum: '19%', moonPhase: 'Waxing Crescent', godsCount: 16, highlight: 'Saturn & Cassini Division visible at 150x zoom.', bortle: 'Class 1' },
  { day: 15, dateStr: '15 Aug', darkFrom: '20:35', darkUntil: '04:17', darkHours: '7.7 h', moonIllum: '27%', moonPhase: 'First Quarter', godsCount: 15, highlight: 'Andromeda Galaxy M31 crisp before moonrise.', bortle: 'Class 2' },
  { day: 16, dateStr: '16 Aug', darkFrom: '20:34', darkUntil: '04:18', darkHours: '7.7 h', moonIllum: '36%', moonPhase: 'Waxing Gibbous', godsCount: 14, highlight: 'Heresy Ridge shadow lines over Chandrakhani.', bortle: 'Class 2' },
  { day: 17, dateStr: '17 Aug', darkFrom: '20:33', darkUntil: '04:19', darkHours: '7.7 h', moonIllum: '46%', moonPhase: 'Waxing Gibbous', godsCount: 14, highlight: 'Jupiter & 4 Galilean Moons rising by midnight.', bortle: 'Class 2' },
  { day: 18, dateStr: '18 Aug', darkFrom: '20:32', darkUntil: '04:20', darkHours: '7.8 h', moonIllum: '57%', moonPhase: 'Waxing Gibbous', godsCount: 13, highlight: 'Lunar Terminator passes Tycho Crater.', bortle: 'Class 2' },
  { day: 19, dateStr: '19 Aug', darkFrom: '20:31', darkUntil: '04:21', darkHours: '7.8 h', moonIllum: '68%', moonPhase: 'Waxing Gibbous', godsCount: 12, highlight: 'Stargazing around fire pit under golden moon.', bortle: 'Class 3' },
  { day: 20, dateStr: '20 Aug', darkFrom: '20:30', darkUntil: '04:22', darkHours: '7.8 h', moonIllum: '78%', moonPhase: 'Waxing Gibbous', godsCount: 11, highlight: 'Bright moonlit valley walls & cedar silhouette.', bortle: 'Class 3' },
  { day: 21, dateStr: '21 Aug', darkFrom: '20:28', darkUntil: '04:23', darkHours: '7.9 h', moonIllum: '87%', moonPhase: 'Waxing Gibbous', godsCount: 10, highlight: 'Lunar Photography night from high balcony.', bortle: 'Class 3' },
  { day: 22, dateStr: '22 Aug', darkFrom: '20:27', darkUntil: '04:24', darkHours: '7.9 h', moonIllum: '94%', moonPhase: 'Waxing Gibbous', godsCount: 9, highlight: 'Supermoon prelude — high contrast peak views.', bortle: 'Class 3' },
  { day: 23, dateStr: '23 Aug', darkFrom: '20:26', darkUntil: '04:25', darkHours: '7.9 h', moonIllum: '98%', moonPhase: 'Full Moon', godsCount: 8, highlight: 'Full Himalayan Moonlit Valley Panorama.', bortle: 'Class 3' },
  { day: 24, dateStr: '24 Aug', darkFrom: '20:25', darkUntil: '04:26', darkHours: '8.0 h', moonIllum: '100%', moonPhase: 'Full Moon', godsCount: 8, highlight: 'Midnight trail walking under silver peak glow.', bortle: 'Class 3' },
]

export function DateDial() {
  const [selectedDay, setSelectedDay] = useState<number>(11)
  const activeData = AUGUST_DATES.find((d) => d.day === selectedDay) || AUGUST_DATES[0]

  return (
    <section className="relative my-0 w-full max-w-5xl mx-auto px-0 md:px-4 pointer-events-auto">
      {/* Luxury Astronomical Glass Container */}
      <div className="relative overflow-hidden rounded-2xl md:rounded-3xl border border-white/10 bg-neutral-950/80 p-4 sm:p-6 md:p-8 backdrop-blur-2xl shadow-[0_32px_96px_rgba(0,0,0,0.8)]">
        {/* Subtle Ambient Radial Glow */}
        <div 
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none transition-all duration-700"
          style={{ opacity: selectedDay === 11 || selectedDay === 12 ? 0.25 : 0.1 }}
        />

        {/* Top Header & Telemetry Coordinates */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
              <span className="hud-mono text-[11px] tracking-widest text-amber-400 uppercase">
                Plan The Night · 32.1198° N, 77.1731° E
              </span>
            </div>
            <h2 className="font-serif text-3xl md:text-5xl font-normal text-neutral-100 leading-tight">
              Pick a Date. <span className="italic text-amber-200/90">Watch the Sky Re-render.</span>
            </h2>
            <p className="text-sm md:text-base text-neutral-400 max-w-xl font-body">
              What the sky does on your dates — live ephemeris telemetry computed for Naggar Ridge at 2,180m elevation.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3.5 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 hud-mono text-[10px] text-amber-300 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              BORTLE {activeData.bortle.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Interactive Date Dial Bar */}
        <div className="py-3 md:py-6">
          <div className="flex items-center justify-between mb-2 md:mb-3">
            <span className="hud-mono text-[10px] text-neutral-400 uppercase tracking-widest">
              August 2026 Night Selector
            </span>
            <span className="hud-mono text-[10px] text-amber-400/80">
              Selected: <strong className="text-amber-300 font-semibold">{activeData.dateStr}</strong>
            </span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-4 pt-1 scrollbar-thin scrollbar-thumb-amber-500/20 scrollbar-track-transparent">
            {AUGUST_DATES.map((item) => {
              const isSelected = item.day === selectedDay
              return (
                <button
                  key={item.day}
                  onClick={() => setSelectedDay(item.day)}
                  className={`relative flex flex-col items-center justify-center min-w-[54px] min-h-[58px] rounded-xl border transition-all duration-300 group ${
                    isSelected
                      ? 'border-amber-400 bg-amber-400/15 text-white shadow-[0_0_24px_rgba(245,158,11,0.25)] scale-105'
                      : 'border-white/10 bg-white/[0.03] text-neutral-400 hover:border-amber-500/40 hover:bg-white/[0.07] hover:text-neutral-200'
                  }`}
                >
                  <span className="hud-mono text-[9px] text-neutral-500 uppercase group-hover:text-neutral-300">
                    AUG
                  </span>
                  <span className={`font-serif text-lg font-medium leading-none ${isSelected ? 'text-amber-300' : 'text-neutral-200'}`}>
                    {item.day}
                  </span>

                  {/* Moon Illumination Dot Indicator */}
                  <span 
                    className={`mt-1 h-1.5 w-1.5 rounded-full ${
                      parseInt(item.moonIllum) < 15 ? 'bg-amber-400' : 'bg-neutral-600'
                    }`} 
                  />
                </button>
              )
            })}
          </div>
        </div>

        {/* Telemetry Grid & Celestial Status */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2 pb-6">
          <div className="p-4 rounded-xl border border-white/5 bg-black/40 backdrop-blur-md flex flex-col justify-between">
            <span className="hud-mono text-[9.5px] uppercase tracking-wider text-neutral-400">Dark From</span>
            <div className="mt-2 font-mono text-xl md:text-2xl text-amber-300 font-semibold">{activeData.darkFrom}</div>
            <span className="text-[10px] text-neutral-400 mt-1 font-body">Astronomical twilight start</span>
          </div>

          <div className="p-4 rounded-xl border border-white/5 bg-black/40 backdrop-blur-md flex flex-col justify-between">
            <span className="hud-mono text-[9.5px] uppercase tracking-wider text-neutral-400">Until</span>
            <div className="mt-2 font-mono text-xl md:text-2xl text-amber-300 font-semibold">{activeData.darkUntil}</div>
            <span className="text-[10px] text-neutral-400 mt-1 font-body">Dawn twilight onset</span>
          </div>

          <div className="p-4 rounded-xl border border-white/5 bg-black/40 backdrop-blur-md flex flex-col justify-between">
            <span className="hud-mono text-[9.5px] uppercase tracking-wider text-neutral-400">Hours Dark</span>
            <div className="mt-2 font-mono text-xl md:text-2xl text-neutral-100 font-semibold">{activeData.darkHours}</div>
            <span className="text-[10px] text-neutral-400 mt-1 font-body">Total unpolluted dark window</span>
          </div>

          <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 backdrop-blur-md flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <span className="hud-mono text-[9.5px] uppercase tracking-wider text-amber-400">Moon Phase</span>
              <span className="hud-mono text-[9px] text-amber-300 font-bold">{activeData.moonIllum}</span>
            </div>
            <div className="mt-2 font-serif text-lg md:text-xl text-neutral-100 font-medium truncate">{activeData.moonPhase}</div>
            <span className="text-[10px] text-amber-200/70 mt-1 font-body truncate">
              {parseInt(activeData.moonIllum) < 15 ? 'Faint objects hold up' : 'Moonlit landscape view'}
            </span>
          </div>
        </div>

        {/* Celestial Highlight & Deity Count Banner */}
        <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.02] flex flex-col md:flex-row md:items-center justify-between gap-4 my-2">
          <div className="flex items-start gap-3">
            <span className="text-2xl">✦</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="hud-mono text-[10px] text-amber-400 uppercase font-semibold">
                  {activeData.godsCount} of the 18 Gods at Best Visibility
                </span>
              </div>
              <p className="text-sm text-neutral-200 font-body mt-0.5">
                {activeData.highlight}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end md:self-auto">
            <Link
              href="/book"
              scroll={false}
              className="px-6 py-3 rounded-full bg-amber-400 text-black font-mono text-xs font-bold uppercase tracking-widest hover:bg-amber-300 transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:scale-[1.03] active:scale-95 whitespace-nowrap flex items-center gap-2"
            >
              <span>Hold {activeData.dateStr}</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
