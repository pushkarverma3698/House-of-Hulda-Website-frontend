'use client'

import { useEffect, useRef, useState } from 'react'
import { useNight } from '@/lib/store/night'

export function Soundscape() {
  const [isPlaying, setIsPlaying] = useState(false)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)
  const hearthGainRef = useRef<GainNode | null>(null)
  const windFilterRef = useRef<BiquadFilterNode | null>(null)

  const toggleSound = async () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      const ctx = new AudioCtx()
      audioCtxRef.current = ctx

      // Master output gain
      const masterGain = ctx.createGain()
      masterGain.gain.setValueAtTime(0.35, ctx.currentTime)
      masterGain.connect(ctx.destination)
      gainNodeRef.current = masterGain

      // 1. Mountain Wind (Filtered Pink Noise with LFO)
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
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.05
        b6 = white * 0.115926
      }

      const whiteNoise = ctx.createBufferSource()
      whiteNoise.buffer = noiseBuffer
      whiteNoise.loop = true

      const filter = ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(320, ctx.currentTime)
      filter.Q.setValueAtTime(1.5, ctx.currentTime)
      windFilterRef.current = filter

      // Wind LFO
      const lfo = ctx.createOscillator()
      lfo.frequency.setValueAtTime(0.15, ctx.currentTime) // 0.15 Hz slow breathing wind
      const lfoGain = ctx.createGain()
      lfoGain.gain.setValueAtTime(180, ctx.currentTime)
      lfo.connect(lfoGain)
      lfoGain.connect(filter.frequency)

      whiteNoise.connect(filter)
      filter.connect(masterGain)
      whiteNoise.start()
      lfo.start()

      // 2. Hearth Crackle (Procedural wood fire impulse spikes)
      const hearthGain = ctx.createGain()
      hearthGain.gain.setValueAtTime(0.12, ctx.currentTime)
      hearthGain.connect(masterGain)
      hearthGainRef.current = hearthGain

      const crackleBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate)
      const crackleData = crackleBuffer.getChannelData(0)
      for (let i = 0; i < crackleBuffer.length; i++) {
        if (Math.random() < 0.0015) {
          crackleData[i] = (Math.random() * 2 - 1) * 0.8
        } else {
          crackleData[i] = 0
        }
      }
      const crackleSource = ctx.createBufferSource()
      crackleSource.buffer = crackleBuffer
      crackleSource.loop = true
      crackleSource.connect(hearthGain)
      crackleSource.start()
    }

    if (audioCtxRef.current.state === 'suspended') {
      await audioCtxRef.current.resume()
      setIsPlaying(true)
    } else if (audioCtxRef.current.state === 'running') {
      await audioCtxRef.current.suspend()
      setIsPlaying(false)
    } else {
      setIsPlaying(true)
    }
  }

  useEffect(() => {
    const unsub = useNight.subscribe((state) => {
      if (!audioCtxRef.current || audioCtxRef.current.state !== 'running') return
      const ctx = audioCtxRef.current

      // As user descends into the house and night falls:
      // Hearth crackle becomes louder and wind filter softens
      if (hearthGainRef.current) {
        const targetHearth = state.t > 0.45 ? 0.28 : 0.05
        hearthGainRef.current.gain.setTargetAtTime(targetHearth, ctx.currentTime, 0.5)
      }
      if (windFilterRef.current) {
        const targetFreq = state.t > 0.60 ? 240 : 450
        windFilterRef.current.frequency.setTargetAtTime(targetFreq, ctx.currentTime, 0.8)
      }
    })

    return () => unsub()
  }, [])

  return (
    <div className="fixed bottom-6 left-6 z-30 flex items-center gap-3 select-none">
      <button
        onClick={toggleSound}
        className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/15 bg-black/60 backdrop-blur-xl text-white font-mono text-[10px] hover:border-amber-400 hover:bg-black/80 transition-all duration-300 shadow-xl group"
        title="Toggle Himalayan Atmospheric Audio"
      >
        <span className="flex items-end gap-[2px] h-3 w-3">
          <span className={`w-[2px] bg-amber-400 rounded-full transition-all duration-300 ${isPlaying ? 'h-3 animate-pulse' : 'h-1 opacity-40'}`} />
          <span className={`w-[2px] bg-amber-400 rounded-full transition-all duration-300 ${isPlaying ? 'h-2 animate-[pulse_0.8s_ease-in-out_infinite]' : 'h-1.5 opacity-40'}`} />
          <span className={`w-[2px] bg-amber-400 rounded-full transition-all duration-300 ${isPlaying ? 'h-2.5 animate-[pulse_1.2s_ease-in-out_infinite]' : 'h-1 opacity-40'}`} />
        </span>
        <span className="text-neutral-300 group-hover:text-white transition-colors tracking-widest uppercase">
          {isPlaying ? 'ATMOSPHERE ON' : 'SPATIAL AUDIO'}
        </span>
      </button>
    </div>
  )
}
