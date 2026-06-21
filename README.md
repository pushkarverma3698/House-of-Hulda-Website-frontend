# House of Hulda Manali — "The Ascent"

A cinematic scroll-story website for a handcrafted heritage homestay in Naggar,
Manali. One scroll = one day→night→dawn cycle = the arc of a stay. Built
API-first so the booking + ops automation layer drops in without a rebuild.

**Status:** Phase 1 complete (skeleton, scroll engine, all 8 acts, polished
booking UI). See `docs/phases/`.

## Stack
- Next.js 15 (App Router) + TypeScript — SSG/SSR for SEO & fast first paint
- Tailwind CSS + design tokens (`tailwind.config.ts`)
- Lenis smooth scroll + a ref-based scroll-progress engine (`lib/scroll-progress.tsx`)
- Fonts: Cormorant Garamond (display) + Mulish (body) via `next/font`

## Run
```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build (statically prerendered)
```

## Architecture (read these first)
- `lib/grade.ts` — the global color-grade math (5 palette stops, stars, time-of-day, altitude)
- `lib/scroll-progress.tsx` — Lenis + single rAF loop + `useScrollFrame` subscription
- `components/scroll/GradedBackground.tsx` — the fixed graded background (sky, parallax, mist, window-light)
- `components/sections/*` — the 8 Acts, keyed to story-bible chapter IDs
- `components/booking/BookingPanel.tsx` — mood-picker booking flow (no live payment in v1)
- `content/packages.ts` — packages as editable data
- `lib/schema.ts` — LodgingBusiness JSON-LD (fill NAP before launch)
- `lib/analytics.ts` — funnel event contract

## Source of truth
- `House-of-Hulda_Build-Spec_The-Ascent.md` — technical build spec
- `uploads/House-of-Hulda_Design-Brief_The-Ascent.md` — story bible (art direction + copy)
- `The Ascent.dc.html` — the approved Claude Design prototype (visual contract)

## Before launch (placeholders flagged in code with `[ ... ]` / `TODO`)
- Real photography/video (see asset manifest) — replaces every `Placeholder`
- Real host/chef names + founding story (Coda)
- Real NAP (phone/email/address/geo) matching Google Business Profile (`lib/schema.ts`)
- `/og.jpg` — golden Arrival hero
- GA4 / Meta Pixel / Vercel Analytics IDs
- Phase 3: Razorpay + availability + reservation write
