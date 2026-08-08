# EIGHTEEN · Phase 2 — The Ground

> Derives from `docs/VISION-EIGHTEEN.md`. Requires Phase 1 verified.

## Goal
The photographic half of the film, done properly: cut from the real 4K master, correct at every
aspect ratio, and light enough to load on a phone in Manali.

## Deliverables
- [ ] **Re-cut every terrestrial shot from `~/Downloads/Timeline 1.mp4` at true 16:9.** Use the shot
      inventory in `docs/VISION-EIGHTEEN.md`. Retire `public/frames/phase1` (the upscaled vertical AI
      clip) and drop the 4 AirDrop clips from the pipeline entirely.
- [ ] **Uniform aspect ratio across every frame of every act.** The current mix — `phase1` at
      1280×2276 (9:16) against `phase2`/`phase3` at 2560×1440 (16:9) — is what crops the opening shot
      to a dark band on desktop and loses ~74% of the width of the later acts on mobile.
- [ ] **Responsive frame ladders** — 1920w / 1280w / 828w, AVIF with JPEG fallback, selected by
      `matchMedia` + DPR. Budget: **≤ 6 MB for the whole film on the 828w ladder**, down from 41 MB.
- [ ] **Rewrite `ScrollCanvas` as a real scrub engine**: fixed-size decode pool, `createImageBitmap()`
      + `img.decode()`, a priority window around the current `t`, LRU eviction, and a documented
      safe-area contract so no shot ever loses its subject. It currently constructs 300 `Image`
      objects on mount and decodes 41 MB eagerly.
- [ ] **An honest `Preloader`** wired to real decode progress of the Act I window. It is currently a
      random-increment timer that finishes in ~1–2 s regardless of whether any frame has loaded.
- [ ] **A real `PosterFilm`** for `prefers-reduced-motion` and WebGL failure — static key frames
      carrying the complete story and copy, zero canvases. The synthesis doc claims this component
      exists; it does not.
- [ ] Delete the orphaned old engine — `lib/scroll-progress.tsx` (`ScrollProvider`),
      `components/scroll/GradedBackground.tsx`, `components/scroll/ProgressBar.tsx`,
      `components/film/FilmCanvas.tsx`, and the unused `components/sections/*` — **only after**
      confirming `/stay`, `/cafe`, `/naggar`, `/blog` still render (they use `PageShell`, not these).

## Architecture decisions
- **Decode pool, not preload-everything.** A bounded pool with a priority window around `t` and LRU
  eviction. WHY: peak memory becomes a function of the window, not of film length, so adding shots
  later cannot regress mobile.
- **Safe-area contract per shot.** Each shot declares the rect that must stay visible; the cover-fit
  math honours it at both 375×812 and 1920×1080. WHY: the current bug is not a bad number, it is the
  absence of any contract about what a shot is *of*.
- **AVIF with JPEG fallback**, not WebP. WHY: roughly 30% smaller at this grain and quality, and
  Safari 16+ / Chrome / Firefox all ship it; the JPEG ladder covers the rest.
- **The old engine dies in this phase, not earlier.** WHY: it holds the only working reduced-motion
  implementation in the repo — read it before deleting it, and port what `PosterFilm` needs.

## Antigravity dispatch
Delegable:
- The ffmpeg extraction + responsive-variant build script → `scripts/build-film-frames.mjs`
  (mechanical, verifiable by output dimensions and byte counts).
- The mechanical deletion of orphaned components, **after** Claude fixes the keep/drop list.

Prompt contract:
> Goal: write `scripts/build-film-frames.mjs` extracting frames from a 4K source at given
> in/out timecodes into 1920w/1280w/828w AVIF+JPEG ladders under `public/frames/<act>/`.
> In scope: `scripts/` only. Forbidden: touching `components/`, `app/`, or existing frames.
> Verify: run it on one 10s range; report output dimensions, file count and total bytes per ladder.

Stays with Claude: the scrub-engine architecture, the decode/eviction policy, the safe-area contract,
the shot selection and edit decisions (these are directorial, not mechanical).

## Success criteria
- [ ] Every frame in every act shares one aspect ratio (assert in the build script)
- [ ] No shot loses its declared safe area at 375×812 or 1920×1080
- [ ] Mobile film payload ≤ 6 MB; measured, not estimated
- [ ] Scrub holds 60 fps on an M-series laptop and ≥ 30 fps on a mid-tier Android
- [ ] `prefers-reduced-motion` renders the complete story with zero `<canvas>` elements
- [ ] `npm run build` still green; `/stay`, `/cafe`, `/naggar`, `/blog` unaffected

## Open questions
- Golden-hour coverage does not exist in the master. Act II's descent into twilight is graded from
  daylight and has a believability ceiling. Flag for a future shoot; do not fake it.

## Verification results
_(fill in before starting Phase 3)_
