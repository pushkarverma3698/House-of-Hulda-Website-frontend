# 🎬 House of Hulda Manali — "The Ascent"
## Design & Storytelling Brief (for Claude Design)

> **Purpose of this doc:** the art direction, narrative, and visual system for a cinematic scroll-story website. This is the *story bible* — Claude Code's build spec references the chapter IDs and copy defined here. Lock the look and the story on the canvas first; code comes after.
>
> **Companion doc:** `House-of-Hulda_Build-Spec_The-Ascent.md` (technical build).

---

## 1. The big idea (read this first)

**Scrolling is climbing.** As the visitor scrolls down, the camera climbs *up* the mountain — from the noisy valley floor to a handcrafted heritage home in the clouds. One scroll is one full **day → night → dawn** cycle, which is really the arc of a stay: you arrive restless, you're fed and warmed, you're filled with wonder, you're invited to belong, and you leave carrying a little of the mountain with you.

We bind **three axes together** so every scroll position means something on all three at once. This is what separates "an authored film" from "a parallax gimmick":

| Scroll progress | Altitude | Time of day | Emotional state |
|---|---|---|---|
| 0% | Valley floor (~1,400m) | Blue pre-dawn | Restless, arriving |
| 20% | Climbing through mist | First light | Unburdening |
| 35% | 2,000m — the house | Golden hour | Arrival / relief |
| 50% | Inside | Warm afternoon | Rest |
| 65% | The table | Dusk / firelight | Warmth, being cared for |
| 80% | Under the sky | Night / stars | Wonder |
| 92% | The invitation | Next dawn | Belonging |
| 100% | Descending coda | Soft morning | Carrying it home |

**The whole site is graded like one continuous shot** — the page's color/light tone transitions smoothly with scroll, from cold blue at the bottom to warm gold at arrival, to deep starlit night, back to soft dawn. The transition material between every chapter is **mist**.

---

## 2. Why this converts AND wins as a portfolio piece

- **Emotion drives booking.** People book a *feeling*, not a room. The arc manufactures desire, then drops the booking flow exactly at the emotional peak of "belonging."
- **It's restrained, so it's fast and trustworthy.** Cinematic ≠ heavy. The wow serves the brand and never blocks the "Book" button (which is always reachable).
- **One signature showpiece** (the 3D house at Arrival) gives the portfolio its dazzle without making the whole site a slow 3D game.
- **It's a real business with metrics**, so the case study reads as "shipped a thing that makes money," not a mockup.

---

## 3. The narrative — chapter by chapter

Each chapter below = one "Act." Copy is present-tense, sparse, sensory — written to read like breath. Use it as-is or refine on canvas. **Recurring motif:** a single warm light in the house window, faintly visible from the very first frame — the thing guiding you up. It never disappears; it just gets closer.

### ACT 0 — `threshold` · The world below (hero)
- **Altitude:** valley floor. **Light:** blue pre-dawn, heavy mist. **Feeling:** the noise you're leaving.
- **On screen:** a wide, still valley at dawn; ridgelines stacked in mist; high above, a single warm window-light glimmers (the house). Minimal UI. One CTA.
- **Copy:**
  - Eyebrow: `NAGGAR · HIMACHAL PRADESH · 2,000m`
  - Headline: `Somewhere above the noise, a light is on.`
  - Sub: `A handcrafted heritage home in the clouds.`
  - CTA: `Begin the ascent ↓` (secondary, quiet: `Reserve`)
- **Interaction:** subtle mist drift even before scroll. Faint ambient wind sound (opt-in, muted by default, tasteful toggle).

### ACT I — `ascent` · Leaving the valley
- **Altitude:** climbing. **Light:** first light breaking. **Feeling:** unburdening.
- **On screen:** the camera climbs; ridgelines and deodar silhouettes pass downward; mist thins layer by layer. A **scroll-bound altitude counter** ticks: `1,420m → 1,710m → 2,000m`. The window-light grows closer.
- **Copy (revealed in beats as you climb):**
  - `The road runs out. Keep climbing.`
  - `The air thins.`
  - `The noise falls away.`
- **Feel:** weightless, slow, inevitable. This is the breath-in.

### ACT II — `arrival` · The house reveals *(signature showpiece)*
- **Altitude:** 2,000m. **Light:** golden hour, full warmth. **Feeling:** arrival, relief.
- **On screen:** mist *lets go* and the kath-kuni house emerges into gold light — the emotional peak. **This is where the interactive 3D house lives:** as it settles, the visitor can gently orbit it, with a time-of-day slider (sunrise → starlight). Static hero image fallback on weak devices.
- **Copy:**
  - `The mist lets go.`
  - `You've arrived.`
  - Micro: `House of Hulda · est. 2024 · built in stone and deodar`
- **Feel:** the exhale. Hold this moment longer than the others (pin the section).

### ACT III — `sanctuaries` · Wood & light (the rooms)
- **Light:** warm afternoon. **Feeling:** rest.
- **On screen:** the real 2BHK spaces in horizontal-reveal panels — bed made, morning light on wood, the balcony, the bath. Honest, warm, lived-in photography (no stock, ever). Be truthful to the real product: it is a **2BHK / whole-home boutique stay** (decide whole-home vs per-room presentation — see open questions).
- **Copy:**
  - `Wood, wool, and morning light.`
  - `Rooms that hold the warmth in.`
- **Feel:** slowing heart rate. Generous whitespace, slow fades.

### ACT IV — `the-table` · The Hulda Table (the chef — headline act)
- **Light:** dusk, firelight, candlelight. **Feeling:** warmth, being cared for.
- **On screen:** steam rising off a dish, the chef's hands plating, the deck dinner set against the dark valley, the fireplace lit. Food is the hero frame of the entire site.
- **Copy:**
  - `Dinner is the reason people stay an extra night.`
  - `From our chef. Our orchard. Our valley.`
  - Link: `See The Hulda Table →`
- **Feel:** intimate, golden, close. The richest color moment of the journey.

### ACT V — `wonder` · Days and nights
- **Light:** night, the sky fills with stars as you scroll (parallax starfield). **Feeling:** wonder.
- **On screen:** the experiences as constellations/vignettes — trails to hidden waterfalls, apple orchards, the Roerich art legacy, bonfire nights, stargazing. As you scroll, the deck appears under a deepening field of stars.
- **Copy:**
  - `Days are for wandering.`
  - `Nights are for the stars.`
- **Feel:** awe, expansiveness. The widest, darkest, most spacious chapter.

### ACT VI — `the-invitation` · Choose your quiet (booking)
- **Light:** next dawn returns — the cycle completes; you've stayed a night. **Feeling:** belonging.
- **On screen:** the **mood-picker booking flow**. The visitor chooses the *kind* of stay, and the panel reconfigures (imagery + package + price), flowing into instant booking:
  - `Slow Reset` · `Workation` · `Creative Retreat` · `Couple's Escape`
- **Copy:**
  - `Every stay is a different kind of quiet.`
  - `Choose yours.`
  - CTA: `Check availability` → instant confirmation (NOT "within 24 hours").
- **Feel:** warm, easy, no friction. This is the payoff; keep it effortless.

### ACT VII — `coda` · Carry it home (marketplace + trust + footer)
- **Light:** soft full morning. **Feeling:** the gentle return.
- **On screen:** a quiet descent — take a piece of the mountain home (marketplace: honey, wool, deodar crafts) as a *secondary* funnel, never competing with Book. Then the **trust block**: real host + chef faces with names and one line of story, real reviews (Google/Airbnb), an embedded map, contact.
- **Copy:**
  - `Take a little of the mountain home.`
  - Hosts: `Your hosts — [names]` + short, true story.
- **Feel:** resolved, grounded, human. End on faces, not effects.

---

## 4. Art direction

**Mood words:** handcrafted · misty · warm · still · honest · elevated · cinematic · unhurried. *Avoid:* corporate, glossy, neon, "tech-y," cluttered.

**Color & light system (drives the whole-page grade across scroll):**
- `Valley dawn` — desaturated cold blues, slate, fog white (`threshold`/`ascent`)
- `Golden arrival` — amber, honey, warm stone, deodar brown (`arrival`/`sanctuaries`)
- `Firelight` — deep ember, candle gold, charcoal shadow (`the-table`)
- `Starfield` — near-black indigo, cold starlight, faint moon-silver (`wonder`)
- `Soft dawn` — pale rose, warm grey, first-light cream (`the-invitation`/`coda`)
- Build these as 5 named palette stops; the page tone interpolates between them with scroll progress.

**Typography:**
- **Display:** an elegant high-contrast serif with character (editorial, literary — this is a *story*). Used large, sparingly, for the breath-copy.
- **Body/UI:** a clean, humanist sans for legibility and trust.
- Generous line-height, lots of negative space, letter-spaced small-caps for eyebrows/altitude/labels.
- Type should feel like a beautiful printed travel essay, not a SaaS landing page.

**Motion language:**
- Slow, eased, weighty — nothing snappy. Easing like a long exhale.
- **Mist is the universal transition** between chapters (dissolve/wipe).
- Parallax depth layers (foreground trees, midground ridges, background peaks, sky) move at different rates to sell altitude.
- Text rises and settles, never slides aggressively.
- One pinned "hold" moment at Arrival (Act II) — let it breathe.

**Photography art direction (give this to whoever shoots the real photos — critical):**
- Shoot **golden hour and blue hour**, plus one clear night for stars.
- Embrace mist, steam, and atmosphere — they're the brand.
- Honest and warm over polished and staged; a little imperfection reads as *real* and out-converts stock.
- **Shot list:** valley at dawn from above · ridgelines in mist · the road/trail up · the house exterior in golden light (multiple angles for the 3D/hero) · the lit window at dusk · made bed in morning light · balcony/valley view from a room · bathroom · the chef's hands plating · a finished signature dish with steam · the deck dinner set at dusk · the fireplace lit · woolen textiles + wood detail · a real guest with chai on the balcony · the orchard · the night sky/stars · host + chef portraits (warm, candid).
- Capture short **looping video** clips too (mist drifting, steam, fire, stars) for the "alive" moments.

**Sound (optional, opt-in, off by default):** wind (ascent) → fire crackle (table) → night insects (wonder) → morning birds (dawn). A single tasteful toggle. Never autoplay with sound.

**Seasonal layer (phase 2):** the grade and a few assets can theme by month — snow/fireplace (winter), blossom (spring), ripe apples (autumn). Design the system to allow it; don't block launch on it.

---

## 5. What to produce in Claude Design (deliverables)

- [ ] A mood/style frame: palette stops, type pairing, motion feel
- [ ] One high-fidelity frame per Act (0–VII) showing layout, copy, and the light-grade at that scroll point
- [ ] The Arrival 3D-house concept frame (+ its static fallback)
- [ ] The mood-picker booking panel (all four states + the availability/confirmation step)
- [ ] The trust block + footer
- [ ] Mobile versions of each Act (see §6)
- [ ] A tokens sheet (colors, type scale, spacing) to hand to Claude Code

---

## 6. Mobile & accessibility (design these, don't bolt them on)

- **Mobile-first reality:** most guests book on phones on slow mountain data. The cinematic must *degrade gracefully*: fewer parallax layers, lighter assets, the same story and the same grade, no broken effects.
- **`prefers-reduced-motion`:** design a calm, static-but-beautiful version (cross-fades instead of heavy motion) — it must still tell the story.
- Maintain text contrast against every grade stop (especially over imagery — use scrims).
- The **Book / Reserve** action is reachable from anywhere at any scroll position (persistent quiet button).
- Real alt text for every image (also helps SEO vs the namesake).

---

## 7. Open decisions (settle before/with the design)

1. **Whole-home vs per-room** as the default product shown in Act III? (Whole-home = premium/boutique; per-room = more reviews faster.)
2. **3D showpiece ambition:** Spline embed (faster, lighter) vs hand-built React Three Fiber (deeper portfolio flex)?
3. Final **host/chef names + the true founding story** for Act VII.
4. Sound on or off for v1?

---

*Story bible — keep this and the build spec in sync. Chapter IDs (`threshold`, `ascent`, `arrival`, `sanctuaries`, `the-table`, `wonder`, `the-invitation`, `coda`) are the shared contract between design and code.*
