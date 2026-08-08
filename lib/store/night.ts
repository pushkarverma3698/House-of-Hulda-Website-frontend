import { create } from 'zustand'

export type LogId = 'L-01' | 'L-02' | 'L-03' | 'L-04' | 'L-05' | 'L-06' | 'L-07' | 'L-08' | 'L-09'

export interface ActDefinition {
  id: LogId
  tStart: number
  tEnd: number
  clock: string
  act: 'I' | 'II' | 'III'
  title: string
  subtitle?: string
}

/**
 * CANONICAL ACT TABLE (Phase 1 contract)
 * Single source of truth for the narrative timeline.
 */
export const ACTS: readonly ActDefinition[] = [
  { id: 'L-01', tStart: 0.00, tEnd: 0.11, clock: '15:40', act: 'I', title: 'The road stops at Rumsu' },
  { id: 'L-02', tStart: 0.11, tEnd: 0.22, clock: '16:23', act: 'I', title: 'The water' },
  { id: 'L-03', tStart: 0.22, tEnd: 0.33, clock: '17:07', act: 'I', title: 'Deodar and stone' },
  { id: 'L-04', tStart: 0.33, tEnd: 0.44, clock: '17:50', act: 'II', title: 'The orchard turns' },
  { id: 'L-05', tStart: 0.44, tEnd: 0.55, clock: '18:29', act: 'II', title: 'The loft' },
  { id: 'L-06', tStart: 0.55, tEnd: 0.66, clock: '19:07', act: 'II', title: 'The hearth' },
  { id: 'L-07', tStart: 0.66, tEnd: 0.77, clock: '19:45', act: 'III', title: 'The eighteen' },
  { id: 'L-08', tStart: 0.77, tEnd: 0.88, clock: '23:06', act: 'III', title: 'The Eye' },
  { id: 'L-09', tStart: 0.88, tEnd: 1.00, clock: '02:27', act: 'III', title: 'Dawn' },
]

export const actFor = (t: number): LogId => {
  const clampedT = Math.max(0, Math.min(0.9999, t))
  const found = ACTS.find((a) => clampedT >= a.tStart && clampedT < a.tEnd)
  return found ? found.id : 'L-09'
}

export interface NightState {
  t: number              // 0..1 — the whole film progress
  act: LogId             // 'L-01' .. 'L-09'
  sunAlt: number         // degrees
  nightBlend: number     // 0..1
  selectedStar: number | null
  tier: 'high' | 'mid' | 'low'
  reducedMotion: boolean
}

export const useNight = create<NightState>(() => ({
  t: 0,
  act: 'L-01',
  sunAlt: 32,
  nightBlend: 0,
  selectedStar: null,
  tier: 'high',
  reducedMotion: false,
}))
