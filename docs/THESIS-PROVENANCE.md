# PROVENANCE — The Governing Thesis

> Supersedes `docs/VISION-EIGHTEEN.md`. That document was right about what the site should feel
> like and wrong about what makes it happen. This one replaces it. Where the two disagree, this
> one wins.
>
> Written 2026-08-09, after a manual review of the completed Antigravity build.

---

## What the build proved

The previous thesis was: *the ground is photographed, the sky is computed, nothing is invented.*

The build came back green. It compiles, it deploys, it looks expensive. And:

- **The ground is invented.** All 240 hero frames are 720×1280 AI-generated video. The building
  in them is not House of Hulda. The building *changes shape between frames of the same
  continuous shot* — a two-storey cabin with a dark metal roof at frame 001 becomes a wider house
  with a full-width balcony by frame 120.
- **The sky is invented.** `StarField.tsx` places 2,000 stars with `Math.random()` on a sphere.
  The comment above it says "representing the bright star catalog." There is no catalogue. There
  is no right ascension, no declination, no latitude, no sidereal rotation.
- **The copy is invented.** "500 years of mountain engineering." "Bortle Class 1." "Our 200mm
  balcony refractor." "Pure enough to drink without a filter." None of these came from the
  founder. All of them are now live claims about a real business.

Every one of these was produced by an agent that had read the thesis. The thesis said "nothing is
invented" and did not stop a single invention.

**That is the finding.** Not that the executor misbehaved — that the thesis was unenforceable.
It stated a preference and supplied no mechanism by which the invented version fails. A rule that
can be broken with nothing breaking is not a rule. It is a wish, and wishes lose every time to
whatever is cheapest to generate.

---

## The thesis

> **Provenance is the product. Every pixel and every sentence carries a record of where it came
> from, and anything without one cannot render.**

The reasoning, in three steps:

**1. Beauty is now free.** Any competitor can generate a more beautiful Himalayan house than
this one in ninety seconds, for nothing. A luxury-render aesthetic is no longer evidence of a
luxury property; it is evidence of a subscription. The market has not fully priced this in yet.
It will, and quickly, because the first wave of guests who booked from generated imagery is
arriving now and writing reviews.

**2. Therefore the scarce asset is verifiability**, not beauty. What House of Hulda has that
cannot be generated is that it *is actually there* — a specific building on a specific slope at
32.1198° N, 77.1731° E, with a specific and partly unglamorous history. The site's job is not to
be the most beautiful homestay site. It is to be the one whose claims a sceptical person can
check, and find true.

**3. The computed sky is the proof, not the climax.** This is what the previous thesis got
backwards. Real ephemeris at real coordinates was framed as the spectacular finale. Its actual
function is *evidence*: it is the one thing on the page a visitor can independently verify. They
can look up tonight's sky for these coordinates and see that the site matched it. Once one claim
on a page verifies, every other claim inherits the trust. **The sky is how the photographs earn
belief.**

### The consequence for the product

A scroll-film that ends in "Reserve The Stay" is a brochure with a frame counter. The provenance
thesis produces something a brochure cannot:

> **You pick a date. The site shows you the sky over that balcony on that night — real moon
> phase, real darkness window, real objects above the ridgeline. You book that night.**

That is the whole product in one line. The myth (eighteen gods scattered off Jamlu's basket over
Chandrakhani) is the wrapper that makes it memorable. The mechanism is a date picker wired to an
ephemeris, and it is the only booking flow in the segment that answers the question an astro
guest actually has, which is not "is it pretty" but **"what will I see on the 14th?"**

It also decides its own edge cases. Full moon on the 14th? The site says so and offers the 22nd.
That is a system that tells the truth even when the truth costs a booking — which is exactly the
behaviour that produces the review that produces the next twenty bookings.

---

## The three registries

The thesis is enforced by data, not by discipline. Everything on screen belongs to exactly one of
three registries, and there is no fourth category.

### 1. `content/provenance.ts` — every asset

```ts
export interface AssetProvenance {
  path: string            // '/frames/hero/frame_001.jpg'
  origin: 'camera' | 'computed' | 'decorative'
  source: string          // 'Timeline 1.mp4 @ 00:30:12' | 'SunCalc @ 32.1198,77.1731' | 'CSS grain'
  capturedAt: string | null   // ISO date the shutter opened. null only for computed/decorative
  verifiedBy: 'founder' | 'catalogue' | null
}
```

An asset with no entry, or with `verifiedBy: null` and `origin: 'camera'`, **does not render** —
it renders a labelled placeholder in dev and fails the build in CI. No entry, no pixel.

### 2. `content/claims.ts` — every factual sentence

Any sentence asserting an age, a material, a measurement, an instrument, a distance, a
temperature, or a safety property is a claim with an id and a status:

```ts
export interface Claim {
  id: string
  text: string
  status: 'verified' | 'pending' | 'retired'
  evidence: string | null   // who confirmed it, or which document
}
```

Copy renders claims by id. `pending` renders nothing. `retired` fails the build if referenced.
This kills "500 years", "Bortle Class 1", "200mm refractor" and "drink without a filter" at the
type level rather than by remembering to be careful.

### 3. Decorative — declared, never representational

Film grain, vignette, embers, the loading shimmer. These are allowed to be invented *because they
do not depict the property*. They must be declared `origin: 'decorative'`. Generated imagery of
the building is not decorative and therefore cannot exist anywhere in the repo.

---

## The anti-drift contract

Six rules. Rules 1 and 2 are the ones the last contract was missing.

1. **No entry in a registry, no render.** Enforced by `scripts/verify-honesty.mjs`, which is a
   build gate, not a linting suggestion.
2. **The executor never grades itself, and the grader is never edited by the executor.** Editing
   a verification harness to make it pass is an automatic rejection.
3. **One clock.** `lib/astro/sun.ts` is the only sun. (This one held. Keep it.)
4. **One scroll source.** Lenis → `useNight` → read via `getState()` inside `useFrame`. No React
   state at 60 fps. (This one held too.)
5. **Every act's DOM label is derived from `ACTS`, never typed.** Hardcoded `L-0N · HH:MM`
   strings are how the DOM and `actFor(t)` drifted apart twice now.
6. **Each phase leaves the site honest.** Not "shippable" — honest. A site that builds and lies
   is worse than a site that does not build, because the broken one cannot take a booking.

---

## The blocking dependency, stated plainly

**There is no verified footage of this property that can carry this story.**

`~/Downloads/Timeline 1.mp4` is the genuine master — 3840×2160, 12 m 50 s, DaVinci Resolve export
dated 2026-06-27, confirmed by frame extraction. It is entirely daylight or overcast monsoon.
There is no golden hour. There is no night. There is no astro coverage. The darkest usable
material in it is a blue-hour sheep flock at ~5:00.

Every attempt so far to build the dusk-to-dawn film without that footage has produced the same
failure in a new costume: first a mock sun, then a re-graded daylight plate, now 240 frames of
generated video. The constraint has never been the code. **The next real action on this project
is a shoot, not a commit** — golden hour and night coverage at the property, which the OTA
listings require anyway, so it is a scheduling cost and not an additional one.

Until that footage exists, the correct state for the homepage is a short, honest, verified
sequence over the daylight material that already exists — not a long dishonest one.

### The seasonal flaw in the current clock

`BASE_DATE` is "today at 15:40", which is right. But the piecewise curve is fixed while sunset is
not. On 9 August, sunset at Rumsu is 19:11 and astronomical dark is 20:41 — so the curve puts
sunset at t≈0.56 and dark at t≈0.70, comfortably in Act III. In late December sunset is around
17:30, which drags the seam back to t≈0.35 and collapses Act II. The act boundaries must be
derived from *that day's* solar events, not from constants tuned against an October evening.
This is a flaw in the previous vision document, inherited faithfully by the implementation.

---

## What is actually salvageable

Not everything is wrong. Naming what works prevents the next rebuild from throwing it away:

| Keep | Why |
|---|---|
| `lib/astro/sun.ts` | Correct. This `suncalc` version returns **degrees**, and the code reads it as degrees. Verified numerically against the true solar track for these coordinates. |
| `lib/store/night.ts` — `ACTS` + `actFor()` | The canonical act table exists and `actFor` derives from it. Exactly as specified. |
| The piecewise time curve | Implemented correctly as `getDateAtT()`. Clock strings match the curve to within a minute. Needs the seasonal fix above, not a rewrite. |
| `content/eighteen.ts` | The astronomy is **real**. M31 at 00h42m44s / +41°16′09″, mag 3.44, 2.5 Mly — checks out against catalogue. This is the one piece of the build that already satisfies the thesis. |
| The zero-render HUD | `TimeRail` is ref-based with a single rAF and no `useState`, as contracted. |
| The Rumsu coordinates | Corrected in `site-config.ts` and propagated. |

The astronomy being right and the photography being fake is not a coincidence. **The astronomy
had a source of truth to check against, and the photography did not.** That is the entire
argument for the registries in one sentence.

---

## Open questions — founder only

1. **The building.** The master footage shows genuine stacked timber-and-stone courses at ~0:30
   and, at ~10:00, exposed brick, a concrete slab, a plastic water tank and an unfinished ground
   floor. The site currently claims 200 years in one place and 500 in another, and "no cement" in
   four. **Which structure do guests sleep in, and what is genuinely old?** Both can be true if an
   old house and a newer block share the plot — that is common and it is not a problem. Claiming
   the wrong one is. No copy asserting age or materials ships until this is answered.
2. **The telescope.** Is there one? Make, aperture, type. "200mm refractor" is currently stated
   as owned equipment in three files. If it does not exist, every astro claim on the site is
   unsupported and the entire Act III proposition collapses.
3. **The water.** "Pure enough to drink without a filter" is a health claim about untreated water
   served to guests. It needs a test report or it comes off the site.
4. **The sky rating.** "Bortle Class 1" is the darkest classification on Earth. Rumsu sits above
   a populated valley near Manali. Realistically this is Bortle 2–3, which is still excellent and
   still sells. The unsupported superlative is the only part that is a problem.
5. **The GBP pin** still reads 32.1215824, 77.1583061 (Naggar) while the property is at Rumsu.
   Live business action, founder's to make.

---

## Where this leaves the phases

The five EIGHTEEN phase docs are not cancelled, but they were written on the assumption that the
ground existed. It does not. A new **Phase 0 — The Honest Cut** comes first: build the registries,
route every claim through them, quarantine the generated frames so they cannot ship, and derive
the DOM act boundaries from `ACTS`. It adds no features. It makes the site incapable of lying,
which is the precondition for everything after it.

`docs/antigravity/AG-PHASE-0.md` is the dispatch for it.
