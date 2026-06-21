# SEO Audit & Fix Status — House of Hulda

> Senior SEO audit (2026-06-21) against the **repositioned** product (kathkuni
> heritage homestay + café + creative retreat in Naggar). Status: ✅ done tonight,
> ⏳ remaining.

## CRITICAL — launch blockers (data only — you fill)
- ⏳ Fill real NAP in `lib/site-config.ts` (phone, email, host names, **exact rooftop geo** to 6 decimals, exact address line). Mismatched NAP suppresses Google local pack.
- ⏳ Add live **Airbnb listing URL** to `site-config.ts` (`social.airbnb`) — high-authority citation + now wired into schema `sameAs`.
- ✅ **OG image** real 1200×630 at `/public/og.jpg` (regenerated from the kathkuni hero).

## HIGH — ✅ fixed tonight
- ✅ JSON-LD rebuilt as **@graph**: `LodgingBusiness` + `CafeOrCoffeeShop/FoodEstablishment` + **FAQPage** (4 Q&As). Added `numberOfRooms`, `checkinTime/checkoutTime`, `acceptsReservations`-class fields, `servesCuisine: Himachali`, café `openingHours`, expanded amenities, `sameAs` socials.
- ✅ `priceRange` `₹₹₹ → ₹₹` (was scaring budget search).
- ✅ Title → **"House of Hulda — Heritage Homestay & Café in Naggar, Manali"** (58 chars, keyword-front-loaded).
- ✅ `SITE.description` rewritten keyword-rich (kathkuni · Naggar · café · Himachali · 152 chars).
- ✅ `<html lang="en">` → **`en-IN`**.
- ✅ Hero subtitle now keyword-bearing (kathkuni / Naggar / Manali / café / Himachali / 2,000m).
- ✅ Hero + footer CTAs converted from JS-scroll buttons → crawlable **`<a href="#…">`** anchors (smooth-scroll preserved).
- ✅ Keyword `<h2>` reinforcement: Wonder ("things to do in Naggar"), Invitation (`sr-only` booking line). Sanctuaries/TheTable H2s repositioned with real keywords (kathkuni, Himachali café).

## MEDIUM — partly done / ⏳ next
- ✅ Real `<Image>` with descriptive **alt text** now in Sanctuaries (rooms+bath) and TheTable (Himachali thali). ⏳ Host/chef portraits in Coda still procedural (need real photos).
- ✅ FAQ schema added.
- ✅ `robots.ts` `host:` directive removed.
- ⏳ **Build dedicated routes** for keyword clusters the single-page can't rank: `/stay`, `/cafe`, `/naggar`, and a `/blog` index rendering `content/blog/*` (5 posts already written). This is the biggest remaining organic-traffic lever.
- ⏳ `aggregateRating` in schema once real reviews exist (don't fake it).
- ⏳ TouristAttraction nodes (Roerich, waterfall) + image sitemap after real photos.

## Keyword clusters → target route (for the route build)
| Cluster | Examples | Route |
|---|---|---|
| Accommodation | homestay in Naggar, stay near Manali | `/` + `/stay` |
| Kathkuni | kathkuni house Himachal | `/blog` + `/` |
| Café | café in Naggar, Himachali food Naggar | `/cafe` |
| Workation/creative | workation Himachal, creative retreat | `/stay` |
| Budget/shared | budget stay near Manali, hostel Naggar | `/stay` |
| Things to do | things to do in Naggar, Roerich, waterfall | `/naggar` + `/blog` |

## Blog posts written (in `content/blog/`, ready to publish via a `/blog` route)
1. `where-to-stay-naggar.md` — homestay in Naggar
2. `things-to-do-naggar.md` — things to do in Naggar
3. `kathkuni-architecture.md` — kathkuni architecture
4. `workation-himalayas.md` — workation Manali
5. `hulda-cafe-himachali-food.md` — café in Naggar / Himachali food

Each has YAML frontmatter (title, description, slug, keywords) + bracketed placeholders to fill.

## Local SEO essentials
- GBP name = legal/signage name "House of Hulda" (no geo modifier — Google rule). Primary category **Bed & breakfast**, secondaries **Guest house** + **Cafe**.
- NAP byte-identical across website / GBP / Airbnb / Booking.com / MMT.
- Review flywheel: post-stay WhatsApp → GBP review link + Airbnb review.
- Priority citations: GBP → Airbnb → TripAdvisor (stay + café) → Booking.com → Holidify → Thrillophilia → JustDial.
