# EIGHTEEN — The Vision

> The single source of truth for the House of Hulda scroll film. Every phase doc in
> `docs/phases/EIGHTEEN-PHASE-*.md` derives from this. If a build decision cannot be
> justified against this document, it is drift — stop and revise this document first.

---

## The thesis

> **The ground is photographed. The sky is computed. Sunset is the seam, and the seam is the show.**

One rule settles every argument:

**If it is on the ground, it was filmed at the property. If it is in the sky, it was calculated from
real ephemeris. Nothing is invented.**

### Why the ground must be real
This is a 200-year-old kath-kuni house in an orchard at 2,180 m, at the trailhead to Chandrakhani.
Timber and stone stacked in alternating courses, standing through earthquakes because it was built to
move instead of resist. That specific, weathered, load-bearing truth is the one thing a competitor
cannot buy — and generative video cannot produce it. AI renders a *different* generic mountain cabin
every run; using it here throws away the only moat the property has, and manufactures exactly the
arrival-vs-listing expectation gap that `docs/PLATFORM-AUDIT-AND-NEXT-STEPS.md` already warns about
for the OTAs.

### Why the sky must be computed
You cannot photograph "the sky as it will look from this balcony tonight." You can compute it. Real
solar position and a real star catalogue at 32.1198° N, 77.1731° E is simultaneously **impossible to
shoot in advance** and **verifiably true**. That is the entire reason WebGL exists in this product —
not decoration, but the one claim the medium can make that film cannot. It is also what turns the
eighteen gods from a caption into a payoff.

### What this replaces
The film as built has three departments making three different movies: the footage is a summer
monsoon day, the copy is a dusk-to-dawn night film, and the 3D is a virtuoso camera move through an
empty void. The thesis above forces them into one.

---

## The shape — the scroll *is* the sun

`t` (0→1) maps 15:40 → 06:05 at the property's real coordinates, on **today's date** — so the stars a
visitor sees tonight are the ones they would actually see tonight.

| Act | `t` | Sun altitude | Who leads | What happens |
|---|---|---|---|---|
| **I — The Approach** | 0 → 0.33 | +32° → +2° | **Photography.** 3D is a clear daylit sky. | The road stops at Rumsu. The stream, the path, the orchard, the first sight of the house. The seam is invisible. Copy is spare. |
| **II — The House** | 0.33 → 0.66 | +2° → −12° | **Photography leads; the sky begins to intrude** through windows and over the ridgeline. | Kath-kuni, the loft, the window, the hearth. Warm practicals ignite as the sun drops. **The offer lives here** — rooms, café, the thing you can actually book. |
| **III — The Eighteen** | 0.66 → 1.0 | −12° → +3° | **Pure WebGL.** Photography has dissolved. | Astro dark. Eighteen real deep-sky objects ignite over the ridgeline — one per scattered god. The telescope. Then dawn, and the booking drawer opens on first light. |

### Time is not linear — the day lingers, the night rushes

A straight lerp from 15:40 to 06:05 puts sunset at t≈0.17 and astro dark at t≈0.28, which would drown
two thirds of the scroll in darkness we have no footage for. Time is therefore a **piecewise curve**,
which is what films do anyway:

| Act | `t` | Clock | Minutes | Feel |
|---|---|---|---|---|
| I | 0 → 0.33 | 15:40 → 17:50 | 130 | The afternoon dwells |
| II | 0.33 → 0.66 | 17:50 → 19:45 | 115 | Golden hour and the descent — the slowest real time |
| III | 0.66 → 1.0 | 19:45 → 06:05 | 620 | The night flies, as nights do |

This lands **sunset (18:04) at t≈0.37** and **astronomical dark (19:41) at t≈0.649** — the seam. The
structure and the ephemeris agree without either being fudged.

### The eighteen are real
Eighteen actual Messier/NGC objects visible from 32.1° N in October, each mapped to one of the deities
scattered off Jamlu's basket. Click one: real magnitude, real distance, real rise time, and the fact
that you can see it from this balcony. **The brand story and the astronomy are the same object.**

---

## The anti-drift contract

1. **One clock.** `lib/astro/sun.ts` is the only sun. The mock `sunState()` in `lib/store/night.ts` is deleted.
2. **One scroll source.** Lenis → `useNight` → everyone reads via `getState()` inside `useFrame`. No React state at 60 fps.
3. **Photography never fakes night. WebGL never fakes the building.**
4. **Every act has a DOM layer**, and the DOM act label always equals `actFor(t)`.
5. **Nothing ships** that fails `npm run build` or breaches the Phase 5 performance budget.
6. **Each phase leaves the site shippable.** Do not start N+1 before N's success criteria are verified and written into its doc.

---

## Verified facts (established 2026-08-08 — do not re-derive)

### Location
**Rumsu, 2,180 m — 32.1198° N, 77.1731° E** (confirmed by the founder).
`lib/site-config.ts` currently carries a different pin (32.1215824, 77.1583061, Naggar) taken from the
Google Business Profile. The code is corrected in Phase 1; **the GBP pin itself is a live business
action for the founder.** "Naggar" is retained as the discovery term in titles and keywords — nobody
searches "Rumsu homestay" — while Rumsu is the stated physical location.

### Footage
**`~/Downloads/Timeline 1.mp4` is the House of Hulda master.** 3840×2160, 24 fps, 12 m 50 s, DaVinci
Resolve Studio export dated 2026-06-27. Verified by frame extraction. The existing
`public/frames/phase2` and `phase3` were already cut from it (the guest-room shot at ~12:30 is the
`phase3` source).

Shot inventory sampled across its length — **all daylight or overcast monsoon; no golden hour, no
night, no astro coverage exists:**

| ~Time | Shot |
|---|---|
| 0:30 | Exterior under the eave — kath-kuni timber and stone courses, orchard, valley, mist |
| 1:00 | Stream and waterfall through forest, from above |
| 1:30 | Canopy looking up through leaves, sun flare |
| 2:00 | Corrugated roofs over the orchard valley |
| 2:30 | Macro foliage and wildflower, shallow depth of field |
| 3:30 | Stone path climbing through dense green |
| 4:00 | Village temple, flag, road |
| 5:00 | **Sheep flock at blue hour** — the darkest, most atmospheric material in the reel |
| 6:00 | Window frame looking onto the village |
| 6:30 | Window open onto the ridgeline |
| 7:30 | The white dog on the stone patio |
| 8:30 | Balcony and timber railing |
| 9:00 | Guest room — flowers, bedding, warm interior |
| 10:00 | **House exterior — exposed brick, concrete slab, water tank, unfinished ground floor** (see Open Questions) |
| 11:00 | Attic loft — A-frame timber, windows, floor seating, rugs |
| 12:30 | Guest room with corner windows onto the orchard (= `phase3` source) |

**Consequence:** Act III cannot be photographed. It must be WebGL. This is not a compromise — it is
the thesis.

### Assets to retire
The 4 clips in `~/Downloads/house of hulda shots by video editor/` are **720×1280 vertical, 24 fps,
10 s**, and their filenames match the Veo prompt list in `scripts/generate-veo-video-loops.mjs` —
i.e. AI-generated, depicting a house that is not this house. `public/frames/phase1` is one of them
upscaled to 1280×2276, which is why the opening shot crops to a dark band on desktop. **All are
retired in Phase 2.**

---

## Open questions

1. **The kath-kuni claim vs. the footage.** At ~10:00 the master shows exposed brick, a concrete slab,
   a plastic water tank and an unfinished ground floor, while ~0:30 shows genuine stacked timber-and-
   stone courses. The site currently claims *"No cement. No steel."* and *"two hundred years."*
   Both can be true if an old kath-kuni structure and a newer block share the property — that is
   common — but **the copy must be made accurate before launch.** This needs the founder's answer:
   which structure do guests actually stay in, and what is genuinely 200 years old?
   Until answered, no phase may ship copy asserting the whole property is cement-free.

2. **Golden-hour and night coverage.** None exists. Act II's descent into twilight is currently
   carried by grading daylight footage, which has a hard ceiling on believability. A future shoot at
   golden hour would materially raise Act II — and is already required for Airbnb/GBP regardless, so
   it is a scheduling cost, not an additional one.
