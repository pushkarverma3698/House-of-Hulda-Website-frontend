# House of Hulda — Go-to-Market Implementation Plan

> **Goal:** Wire every piece — website → marketing → booking across platforms — into one
> system that produces real enquiries, real bookings, and revenue.
> **Date:** 2026-06-21 · **Status:** Phase 1 (cinematic site) complete; nothing live yet.

---

## 0. Where we actually are (honest baseline)

| Asset | State |
|-------|-------|
| Website | Phase-1 cinematic Next.js site. **Booking is simulated** — "Check availability" fakes a confirmation; the enquiry reaches **no one**. Contact info, host names, reviews are **placeholders**. Real photos exist but are **not wired in**. |
| Aesthetic | "Infographic parallax." Owner wants a **high-fidelity, brand-centerpiece experience** (this is a real scope decision — see §3). |
| Airbnb | **LIVE** — this is the real booking engine today (listing `1689928290306679839`). |
| Instagram | **LIVE** — [@houseofhuldamanali](https://www.instagram.com/houseofhuldamanali/). Primary discovery channel. |
| Google | Brand searches resolve; GBP status to verify/optimize. |
| Booking.com | Not live — needs onboarding (§6.2). |
| MMT | Property + host verification **pending** (§6.3). |
| Domain | **Purchased**, not pointed at anything. |
| Photos / phone / email | **Exist**, not in the product. |
| Analytics | Event stubs in code; **no GA4/Pixel firing**. |
| Payments | None (deferred, by design). |

**The core insight:** A new homestay gets ~0 organic web traffic. Revenue *today* flows
through **Airbnb + Instagram + Google**. The website's job is to be (a) the credibility
centerpiece every channel links to, and (b) a **direct-booking enquiry funnel** that saves
the 15–18% OTA commission on the traffic you already own. So we **decouple the revenue
launch from the 3D rebuild** — get a real, convertible, deployed site live in days, then
elevate the visuals without blocking income.

Legend: **DEV** = code work · **OPS** = account/platform/client work · **CONTENT** = copy/photo/asset.

---

## Phase 2 — Make it real & convertible (REVENUE-CRITICAL, ship first)

**Outcome:** The current site, deployed on the real domain, with real photos, real contact
info, and a booking button that delivers a real enquiry to the owner's WhatsApp + inbox,
with live analytics. This is the minimum that turns traffic into money.

### 2.1 Real enquiry capture (DEV) — *the single most important fix*
- Replace the fake confirm in `components/booking/BookingPanel.tsx`. On submit:
  1. **WhatsApp deep-link** (`https://wa.me/<owner>?text=<prefilled enquiry>`) — opens the
     guest's WhatsApp with stay/mood/dates/nights/total pre-filled. Zero-cost, instant, and
     how Indian homestay guests actually convert.
  2. **Server-side capture** via a Next route handler (`app/api/enquiry/route.ts`) →
     emails the owner (Resend or Nodemailer/SMTP) **and** appends a row (Google Sheet or
     a `enquiries` table) so no lead is lost if WhatsApp is missed.
- Rename CTA **"Check availability" → "Request these dates"** and align the confirmation
  copy: "Request received — we'll confirm on WhatsApp within a few hours" (kills the false
  "You're in / instant confirmation" claim the UX audit flagged).
- Add a **persistent floating WhatsApp button** (every homestay site needs this).
- Validate inputs server-side (Zod), rate-limit the route, no secrets in client.

### 2.2 Real contact + NAP (DEV/OPS) — *trust + SEO + schema*
- `lib/schema.ts`: real phone, email, exact address, lat/lng, postal code (must match GBP
  **byte-for-byte**).
- `components/sections/Coda.tsx`: real WhatsApp number, email, real host names (replace
  "Aanya & Vikram"), and either real review links or remove the ★4.9 chips until real.
- Embed a real Google Map in the trust block (UX audit High item).

### 2.3 Wire real photography (DEV/CONTENT) — *can't sell a homestay on placeholders*
- Drop real photos into the 7 `Placeholder` slots (Sanctuaries rooms, TheTable food, Coda
  host/chef portraits, Wonder wide shot, marketplace stills) via `next/image`.
- Replace the Arrival hero (currently has wrong "HIMALAYAN HOMESTEAD" signage) with a real
  on-location golden-hour shot. Regenerate `/og.jpg` from it (1200×630).
- Keep nano-banana **only** for atmosphere (valley/mist/sky), never rooms/food/people.

### 2.4 Live analytics + pixels (DEV/OPS) — *so marketing spend is measurable*
- GA4: install once in `app/layout.tsx`; the `track()` funnel in `lib/analytics.ts` already
  pushes to `dataLayer` — just needs the container.
- **Meta Pixel** + **Google Ads tag** (needed for retargeting in Phase 5).
- Map key events as conversions: `request_dates`, `whatsapp_click`, `cta_click`.

### 2.5 Deploy to the real domain (DEV/OPS)
- Deploy to **Vercel** (native Next 15, free tier fine). Point the purchased domain's DNS.
- Force HTTPS, verify OG preview, submit `sitemap.xml` to Google Search Console.

**Phase 2 done when:** domain is live, every contact detail is real, the booking button
produces a WhatsApp message + owner email you can see arrive, GA4 shows live events, zero
placeholder photos remain.

---

## Phase 3 — Elevate to the brand centerpiece (the "high-fidelity / 3D" upgrade)

> Runs **in parallel with / after** Phase 2 — must **not** block revenue. This is the
> experience upgrade the owner asked for. It is a real, bounded redesign, not a tweak.

**Decision needed (see §8):** how far to push. Three tiers — pick one:
- **Tier A — Polish the current direction** (days): richer real-photo art direction,
  cinematic video loop on Arrival, micro-interactions, better mobile. Lowest risk.
- **Tier B — Premium immersive** (1–2 wks): full-bleed cinematic video, scroll-driven
  film sequences, refined motion design, a genuinely "wow" hero. *Recommended* — maximum
  brand impact per rupee, keeps SEO/perf sane.
- **Tier C — True 3D** (2–4 wks): React-Three-Fiber / Spline interactive house or valley.
  Highest "wow," but heavy (perf budget, mobile, asset production, maintenance). Reserve
  for when bookings justify it; the Arrival slot is already architected to accept it later.

Whichever tier: keep Lighthouse mobile ≥ 90, preserve `prefers-reduced-motion`, and don't
sacrifice the conversion path (the booking funnel from Phase 2 stays intact).

---

## Phase 4 — Direct-booking payments (Razorpay, fast-follow)

Once Phase 2 enquiries prove demand:
- Razorpay account + KYC (OPS), then **deposit/booking link** flow (DEV): availability →
  Razorpay checkout → reservation write + receipt email/WhatsApp.
- The call sites in `BookingPanel.tsx` (`check_availability` → `payment` → `confirmed`) and
  `content/packages.ts` rates are already the contract this plugs into — no rewrite.
- Publish cancellation/refund policy. This is how you take **commission-free** direct
  bookings and beat OTA margins.

---

## Phase 5 — Marketing engine (fill the funnel)

- **Instagram → website funnel:** link-in-bio (or Linktree) → site; Stories highlights for
  rooms/food/experiences; reels of the Arrival drive. Add `?utm_source=instagram` so GA4
  attributes bookings. Post 3–4×/week on a calendar.
- **Content:** the `marketing-campaign` skill can generate the launch campaign — captions,
  reel scripts, a 30-day calendar, email sequence — from the brand bible.
- **Retargeting:** Meta + Google retargeting to people who hit the site but didn't enquire
  (pixels from Phase 2.4 make this possible).
- **Email capture:** lightweight "join the list / seasonal openings" capture for repeat &
  direct bookings.
- **Reviews flywheel:** automated post-stay ask → Google + Airbnb reviews (powers GBP rank
  and the trust block).

---

## Phase 6 — SEO & local discovery

- **Google Business Profile**: claim/verify, complete (photos, amenities, booking link →
  website), keep NAP identical to schema. Biggest free lever for "Manali homestay" intent.
- Google Search Console + sitemap (from 2.5), local keyword pages if needed.
- Schema is already LodgingBusiness JSON-LD — validate in Rich Results test post-launch.

---

## §6 Platform onboarding playbooks (requested)

### 6.1 Airbnb (LIVE — optimize, don't rebuild)
- Audit the live listing: title, first 5 photos, full amenity list, house rules, instant-book
  vs request, pricing + min-nights to match `content/packages.ts`, cancellation policy.
- Add the website + Instagram where Airbnb allows; turn on Smart Pricing/seasonal rates.
- Reply time & acceptance rate drive ranking — keep both high.

### 6.2 Booking.com — onboarding steps
1. **join.booking.com** → "List your property" → register owner account.
2. Property type: **Homestay / Guest house** (whole-home or per-room to match strategy).
3. Add NAP (identical to schema/GBP), photos, amenities, rooms, rates, min-nights,
   cancellation policy.
4. **Verification:** upload ID + property ownership/authorization proof; complete the
   verification call/email.
5. Set up **payments/payout** (bank account, tax details).
6. Configure availability calendar; decide commission/payment model.
7. **Avoid double-bookings:** sync calendars (iCal) with Airbnb, or adopt a channel manager
   (§7) before going live on a 2nd OTA.
8. Open the listing once verification clears.

### 6.3 MakeMyTrip (MMT) — clear the pending verification
- Property + host verification is stuck. Resolve via **MMT Connect / Partner portal**
  (partners.makemytrip.com) or the MyConnect app:
  1. Sign in to the partner account; open the pending verification task.
  2. Submit **property documents** (ownership/lease, business/GST if applicable, address
     proof) and **host KYC** (PAN, ID, bank for payouts).
  3. Complete any e-sign/agreement step.
  4. If stuck >48h, escalate via partner support chat / relationship manager — pending
     status is usually a missing document, not a block.
  5. Once verified, mirror the same content, rates, and calendar sync as the other OTAs.

### 6.4 Google Business Profile
- See Phase 6. The single highest-ROI free channel for local intent — do it early.

---

## §7 Avoiding double-bookings (do before 2nd+ OTA goes live)
With Airbnb + Booking.com + MMT + direct, you **need calendar sync**. Options:
- **iCal sync** between Airbnb ↔ Booking.com (free, ~hourly lag — risky at high occupancy).
- **Channel manager** (e.g. Beds24, Hostaway, eZee — pick on price/India support) — single
  calendar + rates across all OTAs **and** the website. Recommended once >2 channels are live.
`content/packages.ts` is already the data seed a channel-manager/CRM layer can read.

---

## §8 Open decisions (need owner input)
1. **Phase 3 tier:** A (polish) / B (premium immersive — recommended) / C (true 3D)?
2. **Channel manager** now or iCal-sync until volume grows?
3. **Per-room vs whole-home** on each OTA (affects listings + pricing).
4. **Owner WhatsApp number + email** to wire into Phase 2 (have them ready).
5. **Email backend** for enquiry capture: Resend (simple) vs SMTP vs Google Sheet log?

---

## §9 Recommended sequence (fastest path to revenue)
```
Week 1   Phase 2 — real enquiry capture + real contact/NAP + real photos + analytics + DEPLOY
         §6.1 optimize Airbnb · §6.4 claim/optimize GBP · §5 Instagram link-in-bio funnel
Week 2   §6.2 Booking.com onboarding + §6.3 clear MMT verification + §7 calendar sync
         Phase 5 content engine + retargeting pixels live
Week 2–4 Phase 3 visual elevation (parallel track, doesn't block revenue)
Later    Phase 4 Razorpay direct payments once enquiry volume validates demand
```

**One-line strategy:** ship a real, convertible, deployed site this week so Airbnb +
Instagram + Google traffic starts producing direct enquiries; expand OTA distribution and
elevate the visuals in parallel; add direct payments once demand is proven.
