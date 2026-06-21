# Platform Audit & Next-Steps Plan — House of Hulda

> 2026-06-21. Written **after** the brand was repositioned from faux-luxury to the
> real product: a soulful kathkuni heritage homestay + daytime café + creative
> retreat in Naggar, with private rooms, a shared attic-loft, and the whole-home option.

## What changed tonight (website)
- **Repositioned the entire story** to the real product (rooms, café, kathkuni, shared loft, whole home, creative residency) across every section + the booking packages.
- **Wired 6 real photos** (rooms + baths) + **2 nano-banana atmosphere shots** (kathkuni exterior hero, Himachali café thali). OG image regenerated.
- **Real enquiry capture** (WhatsApp + `/api/enquiry`), honest "Request received" flow, floating WhatsApp button, GA4/Pixel ready (from earlier in the session).
- **SEO**: @graph schema (lodging + café + FAQ), titles/descriptions/lang, crawlable CTAs, keyword headings, 5 blog posts drafted.

## ⚠️ Cross-platform consistency rule
The reposition means your **Airbnb, GBP, Booking.com, MMT, and website must all tell the same story**: rustic kathkuni eco-homestay + café + creative retreat, honest about shared vs private, honest rates. Do NOT mix the old "luxury chef boutique ₹14–21k" language anywhere.

## ⚠️ AI-image caveat (important)
The room/bath images are AI-generated/enhanced and the 2 hero shots are nano-banana. They're fine for the **website mood**. For **Airbnb/Booking.com/MMT you must upload real phone photos of the actual rooms** — OTAs require authentic property photos and will penalize/delist AI imagery, and guests compare arrival to listing.

## ⚠️ Security
Rotate the **MakeMyTrip password** that was in `Credentials.docx` (it was shared in plaintext). Don't keep passwords in shared docs — use a password manager.

---

## Platform-by-platform audit & actions

### Airbnb (LIVE) — realign to real product
- Rewrite title/description to the repositioned brand (see `docs/marketing/LISTINGS-COPY-PACK.md`, but drop luxury-chef framing — lead with kathkuni heritage, café, orchard, honest room types).
- Make sure **rates match** the real tariff you set in `content/packages.ts`.
- Upload **real** room/bath/café/orchard photos (not the AI ones).
- Decide: list **whole-home**, **private room**, and/or **attic-loft beds** — match how you actually sell.
- Enable iCal calendar export (needed before any 2nd OTA).

### Google Business Profile — claim + build (highest free ROI)
- Category **Bed & breakfast** + secondary **Guest house**, **Cafe**.
- Name = "House of Hulda" (no geo modifier). NAP byte-identical to `site-config.ts`.
- Paste the GBP description (repositioned), add real photos, set café hours, add website + booking link.
- Drop the **exact rooftop pin**; copy the 6-decimal lat/lng into `site-config.ts`.

### Booking.com — onboard (steps in `docs/GO-TO-MARKET-PLAN.md §6.2`)
- Register → property type **Homestay/B&B** → paste repositioned description → ID + ownership proof → payout → **iCal-sync with Airbnb before going live**.

### MakeMyTrip — clear pending verification
- Partner portal → submit property docs + host KYC (PAN, ID, bank) → e-sign → escalate if stuck >48h. (Rotate the exposed password first.)

### Instagram (LIVE) — funnel + content
- Bio + link-in-bio (site / WhatsApp / Airbnb / Maps). Use `docs/marketing/INSTAGRAM-LAUNCH-KIT.md`, but skew captions to the real vibe (kathkuni, café, creative/hippie, orchard) over luxury.
- Repurpose the 5 blog posts into carousels/reels.

---

## Prioritized roadmap

### Tonight / this week (revenue-critical)
1. **Fill `lib/site-config.ts`** real values (phone, email, host names, exact geo, address, Airbnb URL) + set real **rates** in `content/packages.ts`.
2. **Shoot/collect real photos** of the actual rooms, café, food, orchard, hosts → replace AI images on OTAs (website can keep current mood shots).
3. **Deploy** to Vercel + point domain + GA4/Pixel/Resend env vars + submit sitemap to Search Console.
4. **Airbnb realign** + **GBP claim** + **Instagram funnel** (all use the repositioned copy).

### Next 1–2 weeks
5. **Build SEO routes**: `/stay`, `/cafe`, `/naggar`, `/blog` (publish the 5 written posts). Biggest remaining organic lever.
6. **Booking.com** onboarding + **MMT** verification + **calendar sync** (iCal or a channel manager once >2 OTAs).
7. Review flywheel (post-stay WhatsApp → GBP + Airbnb reviews); add `aggregateRating` once real.

### Later
8. **Razorpay** direct-deposit payments (Phase 4 — call sites already shaped).
9. Deeper visual polish pass (motion, host portraits, café-loft photos), TouristAttraction schema, image sitemap.

## Open items needing your input
- Real **rates** per room / loft bed / whole-home / residency.
- Real **phone, email, host + chef names**, exact address + rooftop geo.
- Whether the attic is sold as **shared hostel beds**, **café-only**, or both — affects listings.
- Real photos (and ideally a short looping video) of the actual spaces + food.
