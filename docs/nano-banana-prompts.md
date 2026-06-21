# Nano Banana Prompts — House of Hulda "The Ascent"

> Art direction from `uploads/House-of-Hulda_Design-Brief_The-Ascent.md` §4.
> Generated images land in `~/nano-banana-images/`; copy finals into `public/`.

---

## P0 — Arrival hero

**Destination:** `public/images/arrival-golden-hour.jpg`  
**Aspect:** 16:10 (matches `components/sections/Arrival.tsx` showpiece slot)

**Prompt:**
> Cinematic landscape photography, Naggar valley Himachal Pradesh at golden hour. Traditional Kath Kuni heritage homestay — stone and deodar wood, slate roof, warm glowing windows — emerging from lifting mist on a forested ridge at 2,000m. Snow-capped Kullu valley peaks in background. Atmospheric, handcrafted, still, unhurried. No people. No text. Photorealistic, editorial travel photography, warm amber honey light, subtle film grain. Wide composition, house centered in lower third.

**Post-process:** Copy PNG from `~/nano-banana-images/` → `public/images/arrival-golden-hour.jpg` (convert if needed).

---

## P0 — Open Graph social card

**Destination:** `public/og.jpg`  
**Aspect:** 1200×630

**Approach:** Crop/resize Arrival hero (center on house + valley). If crop loses impact, use dedicated prompt:

> Wide cinematic landscape, Naggar Manali golden hour. Kath Kuni stone-and-deodar heritage homestay on misty ridge, warm lit windows, snow peaks behind. Extra sky at top for social preview crop. No people, no text. Photorealistic editorial travel photography, amber honey light.

---

## P1 — Room & table slots (next pass)

| Slot | Label in code | Tone |
|------|---------------|------|
| `sanctuaries-bed.jpg` | Made bed — morning light on wood | warm |
| `sanctuaries-balcony.jpg` | The balcony — valley view | warm |
| `sanctuaries-bath.jpg` | The bath — stone & warm light | warm |
| `table-hero-dish.jpg` | The hero dish — steam rising, candlelight | fire |
| `table-chef-hands.jpg` | Chef's hands plating | fire |
| `coda-host.jpg` | Host portrait — warm, candid | warm |
| `coda-chef.jpg` | Chef portrait — warm, candid | warm |

---

## P2 — Booking mood panels (next pass)

| Mood | Label in `content/packages.ts` |
|------|--------------------------------|
| Slow Reset | Chai on the balcony — morning light, valley below |
| Workation | Desk by the window — warm wood, valley view |
| Creative Retreat | Studio corner — light, books, orchard beyond |
| Couple's Escape | Deck for two — firelight, dusk over the valley |

---

*Interim AI assets: replace with on-location photography before go-live.*
