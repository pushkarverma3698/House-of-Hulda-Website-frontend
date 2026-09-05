'use client'

import { useEffect, useRef, useState } from 'react'
import { useNight } from '@/lib/store/night'

export function Soundscape() {
  const [isPlaying, setIsPlaying] = useState(false)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const masterGainRef = useRef<GainNode | null>(null)
  const presenceAudioRef = useRef<HTMLAudioElement | null>(null)
  const presenceGainRef = useRef<GainNode | null>(null)
  const presenceFilterRef = useRef<BiquadFilterNode | null>(null)
  const hearthGainRef = useRef<GainNode | null>(null)
  const windFilterRef = useRef<BiquadFilterNode | null>(null)

  const initAudio = () => {
    if (audioCtxRef.current) return audioCtxRef.current

    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new AudioCtx()
    audioCtxRef.current = ctx

    // Master output gain
    const masterGain = ctx.createGain()
    masterGain.gain.setValueAtTime(0, ctx.currentTime)
    masterGain.connect(ctx.destination)
    masterGainRef.current = masterGain

    // 1. Original Veo Himalayan Presence (Cleaned & Looped Ambient Sound)
    const audio = new Audio('/audio/ambient_presence.mp3')
    audio.loop = true
    audio.preload = 'auto'
    audio.crossOrigin = 'anonymous'
    presenceAudioRef.current = audio

    const presenceSource = ctx.createMediaElementSource(audio)
    const presenceFilter = ctx.createBiquadFilter()
    presenceFilter.type = 'lowpass'
    presenceFilter.frequency.setValueAtTime(4500, ctx.currentTime)
    presenceFilter.Q.setValueAtTime(0.7, ctx.currentTime)
    presenceFilterRef.current = presenceFilter

    const presenceGain = ctx.createGain()
    presenceGain.gain.setValueAtTime(0.55, ctx.currentTime)
    presenceGainRef.current = presenceGain

    presenceSource.connect(presenceFilter)
    presenceFilter.connect(presenceGain)
    presenceGain.connect(masterGain)

    // 2. Procedural Mountain Wind (Soft breathing pink noise)
    const bufferSize = ctx.sampleRate * 2
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const output = noiseBuffer.getChannelData(0)
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1
      b0 = 0.99886 * b0 + white * 0.0555179
      b1 = 0.99332 * b1 + white * 0.0750759
      b2 = 0.96900 * b2 + white * 0.1538520
      b3 = 0.86650 * b3 + white * 0.3104856
      b4 = 0.55000 * b4 + white * 0.5329522
      b5 = -0.7616 * b5 - white * 0.0168980
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.03
      b6 = white * 0.115926
    }

    const whiteNoise = ctx.createBufferSource()
    whiteNoise.buffer = noiseBuffer
    whiteNoise.loop = true

    const windFilter = ctx.createBiquadFilter()
    windFilter.type = 'lowpass'
    windFilter.frequency.setValueAtTime(260, ctx.currentTime)
    windFilter.Q.setValueAtTime(1.2, ctx.currentTime)
    windFilterRef.current = windFilter

    const windGain = ctx.createGain()
    windGain.gain.setValueAtTime(0.25, ctx.currentTime)

    whiteNoise.connect(windFilter)
    windFilter.connect(windGain)
    windGain.connect(masterGain)
    whiteNoise.start()

    // 3. Procedural Hearth Crackle
    const hearthGain = ctx.createGain()
    hearthGain.gain.setValueAtTime(0.08, ctx.currentTime)
    hearthGainRef.current = hearthGain

    const crackleBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate)
    const crackleData = crackleBuffer.getChannelData(0)
    for (let i = 0; i < crackleBuffer.length; i++) {
      crackleData[i] = Math.random() < 0.0012 ? (Math.random() * 2 - 1) * 0.6 : 0
    }
    const crackleSource = ctx.createBufferSource()
    crackleSource.buffer = crackleBuffer
    crackleSource.loop = true
    crackleSource.connect(hearthGain)
    hearthGain.connect(masterGain)
    crackleSource.start()

    return ctx
  }

  const toggleSound = async () => {
    const ctx = initAudio()
    if (!ctx) return

    if (ctx.state === 'suspended') {
      await ctx.resume()
    }

    if (isPlaying) {
      // Fade out
      if (masterGainRef.current) {
        masterGainRef.current.gain.setTargetAtTime(0, ctx.currentTime, 0.4)
      }
      setTimeout(() => {
        presenceAudioRef.current?.pause()
        setIsPlaying(false)
      }, 500)
    } else {
      // Start presence audio and fade in
      try {
        await presenceAudioRef.current?.play()
      } catch {
        // Autoplay policy fallback
      }
      if (masterGainRef.current) {
        masterGainRef.current.gain.cancelScheduledValues(ctx.currentTime)
        masterGainRef.current.gain.setValueAtTime(0, ctx.currentTime)
        masterGainRef.current.gain.setTargetAtTime(0.38, ctx.currentTime, 0.6)
      }
      setIsPlaying(true)
    }
  }

  useEffect(() => {
    const unsub = useNight.subscribe((state) => {
      if (!audioCtxRef.current || audioCtxRef.current.state !== 'running') return
      const ctx = audioCtxRef.current

      // Night / Altitude Sound Choreography:
      // In the valley/approach: airy open presence
      // At the hearth (t ~ 0.5): hearth crackle blooms, presence warms up
      // At midnight sky (t > 0.7): celestial lowpass resonance
      if (presenceFilterRef.current) {
        const targetFreq = state.t > 0.6 ? 1800 : state.t > 0.35 ? 2600 : 4500
        presenceFilterRef.current.frequency.setTargetAtTime(targetFreq, ctx.currentTime, 0.8)
      }
      if (hearthGainRef.current) {
        const targetHearth = state.t > 0.35 && state.t < 0.75 ? 0.32 : 0.06
        hearthGainRef.current.gain.setTargetAtTime(targetHearth, ctx.currentTime, 0.6)
      }
      if (windFilterRef.current) {
        const targetWind = state.t > 0.6 ? 340 : 220
        windFilterRef.current.frequency.setTargetAtTime(targetWind, ctx.currentTime, 0.8)
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
  }, [isPlaying])

  return (
    <div className="fixed z-40 flex items-center select-none bottom-[calc(5.5rem_+_env(safe-area-inset-bottom))] md:bottom-[32px] left-[32px]">
      <button
        onClick={toggleSound}
        aria-label={isPlaying ? 'Turn atmospheric audio off' : 'Turn atmospheric audio on'}
        aria-pressed={isPlaying}
        className={`pointer-events-auto flex items-center justify-center h-[50px] w-[50px] rounded-full border backdrop-blur-md transition-all duration-500 shadow-[0_8px_24px_rgba(0,0,0,0.35)] group ${
          isPlaying
            ? 'bg-amber-400 border-transparent shadow-[0_0_25px_rgba(245,158,11,0.4)]'
            : 'border-white/10 bg-black/20 hover:scale-[1.06] hover:bg-amber-400 hover:border-transparent'
        }`}
        title="Toggle Himalayan Atmospheric Sound"
      >
        {/* Equalizer Waveform Bars / Sound Icon */}
        <span className="flex items-end justify-center gap-[3px] h-4 w-4">
          <span className={`w-[2px] rounded-full transition-all duration-300 ${isPlaying ? 'bg-black h-4 animate-[pulse_0.6s_ease-in-out_infinite]' : 'bg-white/60 h-2 group-hover:bg-white'}`} />
          <span className={`w-[2px] rounded-full transition-all duration-300 ${isPlaying ? 'bg-black h-3 animate-[pulse_0.9s_ease-in-out_infinite]' : 'bg-white/60 h-3.5 group-hover:bg-white'}`} />
          <span className={`w-[2px] rounded-full transition-all duration-300 ${isPlaying ? 'bg-black h-3.5 animate-[pulse_1.2s_ease-in-out_infinite]' : 'bg-white/60 h-1.5 group-hover:bg-white'}`} />
        </span>
      </button>
    </div>
  )
}
