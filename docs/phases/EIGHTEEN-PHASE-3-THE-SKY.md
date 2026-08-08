# EIGHTEEN · Phase 3 — The Sky

> Derives from `docs/VISION-EIGHTEEN.md`. Requires Phase 2 verified.

## Goal
Build the half of the film that cannot be photographed — a real sky at 32.1198° N, 77.1731° E — and
build the dissolve that joins it to the photography. **The seam is the show.**

## Deliverables
- [ ] `components/canvas/SkyBox.tsx` driven by real solar altitude and azimuth from
      `lib/astro/sun.ts`: a physically-motivated zenith→horizon ramp keyed off the existing
      `getSkyColors()` and `getSunIntensity()` helpers, which are already written and currently unused.
- [ ] `components/canvas/StarField.tsx` rebuilt on a **real catalogue** — HYG subset, magnitude ≤ 6.5 —
      with correct sidereal rotation for latitude 32.1198° and true rise/set, so stars sit where they
      will actually be tonight.
- [ ] `components/canvas/EphemerisLight.tsx` fed by `getSunDirection()` / `getSunColor()` /
      `getPracticalIntensity()`, all of which already exist in `lib/astro/sun.ts`.
- [ ] **The seam** — a scroll-driven dissolve from the photographic canvas into the computed sky
      across t ≈ 0.60–0.70, matched on **horizon line and colour temperature**, so the ridgeline in
      the last photograph becomes the ridgeline under the star field. This is the single most
      important shot in the film and the whole thesis rests on it reading as one continuous world.
- [ ] **Strip `components/canvas/Director.tsx` back to sky-relative orientation only.** Delete the
      9-knot position spline, the vertigo contra-zoom and the telescope FOV moves. They currently fly
      a camera through a scene containing nothing but a sphere and two point clouds — elaborate
      choreography with nothing to look at. (The telescope move returns in Phase 4 as a *sky* move.)
- [ ] `components/canvas/PostProcessing.tsx` — bloom threshold from `getBloomThreshold(altDeg)`
      (written, unused), plus vignette and grain. Budgeted, and fully disabled on the low tier.
- [ ] Populate `useNight.tier` for real (`high` / `mid` / `low`) from a GPU + DPR probe, and honour it.

## Architecture decisions
- **Ephemeris is the input to everything visual.** Sky colour, sun direction, practical intensity,
  bloom threshold and star visibility all read from one solar altitude. WHY: it guarantees the sky
  cannot contradict the HUD, which is exactly the class of bug Phase 1 removed.
- **The dissolve is scroll-driven, not time-driven.** WHY: it must be scrubbable in both directions
  and land identically on every replay; a timed transition breaks under reverse scroll.
- **Stars are a single `<points>` with a custom shader**, not instanced meshes. WHY: ~2,000 stars at
  60 fps on a mid-tier Android leaves no budget for draw calls.
- **Camera does not translate in Act III — it orients.** WHY: with no terrestrial geometry, translation
  produces no parallax and therefore no perceptible motion; only rotation and FOV read as camera work.
  This is the honest version of the existing Director's intent.

## Antigravity dispatch
Delegable:
- HYG catalogue ingest → `scripts/build-star-catalog.mjs` + a typed `content/stars.ts` (mechanical
  data transform, verifiable against known star coordinates).

Prompt contract:
> Goal: write `scripts/build-star-catalog.mjs` that downloads the HYG v3 database, filters to
> magnitude ≤ 6.5, and emits `content/stars.ts` exporting a typed readonly array of
> `{ id, name, ra, dec, mag, colorIndex }`.
> In scope: `scripts/`, `content/stars.ts`. Forbidden: touching `components/canvas/`.
> Verify: assert Sirius, Vega, Polaris and Betelgeuse appear with RA/Dec matching published values
> to 0.01°; report the raw assertion output and the array length.

**Not delegable — Claude only:** shaders, the ephemeris wiring, the dissolve, the tier policy, the
Director rewrite. This is the aesthetic core of the product.

## Success criteria
- [ ] At t = 0.1 / 0.5 / 0.9 the rendered sun altitude matches `SunCalc.getPosition()` within 0.5°
- [ ] At least 5 named stars sit within 2° of their true alt/az for tonight at Rumsu
- [ ] The seam holds with no visible horizon jump at 375 px and at 1920 px, scrubbed both directions
- [ ] GPU frame time ≤ 8 ms on the high tier; post-processing off and ≥ 30 fps on the low tier
- [ ] `npm run build` green

## Open questions
- Whether the horizon in the final Act II photograph is stable enough across the shot to match the
  computed horizon, or whether the seam needs a locked-off frame. Resolve by testing the actual cut.

## Verification results
_(fill in before starting Phase 4)_
