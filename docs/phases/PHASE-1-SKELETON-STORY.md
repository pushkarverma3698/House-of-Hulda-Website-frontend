# Phase 1 — Skeleton & Story

> Next.js + Lenis + GSAP-class scroll engine; all 8 sections with placeholder
> assets; global grade layer + altitude counter; mobile + reduced-motion paths.

## Goal
The full cinematic scroll arc reads end-to-end and grades smoothly on desktop
and mobile — *before* any real photography is shot. Placeholders name exactly
which asset drops into each slot for Phase 2.

## Deliverables
- [x] Next.js 15 (App Router) + TypeScript, SSG/SSR, Tailwind + design tokens
- [x] Scroll engine: Lenis smooth scroll + normalized `scrollProgress` (0→1),
      frame-subscription model (no per-frame React re-renders)
- [x] Global grade layer — 5 palette stops interpolated across scroll
      (`lib/grade.ts`), faithful port of the locked design prototype
- [x] Parallax ridgelines (far→near + trees), drifting mist, starfield,
      recurring warm window-light motif
- [x] Altitude counter (1,420m → 2,000m, scroll-bound)
- [x] All 8 Acts as semantic `<section>` keyed to story-bible chapter IDs:
      threshold · ascent · arrival · sanctuaries · the-table · wonder ·
      the-invitation · coda
- [x] Pinned Arrival reveal (sticky stage, mist lets go, house slot scales in)
      + time-of-day slider (sunrise→starlight cross-fade). **No 3D** — photo/
      video reveal per product decision; Spline can enhance the same slot later.
- [x] Polished booking UI: mood-picker → package → dates/nights → indicative
      price → "Check availability" → instant in-page confirmation. No payment.
- [x] Reveal-on-scroll, scroll progress bar, persistent Reserve action
- [x] `prefers-reduced-motion` path (cross-fades, no heavy motion), mobile layer
      reduction (foreground trees hidden < sm)
- [x] SEO baseline: LodgingBusiness JSON-LD, metadata/OG, sitemap, robots
- [x] Analytics funnel event stubs (view_hero → confirmed)

## Architecture decisions
- **Ref-based scroll animation, not state.** `ScrollProvider` runs one rAF loop
  (driven by Lenis) computing progress; components subscribe via `useScrollFrame`
  and mutate the DOM directly. Keeps 60fps on mid-range phones. WHY: animating
  React state every frame would thrash reconciliation.
- **Grade as pure math** (`lib/grade.ts`) — testable, ported 1:1 from the
  approved prototype's stops/curves. Single source of truth for sky, stars, tod.
- **Packages are data** (`content/packages.ts`) — editable without touching
  components; the seed the future CRM/channel-manager reads.
- **Arrival = sticky, not ScrollTrigger pin** for v1 — simpler, robust, matches
  the prototype's local-progress reveal. Can migrate to GSAP pin if needed.
- **Booking is API-shaped already**: analytics events (`select_mood`,
  `check_availability`, `confirmed`) are the contract Phase 3 plugs Razorpay +
  availability + reservation-write into without a rewrite.

## Success criteria
- [x] `npm run build` passes; types valid; page is statically prerendered
- [x] First Load JS ~115 kB (well within budget for a cinematic site)
- [x] SSR HTML contains all section copy + JSON-LD (verified via curl)
- [x] Hero renders to design (verified via screenshot)

## Verification results
- Build: ✓ compiled, 6/6 static pages, `/` = 12.9 kB / 115 kB First Load JS
- Security: critical Next CVE-2025-66478 resolved (upgraded to 15.5.19);
  remaining advisories are dev-only/transitive (postcss bumped to ≥8.5.10)
- Runtime: HTTP 200, 76 KB SSR HTML, all 8 acts + schema present
- Visual: hero matches prototype (grade, parallax, window-light, type)

## Open decisions resolved (this session)
1. Whole-home vs per-room → **both** (whole-home default, per-room offered in
   quieter months — copy reflects this in Sanctuaries)
2. 3D → **no custom 3D for v1**; cinematic photo/video reveal + tod slider
3. Booking for v1 → **polished UI, no live payment** (Razorpay deferred to P3)
4. Real photos → **none yet**; placeholders name the shoot list

## Next: Phase 2 — Content & showpiece
Drop in real photography/video (see asset manifest), finalize copy, optional
Spline enhancement of the Arrival slot. Accept when zero placeholders remain and
Lighthouse mobile perf ≥ 90.
