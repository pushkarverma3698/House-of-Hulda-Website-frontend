# The site sells the sky and never shows the sky

Design audit + implementation, 18 Aug 2026. Branch `design/altitude-and-sky`.

Follows on from [the desktop film-quality audit](./2026-08-17-desktop-film-quality.html),
which measured the geometry. This one is about what the geometry was doing to the
story, and what shipped to fix it.

## The feeling the site is reaching for

Altitude. Thin cold air. The specific hush of getting somewhere remote at dusk
and seeing one lit window across a dark valley — and then the sky opening into
more stars than you have ever seen at once.

Everything in the copy is pitched at that: *the road stops at Rumsu*, *eighteen
gods scattered across these peaks*, *Bortle Class 1*, *eighteen wonders you will
remember for the rest of your life*.

## What was actually on screen

The two images that carry the entire feeling — **the peaks** and **the night
sky** — were the two things a desktop visitor never saw.

**The peaks were cropped off.** Every frame in `public/frames/hero/` is
720x1280, shot 9:16 for a phone. Cover-fitting it to a landscape desktop shows
the middle ~32% of the frame height. The snowline, the cloud break, the whole
sense of altitude sits above the crop. It also meant a 4.2x upscale at
1512x900 dpr 2 — which is the softness that prompted this work.

**The night sky was underneath a photograph of a bed.** The film mapped to
t < 0.7 and then *held its last frame*, fully opaque, until t = 0.85. Measured
against the layout:

| section | t |
|---|---|
| L-06 The Hearth | centred at 0.602 |
| L-07 The Eighteen Gods | enters 0.711, centred 0.747 |
| L-08 The Valley Commons | enters 0.882 |

The film's last frame is a brightly lit bedroom interior. So the stargazing
centrepiece — telescope telemetry, eighteen deities, the reason the site
exists — played over a frozen, upscaled bedroom, and so did the marketplace,
and so did half the closing call to action. The star field was drawn on top of
that bedroom, which is why the last act read as a double-exposure accident.

The WebGL sky underneath was already good. It had simply never been visible.
Confirmed by hiding the film canvas and re-capturing: deep navy, thousands of
correctly-coloured stars, panels sitting on it cleanly.

## What shipped

### 1. The film hands over to the sky (`ScrollCanvas.tsx`)

Re-timed from the measurements above:

```
film plays 1 -> 240   t = 0 .. 0.60   (last frame lands on the L-06 hearth beat)
holds                 t = 0.60 .. 0.64
dissolves             t = 0.64 .. 0.70
sky owns the screen   t = 0.70 .. 1.0
```

The dissolve is a CSS opacity on the canvas *element*, not a `globalAlpha` on
its contents — the context is `alpha: false`, so fading the contents fades
toward black rather than toward what is behind the canvas. As an element
opacity it is compositor-only, so the handoff costs no repaints at all.

This also removes ~2,750 px of scrolling against one static image.

### 2. The aperture (`ScrollCanvas.tsx`, `globals.css`)

On a landscape desktop the film is no longer stretched full-bleed. It is drawn
**contained**, in a tall centred aperture at close to native resolution, with
the full composition intact.

| | before | after |
|---|---|---|
| upscale @ 1512x900 dpr2 | 4.2x | **1.21x** |
| frame visible | 32% | **100%** |
| peaks on screen | never | yes |

The surround is the same frame drawn 32 px wide and blown back up — the upscale
*is* the blur, so an ambient field that tracks the film's own colour costs one
extra `drawImage` and no filter.

The story copy moves off the picture into the field beside it, alternating
left/right, one beat per section. The canvas owns the decision and publishes it
as `data-film-fit` on `<html>`, so the copy and the film can never disagree
about which layout is running. Below ~300 px of field per side, it falls back to
full-bleed.

**Phones are untouched.** A 390x844 phone already lands the film at 0.99x with
the full frame visible — cover was always correct there. Verified by
before/after capture at 390x844 dpr 3: identical layout, identical type
placement.

### 3. Point sprites (`lib/three/pointSprite.ts`, `StarField`, `Embers`)

`THREE.Points` with no `map` rasterises every point as a hard-edged **square**.
At ember and star sizes that read as stuck pixels sitting on the film, and the
chromatic-aberration pass then split them into red and green blocks toward the
screen edges. One shared 64 px radial sprite; both consumers now draw soft
points of light.

### 4. Two post-processing passes removed (`PostProcessing.tsx`)

The desktop render loop was ticking at ~590 ms — under two frames a second — so
the sharp tier could not arrive while the page was moving. Removed:

- **Noise** — `.cine-overlay::after` already draws film grain as a
  compositor-cached CSS layer. The same effect was being paid for twice.
- **ChromaticAberration** — buys very little over an already-graded film, and it
  was the source of the coloured fringing on the sprites.

Bloom stays (it is what makes the star field glow, and the star field is now
what the last third of the page is made of). Vignette stays — removing it is a
look change that needs the CSS vignette strengthened to compensate, on mobile
too, and that is a call for the founder, not a cleanup.

## Verification

Production build clean, `tsc --noEmit` clean.

**Telemetry, sustained ~1,300 px/s scroll through the film, `?debug=perf`:**

| | desktop 1512x900 dpr2 | mobile 390x844 dpr3 |
|---|---|---|
| `data-film-fit` | aperture | cover |
| frames delivered | 96–99% | 98% |
| rAF tick | 330–390 ms | 16.7 ms |
| worst freeze | 0 ms | 49–60 ms |
| freezes >100 ms | 0 | 0 |
| target vs drawn | matched | within 1 frame |
| tier during motion | proxy | hires |

Desktop rAF tick improved from ~590 ms to ~350 ms with the two passes removed,
and delivery from 93% to 96–99%.

**Visual:** before/after captured at ten scroll positions at 1512x900 dpr 2,
1920x1080 dpr 2, and 390x844 dpr 3 (`node scripts/audit-shots.js <dir> <w> <h>
<dpr>`).

## Not verified — needs a real machine

1. **Desktop still reports `tier: proxy` during motion.** The render loop is
   still starved at ~350 ms/tick in this container, which renders WebGL in
   software (SwiftShader) and exaggerates GPU cost — yesterday's audit measured
   the same 2 fps on `main` and isolated the cause to the WebGL layer. The
   sharpness gain is confirmed *at rest* by screenshot; the gain **during active
   scrolling on a real desktop GPU is unmeasured.**
2. The aperture has only been seen at 1512x900 and 1920x1080. Ultrawide and
   short-and-wide laptop windows are untested.
3. Mobile was compared against `main` by capture, not on a real handset.

## Not done — deliberately

- **The film is still a 720x1280 master.** The aperture makes that resolution
  sufficient rather than insufficient; it does not create pixels. A landscape
  re-master remains the only thing that would let the film go full-bleed on
  desktop.
- **L-06 still shows a bed.** The copy says cast-iron stove, siddu, ghee at the
  table; the film's last frame is a bedroom. Re-timing cannot fix this — the
  film simply ends in a bedroom. It needs either different footage for that beat
  or different copy. Flagging, not silently papering over.
- `public/frames/phase1–3` — 65 MB of unreferenced 4K frames still in the deploy.
- Vignette / desktop dpr cap (see above).
