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
