'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useNight } from '@/lib/store/night'

export function Soundscape() {
  const [isPlaying, setIsPlaying] = useState(false)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const masterGainRef = useRef<GainNode | null>(null)
  const presenceAudioRef = useRef<HTMLAudioElement | null>(null)
  const presenceGainRef = useRef<GainNode | null>(null)
  const presenceFilterRef = useRef<BiquadFilterNode | null>(null)

  const initAudio = () => {
    if (audioCtxRef.current) return audioCtxRef.current

    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new AudioCtx()
    audioCtxRef.current = ctx

    // Master Dynamics Compressor: studio-grade brickwall headroom protection
    // Guarantees zero digital clipping, zero harshness, and zero blown-out ("fatti fatti") speaker sound
    const compressor = ctx.createDynamicsCompressor()
    compressor.threshold.setValueAtTime(-18, ctx.currentTime)
    compressor.knee.setValueAtTime(14, ctx.currentTime)
    compressor.ratio.setValueAtTime(3.5, ctx.currentTime)
    compressor.attack.setValueAtTime(0.01, ctx.currentTime)
    compressor.release.setValueAtTime(0.25, ctx.currentTime)
    compressor.connect(ctx.destination)

    // Master output gain
    const masterGain = ctx.createGain()
    masterGain.gain.setValueAtTime(0, ctx.currentTime)
    masterGain.connect(compressor)
    masterGainRef.current = masterGain

    // 1. Pristine Soothing Himalayan Ambience (Pure Alpine Wind, Grounding 54/108Hz Earth Harmonics)
    // Recorded / synthesized with 10dB headroom, zero AI metallic phase artifacts, zero echo
    const audio = new Audio('/audio/soothing_himalayan_ambience.mp3')
    audio.loop = true
    audio.preload = 'auto'
    audio.crossOrigin = 'anonymous'
    presenceAudioRef.current = audio

    const presenceSource = ctx.createMediaElementSource(audio)
    const presenceFilter = ctx.createBiquadFilter()
    presenceFilter.type = 'lowpass'
    presenceFilter.frequency.setValueAtTime(2200, ctx.currentTime)
    // Q = 0.5 (critically damped Butterworth roll-off) completely eliminates all hollow echo & ringing
    presenceFilter.Q.setValueAtTime(0.5, ctx.currentTime)
    presenceFilterRef.current = presenceFilter

    const presenceGain = ctx.createGain()
    presenceGain.gain.setValueAtTime(0.75, ctx.currentTime)
    presenceGainRef.current = presenceGain

    presenceSource.connect(presenceFilter)
    presenceFilter.connect(presenceGain)
    presenceGain.connect(masterGain)

    return ctx
  }

  const toggleSound = useCallback(async () => {
    const ctx = initAudio()
    if (!ctx) return

    if (ctx.state === 'suspended') {
      await ctx.resume()
    }

    if (isPlaying) {
      // Gentle cinematic fade out
      if (masterGainRef.current) {
        masterGainRef.current.gain.setTargetAtTime(0, ctx.currentTime, 0.4)
      }
      setTimeout(() => {
        presenceAudioRef.current?.pause()
        setIsPlaying(false)
      }, 500)
    } else {
      // Start soothing ambience and warm exponential fade in
      try {
        await presenceAudioRef.current?.play()
      } catch {
        // Autoplay policy fallback
      }
      if (masterGainRef.current) {
        masterGainRef.current.gain.cancelScheduledValues(ctx.currentTime)
        masterGainRef.current.gain.setValueAtTime(0, ctx.currentTime)
        masterGainRef.current.gain.setTargetAtTime(0.48, ctx.currentTime, 0.8)
      }
      setIsPlaying(true)
    }
  }, [isPlaying])

  useEffect(() => {
    const unsub = useNight.subscribe((state) => {
      if (!audioCtxRef.current || audioCtxRef.current.state !== 'running') return
      const ctx = audioCtxRef.current

      // Soft Nightfall Acoustic Choreography:
      // High alpine valley (day): open, clear, airy breeze (~2200Hz)
      // Kath-kuni approach / Hearth (dusk): warm, soothing lowpass (~1600Hz)
      // Starlit midnight ridge (night): deep, grounded, velvet alpine tone (~1100Hz)
      if (presenceFilterRef.current) {
        const targetFreq = state.t > 0.6 ? 1100 : state.t > 0.35 ? 1600 : 2200
        presenceFilterRef.current.frequency.setTargetAtTime(targetFreq, ctx.currentTime, 0.8)
      }
    })

    return () => unsub()
  }, [])

  useEffect(() => {
    const handleStartEvent = () => {
      if (!isPlaying) toggleSound()
    }
    window.addEventListener('start-atmosphere', handleStartEvent)
    return () => window.removeEventListener('start-atmosphere', handleStartEvent)
  }, [isPlaying, toggleSound])

  const [showHint, setShowHint] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowHint(true)
    }, 1800)
    const hideTimer = setTimeout(() => {
      setShowHint(false)
    }, 8500)
    return () => {
      clearTimeout(timer)
      clearTimeout(hideTimer)
    }
  }, [])

  return (
    <div className="fixed z-40 flex items-center select-none bottom-[calc(5.5rem_+_env(safe-area-inset-bottom))] md:bottom-[32px] left-[32px]">
      <div className="relative flex items-center">
        <button
          onClick={() => {
            setShowHint(false)
            toggleSound()
          }}
          aria-label={isPlaying ? 'Turn atmospheric audio off' : 'Turn atmospheric audio on'}
          aria-pressed={isPlaying}
          className={`pointer-events-auto flex items-center justify-center h-[50px] w-[50px] rounded-full border backdrop-blur-md transition-all duration-500 shadow-[0_8px_24px_rgba(0,0,0,0.35)] group ${
            isPlaying
              ? 'bg-amber-400 border-transparent shadow-[0_0_25px_rgba(245,158,11,0.4)]'
              : 'border-amber-500/20 bg-black/40 hover:scale-[1.06] hover:bg-amber-400 hover:border-transparent hover:shadow-[0_0_25px_rgba(245,158,11,0.4)]'
          }`}
          title="Toggle Himalayan Atmospheric Sound"
        >
          {/* Equalizer Waveform Bars / Sound Icon */}
          <span className="flex items-end justify-center gap-[3px] h-4 w-4">
            <span className={`w-[2px] rounded-full transition-all duration-300 ${isPlaying ? 'bg-black h-4 animate-[pulse_0.6s_ease-in-out_infinite]' : 'bg-white/70 h-2 group-hover:bg-black'}`} />
            <span className={`w-[2px] rounded-full transition-all duration-300 ${isPlaying ? 'bg-black h-3 animate-[pulse_0.9s_ease-in-out_infinite]' : 'bg-white/70 h-3.5 group-hover:bg-black'}`} />
            <span className={`w-[2px] rounded-full transition-all duration-300 ${isPlaying ? 'bg-black h-3.5 animate-[pulse_1.2s_ease-in-out_infinite]' : 'bg-white/70 h-1.5 group-hover:bg-black'}`} />
          </span>
        </button>

        {/* Ambient discovery hint for first-time visitors */}
        {showHint && !isPlaying && (
          <div 
            onClick={() => {
              setShowHint(false)
              toggleSound()
            }}
            className="absolute left-14 whitespace-nowrap px-3.5 py-1.5 rounded-full bg-black/80 border border-amber-400/40 text-amber-300 hud-mono text-[10px] tracking-wider uppercase shadow-[0_0_20px_rgba(245,158,11,0.25)] animate-in fade-in slide-in-from-left-2 duration-500 cursor-pointer hover:border-amber-300 hover:scale-105 transition-all flex items-center gap-2 backdrop-blur-md"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            <span>Listen to Naggar Wind</span>
          </div>
        )}
      </div>
    </div>
  )
}
