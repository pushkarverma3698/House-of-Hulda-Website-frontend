'use client'

import React, { useState, useRef, useMemo } from 'react'
import { EIGHTEEN_GODS, CelestialGod } from '@/content/eighteen'

interface CelestialPlanetariumProps {
  onSelectGod: (god: CelestialGod) => void
}

// Projected celestial coordinates across an interactive 2D panoramic dome
const CONSTELLATION_NODES = [
  { id: 1, x: 22, y: 28, neighbors: [2, 4] },
  { id: 2, x: 38, y: 35, neighbors: [1, 3, 5] },
  { id: 3, x: 55, y: 24, neighbors: [2, 6] },
  { id: 4, x: 18, y: 52, neighbors: [1, 7] },
  { id: 5, x: 42, y: 58, neighbors: [2, 8, 9] },
  { id: 6, x: 70, y: 32, neighbors: [3, 10] },
  { id: 7, x: 28, y: 72, neighbors: [4, 8, 13] },
  { id: 8, x: 48, y: 76, neighbors: [5, 7, 14] },
  { id: 9, x: 62, y: 64, neighbors: [5, 11] },
  { id: 10, x: 82, y: 40, neighbors: [6, 12] },
  { id: 11, x: 74, y: 70, neighbors: [9, 15] },
  { id: 12, x: 88, y: 55, neighbors: [10, 16] },
  { id: 13, x: 20, y: 84, neighbors: [7, 17] },
  { id: 14, x: 40, y: 86, neighbors: [8, 17, 18] },
  { id: 15, x: 66, y: 82, neighbors: [11, 18] },
  { id: 16, x: 84, y: 74, neighbors: [12, 15] },
  { id: 17, x: 32, y: 92, neighbors: [13, 14] },
  { id: 18, x: 54, y: 90, neighbors: [14, 15] },
]

export function CelestialPlanetarium({ onSelectGod }: CelestialPlanetariumProps) {
  const [activeGod, setActiveGod] = useState<CelestialGod | null>(EIGHTEEN_GODS[0])
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  // Background random ambient stars
  const backgroundStars = useMemo(() => {
    return Array.from({ length: 90 }, (_, i) => ({
      id: i,
      x: (i * 17.3) % 100,
      y: (i * 29.7) % 85,
      size: (i % 3) * 0.8 + 1,
      opacity: 0.2 + ((i % 5) / 5) * 0.6,
      pulseDuration: 2 + (i % 4) * 1.5,
      delay: (i % 6) * 0.7,
    }))
  }, [])

  // Interactive mouse parallax & drag
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    dragStartRef.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const dx = (e.clientX - dragStartRef.current.x) * 0.6
      const dy = (e.clientY - dragStartRef.current.y) * 0.6
      setPan({
        x: Math.max(-120, Math.min(120, dragStartRef.current.panX + dx)),
        y: Math.max(-80, Math.min(80, dragStartRef.current.panY + dy)),
      })
    } else if (containerRef.current) {
      // Gentle parallax follow
      const rect = containerRef.current.getBoundingClientRect()
      const nx = (e.clientX - rect.left) / rect.width - 0.5
      const ny = (e.clientY - rect.top) / rect.height - 0.5
      setPan({ x: nx * -40, y: ny * -30 })
    }
  }

  const handleMouseUp = () => setIsDragging(false)

  // Touch drag support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const t = e.touches[0]
      setIsDragging(true)
      dragStartRef.current = { x: t.clientX, y: t.clientY, panX: pan.x, panY: pan.y }
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && e.touches.length === 1) {
      const t = e.touches[0]
      const dx = (t.clientX - dragStartRef.current.x) * 0.8
      const dy = (t.clientY - dragStartRef.current.y) * 0.8
      setPan({
        x: Math.max(-120, Math.min(120, dragStartRef.current.panX + dx)),
        y: Math.max(-80, Math.min(80, dragStartRef.current.panY + dy)),
      })
    }
  }

  return (
    <div 
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseUp}
      className="relative w-full h-[620px] md:h-[700px] rounded-3xl overflow-hidden bg-[#03060a] border border-white/10 select-none shadow-[0_20px_80px_rgba(0,0,0,0.9)] cursor-grab active:cursor-grabbing"
    >
      {/* 1. Deep Space Atmosphere & Nebula Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_20%,rgba(16,28,45,0.7)_0%,rgba(3,6,10,0.95)_75%,#020407_100%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(245,158,11,0.06)_0%,transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_55%,rgba(59,130,246,0.05)_0%,transparent_45%)] pointer-events-none" />

      {/* 2. Interactive Parallax Celestial Canvas */}
      <div 
        className="absolute inset-[-100px] transition-transform duration-300 ease-out"
        style={{ transform: `translate3d(${pan.x}px, ${pan.y}px, 0)` }}
      >
        {/* Ambient Twinkling Background Stars */}
        {backgroundStars.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full bg-white pointer-events-none animate-pulse"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
              animationDuration: `${star.pulseDuration}s`,
              animationDelay: `${star.delay}s`,
            }}
          />
        ))}

        {/* Constellation Vector Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
          {CONSTELLATION_NODES.map((node) =>
            node.neighbors.map((targetId) => {
              const target = CONSTELLATION_NODES.find((n) => n.id === targetId)
              if (!target || node.id > target.id) return null
              const isConnectedToActive =
                activeGod?.id === node.id || activeGod?.id === target.id
              return (
                <line
                  key={`${node.id}-${target.id}`}
                  x1={`${node.x}%`}
                  y1={`${node.y}%`}
                  x2={`${target.x}%`}
                  y2={`${target.y}%`}
                  stroke={isConnectedToActive ? 'rgba(245,158,11,0.7)' : 'rgba(255,255,255,0.12)'}
                  strokeWidth={isConnectedToActive ? '1.5' : '0.8'}
                  strokeDasharray={isConnectedToActive ? 'none' : '3 3'}
                  className="transition-all duration-500"
                />
              )
            })
          )}
        </svg>

        {/* 18 Interactive Celestial Deities */}
        {CONSTELLATION_NODES.map((node) => {
          const god = EIGHTEEN_GODS.find((g) => g.id === node.id)
          if (!god) return null
          const isSelected = activeGod?.id === god.id

          return (
            <div
              key={god.id}
              onClick={(e) => {
                e.stopPropagation()
                setActiveGod(god)
              }}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group pointer-events-auto z-20"
            >
              {/* Outer Pulsing Star Corona */}
              <div 
                className={`absolute inset-0 -m-3 rounded-full transition-all duration-500 ${
                  isSelected 
                    ? 'bg-amber-400/25 scale-150 shadow-[0_0_24px_rgba(245,158,11,0.8)]' 
                    : 'bg-transparent group-hover:bg-white/15 group-hover:scale-125'
                }`} 
              />

              {/* Core Star Node */}
              <div 
                className={`relative w-3.5 h-3.5 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isSelected
                    ? 'bg-amber-300 shadow-[0_0_15px_#f59e0b] scale-125'
                    : 'bg-white/80 group-hover:bg-amber-200 group-hover:scale-110 shadow-[0_0_8px_rgba(255,255,255,0.6)]'
                }`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>

              {/* Floating Star Label */}
              <div className={`absolute left-5 top-1/2 -translate-y-1/2 whitespace-nowrap transition-all duration-300 pointer-events-none ${
                isSelected 
                  ? 'opacity-100 translate-x-0' 
                  : 'opacity-40 group-hover:opacity-90 translate-x-[-4px] group-hover:translate-x-0'
              }`}>
                <span className={`hud-mono text-[9px] uppercase tracking-wider block ${isSelected ? 'text-amber-300 font-bold' : 'text-cream/70'}`}>
                  {god.deity}
                </span>
                <span className="text-[8px] text-cream/40 font-mono">
                  {god.constellation}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* 3. Mountain Ridge Silhouette (Naggar & Pir Panjal Crest) */}
      <div className="absolute bottom-0 inset-x-0 h-44 pointer-events-none z-10">
        <svg 
          viewBox="0 0 1440 220" 
          preserveAspectRatio="none" 
          className="w-full h-full text-[#020406] fill-current opacity-95 drop-shadow-[0_-10px_30px_rgba(0,0,0,0.8)]"
        >
          {/* Back Faint Peak Ridge */}
          <path 
            d="M0,120 L180,75 L340,110 L520,45 L690,95 L840,30 L1020,85 L1200,50 L1360,95 L1440,80 L1440,220 L0,220 Z" 
            fill="rgba(5,9,14,0.7)" 
          />
          {/* Foreground Deep Silhouette Ridge */}
          <path 
            d="M0,165 L140,125 L280,145 L430,95 L610,130 L760,85 L910,120 L1090,80 L1240,115 L1380,95 L1440,105 L1440,220 L0,220 Z" 
          />
        </svg>
        {/* Soft mountain valley mist */}
        <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-[#03060a] to-transparent opacity-90" />
      </div>

      {/* 4. Editorial Poetic Header (Human over Instrument) */}
      <div className="absolute top-6 md:top-8 left-6 md:left-10 z-30 max-w-lg pointer-events-none">
        <p className="hud-mono text-[10px] md:text-xs text-amber-400/90 tracking-[0.25em] uppercase flex items-center gap-2 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
          Celestial Observation · 2,180m Elevation
        </p>
        <h2 className="font-display text-2xl sm:text-4xl md:text-5xl font-normal text-cream leading-[1.08] tracking-tight drop-shadow-md">
          18 GODS<br />
          <span className="italic font-serif text-amber-200/90 font-light">Above The Ridge</span>
        </h2>
        <p className="text-cream/80 text-xs sm:text-sm font-body mt-2.5 leading-relaxed max-w-sm drop-shadow">
          On clear nights, the gods of the valley share the sky with you.
        </p>
      </div>

      {/* 5. Interaction Hint Bar */}
      <div className="absolute top-6 md:top-8 right-6 md:right-10 z-30 pointer-events-none">
        <div className="px-3.5 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center gap-2 shadow-lg">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="hud-mono text-[9px] md:text-[10px] text-cream/70 uppercase tracking-widest">
            Move cursor / Drag sky
          </span>
        </div>
      </div>

      {/* 6. The Floating Jewel Card (When a Deity is Active) */}
      {activeGod && (
        <div className="absolute bottom-6 md:bottom-8 right-6 md:right-10 z-30 w-[calc(100%-48px)] sm:w-[320px] pointer-events-auto">
          <div className="p-5 rounded-2xl bg-black/75 backdrop-blur-xl border border-amber-400/30 shadow-[0_15px_40px_rgba(0,0,0,0.8)] transition-all duration-300 animate-in fade-in slide-in-from-bottom-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-3">
              <span className="hud-mono text-[9.5px] text-amber-400 uppercase tracking-wider font-semibold">
                #{activeGod.id.toString().padStart(2, '0')} · {activeGod.designation}
              </span>
              <span className="hud-mono text-[9px] text-cream/50 uppercase">
                {activeGod.constellation}
              </span>
            </div>

            <h3 className="font-display text-xl sm:text-2xl font-medium text-cream tracking-tight">
              {activeGod.deity}
            </h3>

            <p className="text-amber-200/80 font-serif italic text-xs mt-0.5">
              {activeGod.deityRole}
            </p>

            <div className="mt-3.5 grid grid-cols-2 gap-2 bg-white/[0.04] p-2.5 rounded-xl border border-white/5">
              <div>
                <span className="hud-mono text-[8px] uppercase tracking-wider text-cream/40 block">Viewing Hour</span>
                <span className="font-mono text-xs text-amber-300 font-semibold">{activeGod.riseTimeLocal}</span>
              </div>
              <div>
                <span className="hud-mono text-[8px] uppercase tracking-wider text-cream/40 block">Apparent Mag</span>
                <span className="font-mono text-xs text-cream/90 font-semibold">{activeGod.magnitude}</span>
              </div>
            </div>

            <p className="text-cream/75 text-xs font-body mt-3 line-clamp-2 leading-relaxed">
              {activeGod.lore}
            </p>

            <button
              onClick={() => onSelectGod(activeGod)}
              className="mt-4 w-full py-2.5 px-4 rounded-xl bg-amber-500/20 hover:bg-amber-400 text-amber-300 hover:text-black hud-mono text-[10px] uppercase font-bold tracking-widest border border-amber-400/40 hover:border-amber-400 transition-all duration-300 flex items-center justify-center gap-2 group"
            >
              <span>Folklore & Alignment</span>
              <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
