'use client'

import React from 'react'
import Image from 'next/image'

interface DayMoment {
  time: string
  title: string
  subtitle: string
  prose: string
  altitude: string
  image?: string
  tag: string
}

const MOMENTS: DayMoment[] = [
  {
    time: '07:10',
    title: 'First Light',
    subtitle: 'The orchard awakens',
    prose:
      'Steam rises into crisp mountain air. Coffee poured hot from the kettle, birds stirring in ancient apple boughs, and the highest Pir Panjal peaks catching the first amber rim of sunlight.',
    altitude: '2,180m · Dawn',
    tag: 'RITUAL 01',
    image: '/images/orchard-golden.jpg',
  },
  {
    time: '09:30',
    title: 'The Valley',
    subtitle: 'Footpaths through ancient cedar',
    prose:
      'A slow walk down stone trails worn smooth by centuries of apple pickers and shepherds. Through the deodar forest to Naggar castle, ancient wood carvings, and crystal glacial water.',
    altitude: '1,840m · Forest',
    tag: 'RITUAL 02',
    image: '/images/arrival_courtyard_dusk.jpg',
  },
  {
    time: '13:20',
    title: 'The Table',
    subtitle: 'Warmth from the hearth',
    prose:
      'Siddu fresh off the steam, dipped in golden melted ghee with wild mountain walnut and coriander chutney. Food cooked unhurriedly over wood fire, eaten looking out over the entire Kullu valley.',
    altitude: '2,180m · Hearth',
    tag: 'RITUAL 03',
    image: '/images/himachali_culinary_hearth.jpg',
  },
  {
    time: '16:40',
    title: 'The Ridge',
    subtitle: 'Alpenglow on the snowline',
    prose:
      'The light turns deep honey gold. Long cedar shadows reach across the stone courtyard. Tea poured in terracotta cups, a journal opened on the wooden bench as the valley below settles into violet evening.',
    altitude: '2,180m · Golden Hour',
    tag: 'RITUAL 04',
    image: '/images/arrival-golden-hour.jpg',
  },
  {
    time: '19:00',
    title: 'The Hearth',
    subtitle: 'Cedar smoke & shared stories',
    prose:
      'The cast-iron bukhari crackles with aromatic deodar embers. Guests gather on wool pattu rugs. Local stories of village deities, shared bread, and the quiet comfort of a mountain house holding off the cold.',
    altitude: '2,180m · Dusk',
    tag: 'RITUAL 05',
    image: '/images/table-himachali.jpg',
  },
  {
    time: '23:45',
    title: 'The Sky',
    subtitle: 'Eighteen gods above the ridge',
    prose:
      'Wrap yourself in thick hand-loomed pattu wool. Step onto the open deck into sub-zero silence. No streetlights, no smog—only the Milky Way sweeping from Chandrakhani Pass across the roof.',
    altitude: '2,180m · Starlight',
    tag: 'RITUAL 06',
    image: '/images/room-lantern.jpg',
  },
]

export function DayAtHulda({ variant = 'light' }: { variant?: 'light' | 'dark' }) {
  const isDark = variant === 'dark'

  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8 md:px-12">
        {/* Header: Human & Instrument */}
        <div className="max-w-2xl mb-16 md:mb-20">
          <div className="flex items-center gap-3 mb-4">
            <span
              className={`hud-mono text-[10px] tracking-[0.24em] uppercase ${
                isDark ? 'text-amber-400/80' : 'text-clay font-bold'
              }`}
            >
              The Mountain Rhythm
            </span>
            <span className={`w-8 h-[1px] ${isDark ? 'bg-amber-400/30' : 'bg-clay/30'}`} />
            <span
              className={`hud-mono text-[10px] tracking-wider ${
                isDark ? 'text-white/40' : 'text-deodar/50'
              }`}
            >
              24 HOURS IN RUMSU
            </span>
          </div>
          <h2
            className={`font-display text-[clamp(28px,4.5vw,46px)] font-medium leading-[1.15] tracking-tight ${
              isDark ? 'text-cream' : 'text-bark'
            }`}
          >
            A day kept simple,
            <br />
            <span className="italic font-light opacity-80">measured by sun and cedar smoke.</span>
          </h2>
          <p
            className={`mt-5 text-[15px] md:text-[16px] font-light leading-relaxed ${
              isDark ? 'text-cream/70' : 'text-deodar'
            }`}
          >
            Time moves differently at 2,180 metres. There are no alarms here, only the temperature of
            the stones, the angle of sunlight across the timber beams, and the fire relit before sundown.
          </p>
        </div>

        {/* Timeline Grid */}
        <div className="relative border-l border-white/15 dark:border-white/10 pl-6 sm:pl-10 md:pl-16 space-y-16 md:space-y-24 ml-2 sm:ml-4">
          {MOMENTS.map((m, idx) => (
            <div key={m.time} className="relative group">
              {/* Timeline Marker Dot */}
              <div
                className={`absolute -left-[31px] sm:-left-[47px] md:-left-[71px] top-1.5 w-3.5 h-3.5 rounded-full border-2 transition-transform duration-300 group-hover:scale-125 ${
                  isDark
                    ? 'bg-black border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.6)]'
                    : 'bg-bone border-clay shadow-sm'
                }`}
              />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
                {/* Text Content */}
                <div className="lg:col-span-7">
                  <div className="flex flex-wrap items-center gap-3 mb-2.5">
                    <span
                      className={`hud-mono text-sm md:text-base font-semibold tracking-wider ${
                        isDark ? 'text-amber-300' : 'text-clay'
                      }`}
                    >
                      {m.time}
                    </span>
                    <span className={`text-xs ${isDark ? 'text-white/20' : 'text-bark/20'}`}>•</span>
                    <span
                      className={`hud-mono text-[10px] tracking-[0.16em] uppercase ${
                        isDark ? 'text-white/40' : 'text-deodar/60'
                      }`}
                    >
                      {m.tag}
                    </span>
                    <span className={`text-xs ${isDark ? 'text-white/20' : 'text-bark/20'}`}>•</span>
                    <span
                      className={`hud-mono text-[10px] tracking-wider ${
                        isDark ? 'text-white/40' : 'text-deodar/60'
                      }`}
                    >
                      {m.altitude}
                    </span>
                  </div>

                  <h3
                    className={`font-display text-2xl md:text-3xl font-medium tracking-tight ${
                      isDark ? 'text-cream' : 'text-bark'
                    }`}
                  >
                    {m.title}
                    <span className="block text-base md:text-lg font-light italic mt-0.5 opacity-75">
                      {m.subtitle}
                    </span>
                  </h3>

                  <p
                    className={`mt-4 text-[14.5px] md:text-[15.5px] font-light leading-relaxed max-w-xl ${
                      isDark ? 'text-cream/75' : 'text-deodar'
                    }`}
                  >
                    {m.prose}
                  </p>
                </div>

                {/* Atmospheric Image Thumbnail */}
                {m.image && (
                  <div className="lg:col-span-5">
                    <div
                      className={`relative aspect-[16/10] sm:aspect-[16/9] lg:aspect-[4/3] rounded-2xl overflow-hidden border shadow-lg transition-transform duration-500 group-hover:scale-[1.02] ${
                        isDark ? 'border-white/10 bg-black/40' : 'border-bark/10 bg-sand/30'
                      }`}
                    >
                      <Image
                        src={m.image}
                        alt={`${m.title} at House of Hulda`}
                        fill
                        sizes="(max-width: 1024px) 100vw, 400px"
                        className="object-cover"
                      />
                      <div
                        className={`absolute inset-0 ${
                          isDark
                            ? 'bg-gradient-to-t from-black/60 via-transparent to-transparent'
                            : 'bg-gradient-to-t from-bark/30 via-transparent to-transparent'
                        }`}
                      />
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[10px] hud-mono text-white/90 drop-shadow-md">
                        <span>{m.title}</span>
                        <span>{m.time}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
