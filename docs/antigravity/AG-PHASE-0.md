# Antigravity dispatch — PROVENANCE Phase 0: The Honest Cut

Paste everything below the line into Antigravity. It is deliberately self-contained: Antigravity
has no memory of the design conversation.

---

## Task: House of Hulda — Phase 0, The Honest Cut

**Repository:** `/Users/pushkarverma/Projects/house-of-hulda`
**Branch:** create and work on `provenance/phase-0-honest-cut`. Do not commit to `main`.
**Stack:** Next.js 15.5, React 19, TypeScript, Tailwind, Zustand, Lenis, react-three-fiber 9,
three 0.185, suncalc.
**Read first:** `docs/THESIS-PROVENANCE.md`. It is the governing document for this task.

### Background you need

The homepage is a scroll-driven film for a real heritage homestay at Rumsu, 2,180 m,
32.1198° N, 77.1731° E, Himachal Pradesh. A review found that the film is built entirely on
AI-generated video of a building that is not this property, and that the copy asserts several
facts about the business that nobody has verified.

Meanwhile **300 frames of genuine footage of the actual property are already in the repo and
referenced by nothing**: `public/frames/phase1`, `phase2` and `phase3`, cut from the 4K master.
`components/canvas/ScrollCanvas.tsx` ignores them and loads `public/frames/hero` instead, which
is the generated material.

This phase adds no features. It makes the site structurally incapable of presenting unverified
material as fact. **Do not restyle anything. Do not improve adjacent code. Do not write new
marketing prose — that is explicitly forbidden below.**

### The 8 things to do

**1. Create the asset registry `content/provenance.ts`.**

```ts
export type AssetOrigin = 'camera' | 'computed' | 'decorative'

export interface AssetProvenance {
  path: string              // '/frames/phase1/frame_001.jpg'
  origin: AssetOrigin
  source: string            // 'Timeline 1.mp4' | 'SunCalc @ 32.1198,77.1731' | 'CSS grain'
  capturedAt: string | null // ISO date the shutter opened; null only for computed/decorative
  verifiedBy: 'founder' | 'catalogue' | null
}

export const ASSET_PROVENANCE: readonly AssetProvenance[] = [ /* ... */ ]
```

Register every frame in `public/frames/phase1`, `phase2` and `phase3` as
`origin: 'camera'`, `source: 'Timeline 1.mp4'`, `capturedAt: '2026-06-27'`,
`verifiedBy: 'founder'`. Generate these entries programmatically in a small script under
`scripts/` and commit the generated file — do not hand-type 300 entries.

Also register the images under `public/images/` that are actually referenced by code. If you
cannot establish that an image came from the property, **do not register it** — instead do what
task 2 says.

**2. Quarantine everything unverified. Move, never delete.**

Move `public/frames/hero/` to `public/_quarantine/hero/`, and move any `public/images/*` file that
you could not register in task 1 to `public/_quarantine/images/`. Keep the files tracked in git —
they are evidence of what was there — but ensure **nothing under `public/_quarantine/` is
referenced from `app/`, `components/`, `lib/` or `content/`.**

`public/frames/phase1` is 3840×2160 while `phase2` and `phase3` are 2560×1440. Re-encode `phase1`
in place to 2560×1440 JPEG quality 82 so all three sequences share one dimension, and note the
before/after directory sizes in your report.

**3. Point the film at the real footage.**
Rewrite the two `img.src` lines in `components/canvas/ScrollCanvas.tsx` to load the real
300-frame sequence in order: `phase1/frame_001…100`, then `phase2/frame_001…100`, then
`phase3/frame_001…100`. Change `TOTAL_HERO_FRAMES` to 300 and map `t → frame index` across the
full 0→1 range. **Do not change the decode strategy, the cover-fit maths, or the grading filter** —
those belong to a later phase.

**4. Create the claims ledger `content/claims.ts`.**

```ts
export interface Claim {
  id: string
  text: string
  status: 'verified' | 'pending' | 'retired'
  evidence: string | null   // who confirmed it, or which document. null iff status !== 'verified'
}

export const CLAIMS: readonly Claim[] = [ /* ... */ ]
export const claim = (id: string): string => { /* returns '' for pending/retired */ }
```

Move **every factual sentence** currently in `app/page.tsx`, `app/stay/page.tsx`,
`app/cafe/page.tsx`, `components/sky/StarCard.tsx`, `components/film/BookDrawer.tsx`,
`components/film/Marketplace.tsx` and `components/sections/*` into this ledger. A factual sentence
is one asserting an age, a material, a measurement, an instrument, a distance, a temperature, or a
safety property.

Set `status: 'pending', evidence: null` for all of these, which are **unverified and must stop
rendering immediately**:

- "500 years of mountain engineering in every beam" (`app/page.tsx`)
- "five centuries old" (`content/blog/kathkuni-architecture.md`)
- "No mortar. No iron nails." and every "no cement" variant
- "BORTLE CLASS 1" (`app/page.tsx`, `components/film/BookDrawer.tsx`)
- every "200mm refractor" / "balcony refractor" reference (`app/page.tsx`,
  `components/sky/StarCard.tsx`, `content/eighteen.ts`)
- "Pure enough to drink without a filter" (`app/page.tsx`)
- "Ancient Royal Delicious apple trees" and "This light lasts twelve minutes"

Set `status: 'verified'` with `evidence: 'founder 2026-08-08'` for these, which are confirmed:
the coordinates 32.1198° N / 77.1731° E, the elevation 2,180 m, the locality name Rumsu, and the
Chandrakhani trailhead position.

Then render copy through `claim(id)`. A `pending` claim renders an empty string, so the sentence
simply disappears. **Do not write replacement prose. Do not soften the claims. Do not invent a
substitute fact. A shorter, quieter page is the correct outcome of this task.**

**5. Derive the homepage sections from `ACTS`.**
`app/page.tsx` hardcodes nine act labels and clock strings (`L-01 · 15:40 · …`) and nine literal
section heights (`h-[120vh]`, `min-h-[155vh]`, …). Two consequences: the printed clocks for L-08
and L-09 are shifted one row out of step with `ACTS` in `lib/store/night.ts`, and at 5 of 21
sampled scroll positions the visible act label disagrees with `actFor(t)`.

Import `ACTS` and render the sections from it. Each section's id, clock and act numeral come from
its `ACTS` entry. Each section's height is `(tEnd - tStart) * 900` viewport units so section *i*
occupies exactly its `t` range inside a `min-h-[900vh]` container. Keep every existing visual
style, gradient, alignment and typography exactly as it is.

**6. Make the preloader honest.**
`components/film/Preloader.tsx` renders a random-increment counter that reaches **112%**, and
prints a hardcoded `12 OCT · SUNSET 18:04 · ASTRO DARK 19:41` while the site's clock runs on
today's date. Clamp the percentage to 100, and derive the printed sunset and astronomical-dark
times from `lib/astro/sun.ts` for the current date. Leave the visual design alone.

**7. Stop the star field claiming to be a catalogue.**
`components/canvas/StarField.tsx` places 2,000 points with `Math.random()` under a comment reading
"Generates procedural star points representing the bright star catalog." It is not a catalogue.
Delete the misleading comment, rename the function to `generateDecorativeStarPoints`, and register
the star field in `content/provenance.ts` as `origin: 'decorative'`. Do not attempt to load a real
catalogue — that is a later phase.

**8. Repo hygiene.**
Delete the scratch files `capture.js`, `check_logs.js`, `debug_screenshot.js`, `test_ui.js` and
`test_editorial.js` from the repository root. Delete `pnpm-lock.yaml` and `pnpm-workspace.yaml`;
`package-lock.json` is the single lockfile. Do not touch `image-slot.js` or `support.js`.

### Out of scope — do not touch

`lib/astro/sun.ts` (it is correct — this `suncalc` version returns degrees and the code reads
degrees), the `ACTS` table itself, `content/eighteen.ts` astronomical data (RA/Dec/magnitude are
verified correct — only its `observationNote` telescope references move to the ledger),
`components/canvas/Director.tsx`, `components/canvas/SkyBox.tsx`,
`components/canvas/PostProcessing.tsx`, `components/film/TimeRail.tsx`, `app/api/`, any Tailwind
config, any styling, any route under `app/blog/`.

Do not refactor code your task did not require you to change. Do not add comments explaining what
you changed.

### Verify — required before you report

```bash
cd /Users/pushkarverma/Projects/house-of-hulda && node scripts/verify-honesty.mjs
```

This harness is the acceptance test. It must print **14/14 passed** and exit 0. Iterate until it
does. Run it with the dev server **stopped** — a running `next dev` writes `.next/` concurrently
and will produce a spurious build failure.

If a check seems wrong, do not modify `scripts/verify-honesty.mjs` — report the disagreement
instead. **Editing the grading harness is an automatic rejection.**

### Report back

1. The raw, complete output of `node scripts/verify-honesty.mjs`.
2. The output of `git diff --stat main...HEAD`.
3. Every sentence you moved to `status: 'pending'`, listed.
4. Anything you changed that was not in the eight tasks above, and why.
5. Anything in the eight tasks you could not do, and why.
