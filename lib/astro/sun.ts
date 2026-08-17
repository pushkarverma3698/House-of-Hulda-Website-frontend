import * as SunCalc from 'suncalc'

// Rumsu, Naggar — the exact coordinates from the spec
const LAT = 32.1198
const LNG = 77.1731

/**
 * Computes exact Date from normalized scroll progress t (0→1)
 * Piecewise time curve:
 * t 0.00 → 0.33 maps 15:40 → 17:50 (130 min)
 * t 0.33 → 0.66 maps 17:50 → 19:45 (115 min)
 * t 0.66 → 1.00 maps 19:45 → 06:05 (620 min, next day)
 */
/** Naggar is UTC+05:30 year-round — India observes no daylight saving, so a
 *  fixed offset is exact here rather than an approximation. */
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000

export function getDateAtT(t: number): Date {
  // The film opens at 15:40 *at the house*, not at 15:40 wherever the viewer
  // happens to be sitting. `new Date(y, m, d, 15, 40)` builds a local timestamp
  // in the viewer's zone, and SunCalc then computes the sun over Naggar for that
  // absolute instant — so the sun's position used to depend on the visitor's
  // timezone. Measured across the scroll: correct in IST, but a London visitor
  // opened the film at −13° with the star field at full opacity over sunlit
  // footage, and a New York visitor got the day/night arc inverted. At the
  // closing frame the sun read +58°, which drove the sky shader to its
  // clear-day blue and turned the final call to action into a flat blue screen.
  //
  // Building the instant from UTC and applying Naggar's own offset makes the
  // timeline mean the same thing for every visitor on earth.
  const now = new Date()
  const start = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 15, 40, 0) - IST_OFFSET_MS
  )
  const clampedT = Math.max(0, Math.min(1, t))

  let offsetMinutes = 0
  if (clampedT <= 0.33) {
    offsetMinutes = (clampedT / 0.33) * 130
  } else if (clampedT <= 0.66) {
    offsetMinutes = 130 + ((clampedT - 0.33) / 0.33) * 115
  } else {
    offsetMinutes = 245 + ((clampedT - 0.66) / 0.34) * 620
  }

  return new Date(start.getTime() + offsetMinutes * 60 * 1000)
}

/**
 * The scene clock as HH:MM at the house.
 *
 * getDateAtT returns a correct absolute instant, but reading it back with
 * getHours() renders it in the viewer's zone — which would print 10:10 for the
 * moment the film calls 15:40. The story labels are hard-coded to Naggar time
 * ("L-01 · 15:40"), so the readout has to be too, or the HUD contradicts the
 * copy sitting next to it.
 */
export function formatSceneTime(date: Date): string {
  const ist = new Date(date.getTime() + IST_OFFSET_MS)
  return `${ist.getUTCHours().toString().padStart(2, '0')}:${ist
    .getUTCMinutes()
    .toString()
    .padStart(2, '0')}`
}

export interface SolarState {
  readonly altitude: number
  readonly azimuth: number
  readonly date: Date
  readonly isDaylight: boolean
  readonly isCivilTwilight: boolean
  readonly isNauticalTwilight: boolean
  readonly isAstroDark: boolean
}

// Single-entry memo keyed on t. Every consumer in a given frame (the scroll
// sampler, EphemerisLight x2, SkyBox, StarField, PostProcessing) passes the same
// t, so without this the render loop allocates 18 Date objects and runs SunCalc
// six times per frame — pure GC pressure on mobile.
let cachedT = Number.NaN
let cachedState: SolarState | null = null
const SOLAR_MEMO_EPSILON = 1e-4

/**
 * Given a normalized scroll progress t (0→1),
 * returns the exact solar state at Rumsu for that moment.
 *
 * The returned object is shared and must be treated as read-only.
 */
export function getSolarState(t: number): SolarState {
  if (cachedState !== null && Math.abs(t - cachedT) < SOLAR_MEMO_EPSILON) {
    return cachedState
  }

  const dateAtT = getDateAtT(t)
  const sunPos = SunCalc.getPosition(dateAtT, LAT, LNG)

  const altDeg = sunPos.altitude
  const azDeg = (sunPos.azimuth + 360) % 360

  cachedT = t
  cachedState = {
    altitude: altDeg,
    azimuth: azDeg,
    date: dateAtT,
    isDaylight:           altDeg > 0,
    isCivilTwilight:      altDeg <= 0  && altDeg > -6,
    isNauticalTwilight:   altDeg <= -6 && altDeg > -12,
    isAstroDark:          altDeg <= -12,
  }

  return cachedState
}



/**
 * Returns the sun direction as a normalized [x, y, z] vector
 * suitable for a Three.js DirectionalLight.
 */
export function getSunDirection(t: number): [number, number, number] {
  const { altitude, azimuth } = getSolarState(t)
  const altRad = (altitude * Math.PI) / 180
  const azRad = (azimuth * Math.PI) / 180

  // Convert spherical to Cartesian (Y-up in Three.js)
  const x = Math.cos(altRad) * Math.sin(azRad)
  const y = Math.sin(altRad)
  const z = Math.cos(altRad) * Math.cos(azRad)

  return [x, Math.max(y, 0.01), z] // clamp y to avoid underground sun
}

/**
 * Returns the sun color temperature based on altitude.
 * Low sun = warm amber. High sun = neutral. Below horizon = disabled.
 */
export function getSunColor(altDeg: number): string {
  if (altDeg <= 0) return '#000000' // below horizon — no sun
  if (altDeg < 5) return '#FF6B2B'  // deep sunset amber
  if (altDeg < 10) return '#FF9A4D' // golden hour
  if (altDeg < 20) return '#FFBB73' // warm afternoon
  return '#FFF4E0'                   // neutral daylight
}

/**
 * Returns the sun intensity based on altitude.
 * Ramps down as sun approaches horizon.
 */
export function getSunIntensity(altDeg: number): number {
  if (altDeg <= 0) return 0
  if (altDeg < 10) return altDeg / 10 * 1.2 // gentle ramp
  return 1.2
}

/**
 * The Warm Practical — the single point light from the house.
 * Below civil twilight (-4°), this becomes the primary light source.
 * It carries the emotional weight of the entire night sequence.
 */
export function getPracticalIntensity(altDeg: number): number {
  if (altDeg > 2) return 0.1   // barely visible in daylight
  if (altDeg > -4) return 0.1 + (2 - altDeg) / 6 * 0.9 // ramp up
  return 1.0                     // full intensity in the dark
}

/**
 * Sky zenith and horizon colors based on solar altitude.
 * Returns [zenithHex, horizonHex] for a gradient sky shader.
 */
export function getSkyColors(altDeg: number): [string, string] {
  if (altDeg > 10) return ['#1A5FB4', '#87CEEB']       // clear day
  if (altDeg > 2)  return ['#1A3A6B', '#E8956F']        // golden hour
  if (altDeg > 0)  return ['#0F2347', '#D4654A']        // sunset
  if (altDeg > -6) return ['#0A1628', '#5C3A2E']        // civil twilight
  if (altDeg > -12) return ['#060E1A', '#1A1420']       // nautical twilight
  return ['#020408', '#0A0810']                          // astronomical dark
}

/**
 * Bloom threshold — the primary aesthetic driver.
 * In daylight, only extreme highlights bloom (clean documentary).
 * In deep night, everything glows (stars, warm light, embers).
 */
export function getBloomThreshold(altDeg: number): number {
  if (altDeg > 10) return 0.92
  if (altDeg > 0) return 0.92 - ((10 - altDeg) / 10) * 0.3
  if (altDeg > -12) return 0.62 - ((0 - altDeg) / 12) * 0.42
  return 0.10 // deep night — everything glows
}
