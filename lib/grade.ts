/**
 * The global color-grade engine.
 *
 * The entire page is graded like one continuous shot: a single normalized
 * scroll progress (0→1) drives the sky gradient, star opacity, and the
 * Arrival time-of-day sky. Ported faithfully from the locked design prototype
 * (story bible §4 "Color & light system" — five named palette stops).
 */

export type RGB = [number, number, number];

export interface GradeStop {
  /** scroll progress at which this stop is fully expressed */
  p: number;
  top: RGB;
  mid: RGB;
  bot: RGB;
}

/** Five named palette stops: valley-dawn → golden-arrival → firelight → starfield → lamplit-night. */
export const GRADE_STOPS: GradeStop[] = [
  { p: 0.0, top: [20, 30, 45], mid: [54, 72, 92], bot: [183, 196, 205] }, // valley dawn
  { p: 0.3, top: [104, 66, 33], mid: [201, 138, 63], bot: [245, 227, 189] }, // golden arrival
  { p: 0.58, top: [26, 14, 9], mid: [92, 42, 23], bot: [150, 72, 40] }, // firelight
  { p: 0.8, top: [5, 6, 16], mid: [12, 18, 42], bot: [26, 32, 64] }, // starfield
  // lamplit night — the story settles into a warm, low-key dark so the closing
  // footer reads premium with cream type (replaces the old washed soft-dawn pink).
  { p: 1.0, top: [10, 12, 20], mid: [26, 22, 26], bot: [54, 40, 34] },
];

export const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
export const mix = (a: number, b: number, t: number): number => a + (b - a) * t;

const rgb = (a: RGB, b: RGB, t: number, k: 0 | 1 | 2): number =>
  Math.round(mix(a[k], b[k], t));

export interface GradeColors {
  top: string;
  mid: string;
  bot: string;
}

/** Interpolated sky gradient colors at a given scroll progress. */
export function gradeAt(p: number): GradeColors {
  const s = GRADE_STOPS;
  let i = 0;
  while (i < s.length - 2 && p > s[i + 1].p) i++;
  const a = s[i];
  const b = s[i + 1];
  const t = clamp01((p - a.p) / (b.p - a.p || 1));
  const toCss = (key: "top" | "mid" | "bot") =>
    `rgb(${rgb(a[key], b[key], t, 0)},${rgb(a[key], b[key], t, 1)},${rgb(a[key], b[key], t, 2)})`;
  return { top: toCss("top"), mid: toCss("mid"), bot: toCss("bot") };
}

/** Star layer fades in through Wonder, peaks, then fades into the dawn coda. */
export function starOpacity(p: number): number {
  if (p < 0.5) return 0;
  if (p < 0.82) return clamp01((p - 0.5) / 0.32);
  if (p < 0.92) return 1;
  // The coda is now a lamplit night, so the stars linger softly instead of
  // washing out into dawn.
  return 1 - clamp01((p - 0.92) / 0.08) * 0.45;
}

/** Arrival time-of-day sky: t=0 sunrise → t=1 starlight. */
export function todSky(t: number): string {
  const lp = (a: number, b: number) => Math.round(a + (b - a) * t);
  const c = (a: RGB, b: RGB) => `rgb(${lp(a[0], b[0])},${lp(a[1], b[1])},${lp(a[2], b[2])})`;
  const glow = c([255, 196, 120], [150, 170, 222]);
  const sky1 = c([150, 100, 76], [10, 12, 30]);
  const sky2 = c([64, 46, 58], [3, 4, 12]);
  const gx = lp(50, 72);
  const gy = lp(80, 24);
  return `radial-gradient(120% 92% at ${gx}% ${gy}%, ${glow}, rgba(0,0,0,0) 56%), linear-gradient(180deg, ${sky2}, ${sky1})`;
}

export const TOD_LABELS: { t: number; label: string }[] = [
  { t: 0.0, label: "First light" },
  { t: 0.35, label: "Golden hour" },
  { t: 0.7, label: "Blue dusk" },
  { t: 1.0, label: "Under the stars" },
];

export function todLabel(t: number): string {
  let best = TOD_LABELS[0];
  for (const item of TOD_LABELS) if (t >= item.t) best = item;
  return best.label;
}

/** Altitude mapped to the ascent range (1,420m valley → 2,000m house by ~33%). */
export function altitudeAt(p: number): number {
  return Math.round(mix(1420, 2000, clamp01(p / 0.33)));
}

export function formatAltitude(p: number): string {
  return altitudeAt(p).toLocaleString("en-IN") + "m";
}
