# Scroll sharpness + mobile URL-bar jump — design

Status: approved by user 2026-08-16. Target device: iPhone 11 or older / budget Android.

## Problem

1. **The moving image is too soft.** While scrolling, the canvas always shows the
   160×284 proxy tier upscaled to the canvas backing store (~585px wide on a
   capped-DPR phone) — a 3.7× blowup. The 720×1280 hi-res frame only appears
   after 140ms of stillness (`SETTLE_MS` in
   [components/canvas/ScrollCanvas.tsx](../../../components/canvas/ScrollCanvas.tsx)).
   `ctx.imageSmoothingQuality = 'low'` compounds this: it selects a cheaper,
   blurrier upscale filter than the canvas is capable of.

2. **The URL bar toggling causes a visible jump/lurch.** Confirmed root cause in
   [app/providers.tsx](../../../app/providers.tsx), the live scroll engine that
   drives the film (via `useNight.setState`, read by `ScrollCanvas.tsx`):

   ```js
   let maxScroll = 1
   const measure = () => {
     maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
   }
   measure()
   window.addEventListener('resize', measure, { passive: true })
   const sample = () => {
     const p = Math.max(0, Math.min(1, window.scrollY / maxScroll))
     ...
   }
   ```

   Safari fires `resize` when the dynamic URL bar shows/hides (`innerHeight`
   changes). `CinematicExperience.tsx` sizes its sections in `vh` (one
   `min-h-[950vh]`, six `h-[120vh]`, `min-h-[155vh]`, `min-h-[120vh]`,
   `h-[100vh]`), so `document.documentElement.scrollHeight` moves by the same
   proportion the toolbar does. Both terms of `maxScroll` shift at once, `p`
   jumps discontinuously, `useNight.t` jumps, and the film's frame index jumps
   — exactly synced to the toolbar animating, matching what the user described
   ("scroll up it goes hidden, scroll down it comes").

## Non-goals

- No re-shoot / no new master frames. 720×1280 is enough; the fix is *which
  tier is on screen when*, not new source assets.
- `lib/scroll-progress.tsx` and its consumers (`GradedBackground`, `Arrival`,
  `Ascent`, `Sanctuaries`, `ProgressBar`, `FilmCanvas`) are confirmed dead code
  — not imported by `app/page.tsx` or any live route. Out of scope; not
  touched, not deleted (deletion wasn't asked for).
- `components/film/ScrubEngine.ts` (flagged dead in a prior session) — out of
  scope, unchanged.
- Desktop is not the target device for this fix. The mid tier uses a single
  `MID_BUDGET` constant with no `isCoarsePointer` branch (unlike proxy/hires,
  which split mobile vs. desktop budgets) — desktop has ample headroom under
  73 MB total, so a device branch would add complexity without changing
  behavior anyone asked for.

## Part 1 — Three-tier frame ladder

Add a **mid tier** between the existing proxy (160×284, always resident) and
hi-res (720×1280, settle-only) tiers, selected by scroll velocity rather than
stillness.

| speed | tier | width | upscale on target phone | memory |
|---|---|---|---|---|
| fast flick | proxy (existing) | 160 | 3.7× | 42 MB, all 240 resident (unchanged) |
| slow / deliberate scroll | **mid — new** | **320** | **1.9×** | **~24 MB, ~33-frame LRU window** |
| stopped 140ms | hi-res (existing) | 720 | 1.2× | 7 MB, 2 frames (unchanged) |

Total resident ceiling ≈ 73 MB, up from ~50 MB today. Safe on iPhone 11's
Safari tab budget.

**Why this doesn't reintroduce the thrash that motivated the proxy tier
in the first place:** the original 5% delivery rate happened because a fast
flick demanded frames faster than 3.52 MB hi-res decodes could keep up, with
a cache too small to hold the difference. A slow scroll demands roughly one
frame per 16–33ms tick; a 320px JPEG decodes in low single-digit ms. There is
no deficit to cover, so nothing thrashes.

**Velocity gate — computed locally in `ScrollCanvas.tsx`, no new store field.**
On each detected `targetFrameIdx` change (existing block at
`render()` around line 361), before overwriting `lastTargetIdxRef`/
`idxChangedAt`:

```js
const dtMs = now - idxChangedAt
const dFrames = Math.abs(targetFrameIdx - lastTargetIdxRef.current)
if (dtMs > 0 && lastTargetIdxRef.current !== -1) {
  const instVelocity = dFrames / dtMs // frames per ms
  idxVelocityEma = idxVelocityEma * 0.7 + instVelocity * 0.3
}
```

`isFastFlick = idxVelocityEma > FAST_FLICK_THRESHOLD`. When true, mid-tier is
skipped entirely and behavior is bit-for-bit what it is today (proxy only,
100% delivery, 0 evictions — that guarantee is not touched). When false, mid
is requested for the exact target index:

```js
if (!isFastFlick && !hiresCache.has(targetFrameIdx) && !midCache.has(targetFrameIdx)) {
  void midCache.load(targetFrameIdx, onFrameDecoded)
}
midCache.abortAllExcept(-1) // mirrors the existing hiresCache line
```

Draw chain extends the existing `hires ?? proxyCache.getNearest(...)` to
`hires ?? mid ?? proxyCache.getNearest(...)`. No explicit lookahead
prefetch — the LRU window trails the scroll position on its own from
per-index-change requests, which is simpler and sufficient at slow-scroll
request rates. (Considered explicit ±3 lookahead; dropped as unnecessary
complexity — YAGNI.)

**Threshold tuning:** `FAST_FLICK_THRESHOLD` is a guess (start ~0.05
frames/ms ≈ 50 frames/sec) that must be checked against real `?debug=perf`
numbers on-device, not derived analytically — this is exactly what the
overlay's `tier` readout is for.

**Also fixed alongside this:** `ctx.imageSmoothingQuality = 'low'` →
`'high'`. This is a one-line, free-to-try change (canvas draws at these
frame sizes are not the bottleneck the text-shadow was) that improves the
upscale filter for whichever tier is on screen. Verify it doesn't move the
rAF budget before keeping it.

**Build:** `scripts/encode-mid-frames.sh`, a clone of
`scripts/encode-proxy-frames.sh` with `PROXY_WIDTH=320`. ~6 MB on disk,
fetched on demand — cold start payload stays 2.0 MB.

## Part 2 — URL-bar jump (live file: `app/providers.tsx`)

Two changes, ~15 minutes combined:

1. **Convert the 10 `vh` occurrences in
   [components/film/CinematicExperience.tsx](../../../components/film/CinematicExperience.tsx)
   to `svh`** (lines 31, 65, 93, 111, 132, 153, 174, 239, 297, 316). `svh` is
   fixed at the browser's smallest-toolbar-visible viewport size and does not
   change when the dynamic toolbar animates, so
   `document.documentElement.scrollHeight` stops moving with the toolbar —
   removing the larger of the two coupled terms in `maxScroll`.

2. **Guard `measure()` in `app/providers.tsx`** against re-deriving
   `maxScroll` from a transient `innerHeight` sample, mirroring the existing
   guard in `ScrollCanvas.tsx:305` (`if (isCoarsePointer && canvas.width ===
   newWidth ...) return`):

   ```js
   let lastWidth = window.innerWidth
   const measure = () => {
     if (window.innerWidth === lastWidth) return // height-only = toolbar, not a real resize
     lastWidth = window.innerWidth
     maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
   }
   ```

   With #1 in place this is belt-and-braces (scrollHeight is already stable),
   but it also stops the `window.innerHeight` term itself from wobbling
   `maxScroll` on a toolbar-only resize event, and keeps orientation
   change / real desktop resize working exactly as before (width changes on
   both).

3. **`overscroll-behavior-y: none` on `html, body`** in
   [app/globals.css](../../../app/globals.css) — reduces rubber-band, which is
   one of the triggers for the toolbar animating in the first place.

## Verification

1. `?debug=perf` on-device: read `tier` to confirm mid-tier is used during
   slow scroll and *not* during a flick; confirm `evictions` stays low,
   `delivery` stays ≥95%, worst freeze doesn't regress from the current
   ~18–22ms.
2. Visual: screenshot mid-scroll (should read visibly sharper than today's
   160px) vs. a fast flick (should look identical to today — proxy, not
   softer, not stuttering).
3. Scroll up/down repeatedly to trigger the toolbar animation; confirm no
   visible frame jump and `targetIdx` doesn't skip non-adjacent values in the
   overlay when the toolbar is the only thing changing.
4. Cold start payload stays 2.0 MB (mid tier must not be prefetched).

## Effort

~2 hours total. Part 2 (URL bar) is ~20 minutes and independently shippable
before Part 1 if needed.

## Verification results (2026-08-16)

Shipped in `ce2a9fb`. Mid tier encoded at 320x568: 240 frames, 5.2 MB on disk,
20.3 KB each, 710 KB decoded each.

**Verified — local dev, 375x812 mobile viewport, real wheel input**

| check | result |
|---|---|
| mid tier engages on slow scroll | yes — grew to 13f/9.0 MB then 21f/14.6 MB |
| settle -> hires | yes — tier `hires`, 3.5-7.0 MB resident |
| delivery | 100% throughout |
| evictions | 0-2 (hires tier only, expected at its 2-frame budget) |
| target vs drawn | matched at every sample (25/25, 59/59, 94/94) |
| `next build` | clean, no type errors |

**Verified — URL-bar fix, height-only resize 812->725px at a fixed scroll
position.** This is the decisive measurement; baseline was re-tested by
stashing only the `providers.tsx` guard:

| | frame index |
|---|---|
| without guard (baseline) | 54 -> **58** (4-frame jump) |
| with guard (shipped) | 94 -> **94** (no jump) |

**Verified — production (www.houseofhuldamanali.com)**

- all three tiers serve 200: hero 151.9 KB, hero-mid 22.7 KB, hero-proxy 7.3 KB
- new build live (overlay renders the `idx vel` and `mid mem` rows)
- no console errors
- cold start unchanged: ~1.76 MB proxy tier, zero `hero-mid` references in the
  initial HTML — the mid tier is on-demand only, as designed

**NOT verified — needs the real phone**

1. `FAST_FLICK_THRESHOLD = 0.05` frames/ms never fired in testing. Desktop
   wheel input through Lenis (`lerp: 0.08`) peaked at 0.019 frames/ms — a
   genuinely moderate scroll (~770 px/s), so the gate correctly stayed on the
   mid tier. The threshold corresponds to ~2,000 px/s, which only a real touch
   momentum flick reaches. **Watch `idx vel` on the phone during a hard flick:
   if it never exceeds 0.05 the gate is dead code and the value must come
   down; if delivery drops below ~95% during a flick it is too high.**
2. Live scrubbing on production. The browser automation could not inject
   trusted scroll events into the production tab (synthetic `wheel` events do
   not drive Lenis), so scrubbing was only confirmed against local dev running
   identical code.
3. The actual URL-bar animation. Desktop Chrome has no dynamic toolbar; the
   fix was verified through the resize event it produces, not the toolbar
   itself.

## Addendum (2026-08-18) — the remaining softness was the source, not the schedule

A manual review after the above shipped still read the film as soft — on
both mobile and desktop, confirmed with `?debug=perf` showing 100% delivery
and `tier: hires` at the moment of the screenshot, so this was not a
tier-selection regression. Root cause: the master at `public/frames/hero`
is 720x1280, and there is no higher-resolution source anywhere in the repo —
it is the master, not a downsample of one. A phone's canvas backing store
asks for ~1,150-1,440px wide (390-480pt at 3x dpr); a 1080p desktop asks for
~1,920px. Even the fully-settled, 100%-delivered hires tier is therefore a
1.6x-2.7x real-time upscale done by the browser's canvas compositor — the
note at the top of this file already flagged this ("even the sharp tier is a
~2x upscale. Closing that last step needs a re-master, not a scheduling
change") but it had not yet been addressed.

**What a true fix requires and why it wasn't done here:** more source pixels,
i.e. regenerating the Veo output at a higher resolution or re-encoding from a
higher-resolution export if one exists outside this repo. Neither is
available in this environment (no Veo/Fal credentials, no higher-res master
on disk). Bumping `public/frames/hero`'s own resolution was considered and
rejected for this pass: `hero`/`hero-mid`/`hero-proxy` are the same files
served to both device classes, so raising resolution raises decoded bytes
(`width * height * 4`) for every device including the iPhone-11-class target
this whole frame ladder was budgeted around — risking exactly the cache
thrash the proxy tier exists to prevent, unverifiable here without the
physical device.

**What was shipped instead — recovers perceived sharpness without touching
the frame ladder's memory budget or scheduling:**

1. `scripts/sharpen-frames.py` — offline unsharp-mask + micro-contrast pass
   over all three tiers, master dimensions unchanged (720x1280 stays
   720x1280, so the decoded-byte budget math in `ScrollCanvas.tsx` is
   untouched). `hero-mid`/`hero-proxy` are re-derived from the *sharpened*
   master via Lanczos, not from the original, so all three tiers read as one
   consistent image instead of two of them still tracing back to the softer
   source. Verified on-frame via crop comparisons (porch railings, roofline,
   string lights) — visibly crisper, no halo artifacts at the settings used
   (radius 2.2 / 180% on the master, lighter on mid, none on proxy since
   that tier is only seen during a flick where eye motion blur already masks
   detail). On-disk cost: hero 25.6MB -> 33.5MB, hero-mid 4.8MB -> 9.8MB
   (on-demand only, not in the cold-start payload), hero-proxy 1.7MB -> 2.1MB
   (part of cold start; +0.4MB).
2. A constant `contrast(1.04) saturate(1.03)` compositor-side lift in
   `ScrollCanvas.tsx`, stacked under the existing night-grade filter rather
   than replacing it. Free — a CSS filter on an already-composited canvas
   layer, not a per-frame JS cost — and it's what keeps the offline sharpen's
   edge contrast from reading as flat again once the browser's own upscale
   softens it back down.

**Verified after shipping:** `npx tsc --noEmit` clean; production build
clean; `?debug=perf` after a 4,800px synthetic scroll on iPhone 15 Pro
emulation — 100% delivery, `tier: hires`, proxy 240/240 resident at 41.6MB
(within the 44MB budget), mid 23.6MB (within 24MB), hires 52.7MB (within the
56MB mobile budget) — the frame ladder's behavior is unchanged by this pass.

**Not fully closed:** this raises the ceiling on how sharp a 720x1280 source
can look, it does not raise the ceiling itself. A visitor pixel-peeping a
large monitor will still see a soft cabin in a wide shot, because the
cabin's own on-screen size is a handful of source pixels wide before any
upscale happens. Closing that gap is still the same re-master this file
already named as out of reach a section up.
