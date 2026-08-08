# EIGHTEEN · Phase 1 — Foundation & Truth

> Derives from `docs/VISION-EIGHTEEN.md`. Supersedes `PHASE-1-SKELETON-STORY.md` (that doc describes
> the retired editorial engine, kept for history).

## Goal
Make what already exists **correct, honest and deployable** before adding a single new feature. The
site currently does not build. One clock, one act map, one location. No new capability in this phase.

## Deliverables
- [ ] Fix `components/canvas/ScrollCanvas.tsx:106` — `TS2322`, `HTMLImageElement | null` assigned to
      `HTMLImageElement`. `npm run build` must exit 0.
- [ ] Declare `maath` in `package.json` (imported by `components/canvas/Director.tsx`, currently
      resolving only as a transitive dep of `@react-three/drei` — a latent break).
- [ ] **Delete `sunState()` and the unused `smoothstep()` from `lib/store/night.ts`.** `sunAlt` and
      `nightBlend` derive from `lib/astro/sun.ts` only. Change `BASE_DATE` from the hardcoded
      `Oct 12 2025` to **today's date at 15:40 local**, keeping the 14 h 25 m span.
- [ ] Rewrite `actFor()` and the `app/page.tsx` section boundaries from **one shared act table**, so
      the DOM label always equals `actFor(t)`. Add the missing **L-03, L-06, L-08** sections. Remove
      the ~37% dead scroll tail (`min-h-[900vh]` with only 600vh of copy).
- [ ] Correct `lib/site-config.ts` geo to **32.1198, 77.1731** and reconcile locality copy per the
      vision doc (Naggar = discovery term, Rumsu = physical location). Propagate to `lib/schema.ts`.
- [ ] Rewrite `components/film/TimeRail.tsx` to the zero-render rule: one `useRef` + direct DOM text
      write inside a single rAF. It currently fires three `setState`s **and** a SunCalc computation per
      scroll event (~60 fps), which is the exact opposite of the architecture the docs claim.
- [x] **Footage inventory of `~/Downloads/Timeline 1.mp4`** — complete, written into
      `docs/VISION-EIGHTEEN.md`. It is the Hulda master; all daylight; no night coverage.

## The canonical act table (the contract)

`lib/store/night.ts` exports this **once**; `actFor(t)` and the `app/page.tsx` sections both derive
from it. No second list may exist anywhere in the repo.

| id | `t` start | `t` end | clock | act | title |
|---|---|---|---|---|---|
| L-01 | 0.00 | 0.11 | 15:40 | I | The road stops at Rumsu |
| L-02 | 0.11 | 0.22 | 16:23 | I | The water |
| L-03 | 0.22 | 0.33 | 17:07 | I | Deodar and stone |
| L-04 | 0.33 | 0.44 | 17:50 | II | The orchard turns |
| L-05 | 0.44 | 0.55 | 18:29 | II | The loft |
| L-06 | 0.55 | 0.66 | 19:07 | II | The hearth |
| L-07 | 0.66 | 0.77 | 19:45 | III | The eighteen |
| L-08 | 0.77 | 0.88 | 23:06 | III | The Eye |
| L-09 | 0.88 | 1.00 | 02:27 | III | Dawn |

**Time curve** (replaces the linear `SPAN_MS` in `lib/astro/sun.ts`) — piecewise linear across three
segments, per `docs/VISION-EIGHTEEN.md`:

```
t 0.00 → 0.33  maps  15:40 → 17:50   (130 min)
t 0.33 → 0.66  maps  17:50 → 19:45   (115 min)
t 0.66 → 1.00  maps  19:45 → 06:05   (620 min, next day)
```

## Architecture decisions
- **One act table, exported once.** `actFor(t)` and the section list both read from a single
  `ACTS` array in `lib/store/night.ts`. WHY: the current desync (DOM says L-09 while `actFor` says
  L-06 and the HUD reads 00:41 under copy saying 06:14) is only possible because two lists exist.
- **The clock is today, not a canonical date.** WHY: the vision's claim is that the sky is *real*.
  A frozen `Oct 12 2025` makes the star positions decorative. `BASE_DATE` is computed per session.
- **`lib/astro/sun.ts` is the only sun.** It already implements everything needed (`getSolarState`,
  `getSunDirection`, `getSkyColors`, `getBloomThreshold`) and is currently used by the HUD alone
  while the 3D scene runs on a mock lerp. Reuse it; do not write a second one.
- **No new features in this phase.** Booking, nav, marketplace and the eighteen all wait. WHY: a
  broken build plus a desynced clock makes every downstream bug ambiguous.

## Antigravity dispatch
Delegable (wide-and-shallow, blast radius visible):
- The `ScrollCanvas.tsx:106` type fix and the `maath` declaration.
- The mechanical `TimeRail` rewrite, **after** Claude commits one reference rAF-subscription pattern.

Prompt contract — restate in full, Antigravity has no session context:
> Goal: make `npm run build` pass in `~/Projects/house-of-hulda`.
> In scope: `components/canvas/ScrollCanvas.tsx`, `package.json` only.
> Forbidden: changing render logic, frame counts, phase thresholds, or any other file.
> Verify: `npx tsc --noEmit && npm run build` — report raw output.

Stays with Claude: the act table, the sun contract, the geo and schema correction, all review.

## Success criteria
- [ ] `npx tsc --noEmit` clean and `npm run build` exits 0
- [ ] At every 5% scroll step, the visible DOM act label equals `actFor(t)`
- [ ] HUD time is monotonic 15:40 → 06:05 across the full scroll, with no dead tail
- [ ] `grep -rn "sunState" lib components app` returns nothing
- [ ] Geo in `site-config.ts` and the emitted JSON-LD both read 32.1198 / 77.1731

## Open questions
- The kath-kuni / brick copy conflict (see `docs/VISION-EIGHTEEN.md` § Open questions). **Blocks any
  copy change asserting the property is cement-free.** Does not block this phase's code work.

## Verification results
_(fill in before starting Phase 2)_
