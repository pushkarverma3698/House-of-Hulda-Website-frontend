# Antigravity dispatch — EIGHTEEN Phase 1

Paste everything below the line into Antigravity. It is deliberately self-contained: Antigravity has
no memory of the design conversation.

---

## Task: House of Hulda — Phase 1, Foundation & Truth

**Repository:** `/Users/pushkarverma/Projects/house-of-hulda`
**Branch:** create and work on `eighteen/phase-1-foundation`. Do not commit to `main`.
**Stack:** Next.js 15.5.19 App Router, React 19, TypeScript, Tailwind, Zustand, Lenis,
react-three-fiber 9, three 0.185, suncalc.

### Background you need

The homepage is a scroll-driven cinematic film. Scroll progress `t` (0→1) represents time passing at
the property — a heritage homestay at **Rumsu, 2,180 m, 32.1198° N, 77.1731° E** in Himachal Pradesh.
The film runs from 15:40 in the afternoon to 06:05 the next morning.

The codebase currently has **two suns and two act lists that disagree with each other**, and the
production build is broken. This phase fixes correctness only. **Do not add features, do not restyle
anything, do not "improve" adjacent code.**

### The 8 things to do

**1. Fix the production build.**
`components/canvas/ScrollCanvas.tsx:106` fails with `TS2322`: `HTMLImageElement | null` is not
assignable to `HTMLImageElement`. Fix the type, not the render logic.

**2. Declare the missing dependency.**
`components/canvas/Director.tsx` imports `maath/easing`, but `maath` is not in `package.json` — it
resolves only as a transitive dependency of `@react-three/drei`, which is a latent break. Add it to
`dependencies` at the version already present in `node_modules`.

**3. Delete the mock sun.**
`lib/store/night.ts` exports `sunState()` — a fake linear interpolation, commented "Placeholder for
real suncalc implementation". `app/providers.tsx` uses it to set `sunAlt` and `nightBlend`.
Meanwhile `lib/astro/sun.ts` contains a real SunCalc implementation used only by the HUD.

Delete `sunState()` and the now-unused `smoothstep()` from `lib/store/night.ts`. Derive `sunAlt` and
`nightBlend` in `app/providers.tsx` from `getSolarState()` in `lib/astro/sun.ts` instead.
`nightBlend` is a 0→1 ramp: 0 when solar altitude ≥ +2°, 1 when ≤ −12°, smoothly interpolated between.

**4. Replace the linear time mapping with a piecewise curve.**
`lib/astro/sun.ts` currently maps `t` to a clock time with a single linear `SPAN_MS`. Replace it with
a three-segment piecewise curve, exported as `timeAt(t: number): Date`:

```
t 0.00 → 0.33   maps to   15:40 → 17:50   (130 minutes)
t 0.33 → 0.66   maps to   17:50 → 19:45   (115 minutes)
t 0.66 → 1.00   maps to   19:45 → 06:05   (620 minutes, next calendar day)
```

Interpolate linearly *within* each segment. Also change `BASE_DATE`: it is hardcoded to
`new Date(2025, 9, 12, 15, 40)`. It must be **today's date at 15:40 local time**, computed at module
load. Remove the `SPAN_MS` constant entirely. `getSolarState(t)` must use `timeAt(t)`.

**5. Create one canonical act table.**
Add to `lib/store/night.ts`:

```ts
export const ACTS = [
  { id: 'L-01', start: 0.00, end: 0.11, act: 'I',   title: 'The road stops at Rumsu' },
  { id: 'L-02', start: 0.11, end: 0.22, act: 'I',   title: 'The water' },
  { id: 'L-03', start: 0.22, end: 0.33, act: 'I',   title: 'Deodar and stone' },
  { id: 'L-04', start: 0.33, end: 0.44, act: 'II',  title: 'The orchard turns' },
  { id: 'L-05', start: 0.44, end: 0.55, act: 'II',  title: 'The loft' },
  { id: 'L-06', start: 0.55, end: 0.66, act: 'II',  title: 'The hearth' },
  { id: 'L-07', start: 0.66, end: 0.77, act: 'III', title: 'The eighteen' },
  { id: 'L-08', start: 0.77, end: 0.88, act: 'III', title: 'The Eye' },
  { id: 'L-09', start: 0.88, end: 1.00, act: 'III', title: 'Dawn' },
] as const
```

Rewrite `actFor(t)` to **look up `ACTS`**. It currently hardcodes nine `if (t < 0.xx) return` branches
with different boundaries — those must be gone. `LogId` stays as it is.

**6. Rebuild the homepage sections from `ACTS`.**
`app/page.tsx` renders only six sections (L-01, L-02, L-04, L-05, L-07, L-09) evenly spaced inside a
`min-h-[900vh]` container. Two consequences: the DOM labels disagree with `actFor(t)`, and roughly
37% of the scroll past the last section is empty.

Render **nine** sections, one per `ACTS` entry, each `h-[100vh]`, inside a `min-h-[900vh]` container
so section *i* occupies exactly its `t` range. Keep the existing visual styling, typography and
layout-alternation pattern exactly as it is. For the three new sections (L-03, L-06, L-08) use the
`title` from `ACTS` as the heading and **leave the body paragraph as a single `TODO: copy` placeholder
comment** — the prose is being written separately and must not be invented.

The act label and clock rendered in each section must be derived from `ACTS` and `timeAt()`, not typed
in by hand.

**7. Correct the location.**
`lib/site-config.ts` has `geo: { lat: 32.1215824, lng: 77.1583061 }`. The confirmed pin is
**`{ lat: 32.1198, lng: 77.1731 }`**. Update it, and update anything in `lib/schema.ts` that reads it.
Do **not** change the postal address, the locality string, the business name, or the `mapsUrl` — those
are handled separately.

**8. Make the HUD stop re-rendering.**
`components/film/TimeRail.tsx` calls three `setState`s **and** a SunCalc computation inside a
scroll subscription that fires ~60 times a second. Rewrite it so that:
- it holds `useRef`s to the DOM nodes for the act label, the clock, and the sun altitude,
- a single `requestAnimationFrame` loop reads `useNight.getState().t` and writes `textContent` directly,
- there is **no `useState` in the file**, and the component renders once.

### Out of scope — do not touch

`components/canvas/` (except the one type fix in `ScrollCanvas.tsx`), `components/sections/`,
`components/booking/`, `components/editorial/`, `components/layout/`, `app/stay/`, `app/cafe/`,
`app/naggar/`, `app/blog/`, `app/api/`, `public/`, any Tailwind config, any styling.

Do not delete files. Do not refactor code your task did not require you to change. Do not add
comments explaining what you changed.

### Verify — required before you report

```bash
cd /Users/pushkarverma/Projects/house-of-hulda && node scripts/verify-eighteen.mjs
```

This harness is the acceptance test. It must print **10/10 passed** and exit 0. Iterate until it does.
If a check seems wrong, do not modify `scripts/verify-eighteen.mjs` — report the disagreement instead.
**Editing the grading harness is an automatic rejection.**

### Report back

1. The raw, complete output of `node scripts/verify-eighteen.mjs`.
2. The output of `git diff --stat main...HEAD`.
3. Anything you changed that was not in the eight tasks above, and why.
4. Anything in the eight tasks you could not do, and why.
