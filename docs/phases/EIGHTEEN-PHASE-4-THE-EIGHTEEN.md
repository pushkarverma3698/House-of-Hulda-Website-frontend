# EIGHTEEN · Phase 4 — The Eighteen

> Derives from `docs/VISION-EIGHTEEN.md`. Requires Phase 3 verified.

## Goal
The interactive climax, and the moment the brand story and the astronomy become the same object:
eighteen real deep-sky objects, one per deity scattered off Jamlu's basket, visible from this balcony.

## Deliverables
- [ ] `content/eighteen.ts` — 18 real Messier/NGC objects visible from 32.1° N in October, each with
      **true RA/Dec, magnitude, distance and rise time**, plus its mapped deity and a one-line log.
      Candidates: M31, M33, M45, M42, M13, M15, M2, M57, M27, M81/82, NGC 869/884, NGC 7000, M92,
      M39, M52, M103, Albireo, the Cygnus rift. **Sourced and cited in the file header, not invented.**
- [ ] Objects ignite sequentially across Act III, positioned from their real coordinates.
- [ ] **NDC projection for hit-testing** — project each object to normalised device coordinates and
      place a DOM button there. No raycasting against invisible geometry.
- [ ] **Star cards** — click an object → slide-over with its real data and what the 200 mm shows.
      Keyboard accessible, focus-trapped, and **URL-addressable** (`/sky/[slug]`) so a card is
      shareable, server-rendered and crawlable.
- [ ] **The telescope move as a sky move** — FOV narrowing onto the selected object with matched
      damping. Not a camera flight through a void.
- [ ] **The L-06 DOM layer finally exists** — the eighteen-gods reveal. This is the property's central
      story and it currently has no presence on the page at all.
- [ ] **The L-08 DOM layer** — the Artisan Marketplace slide-over (Kullu handloom, raw Himalayan
      honey, hand-carved deodar, apple preserves) with WhatsApp order routing via `whatsappLink()`.

## Architecture decisions
- **Astronomy data is content, not code.** `content/eighteen.ts` sits beside `content/packages.ts`,
  editable without touching components. WHY: the deity mapping is editorial and will be revised; the
  projection maths will not.
- **DOM buttons over NDC, not 3D raycast.** WHY: gives real focus order, real hit targets, real
  screen-reader semantics and real keyboard traversal for free — a raycast gives none of these, and
  the eighteen are the most important interaction in the product.
- **Cards are routes, not modal state.** WHY: a route is shareable, indexable and back-button correct.
  This is also the SEO argument — eighteen server-rendered pages of genuinely unique astronomical
  content tied to a location is exactly what the AI engines and Google reward.
- **Ignition order follows real rise times**, not narrative convenience. WHY: the thesis.

## Antigravity dispatch
Delegable:
- The star-card and marketplace-drawer components, **after** Claude ships one reference implementation
  establishing the slide-over pattern, focus trap and route shape.
- The a11y test suite for both (keyboard traversal, focus return, ARIA).

Prompt contract:
> Goal: implement the remaining 17 star-card routes following the reference at `app/sky/[slug]/page.tsx`
> and the drawer at `components/sky/StarCard.tsx`, reading from `content/eighteen.ts`.
> In scope: `app/sky/`, `components/sky/`. Forbidden: editing `content/eighteen.ts`, any file under
> `components/canvas/`, or the projection maths.
> Verify: `npm run build`; then assert all 18 routes return 200 and appear in `sitemap.ts` — raw output.

Stays with Claude: the astronomy data contract, the NDC projection, the ignition choreography, and all
copy (the deity mapping is the brand's most sensitive writing).

## Success criteria
- [ ] All 18 objects clickable at 375 px and at 1920 px
- [ ] Each card's magnitude/distance/RA/Dec checks against a published catalogue
- [ ] Full keyboard traversal with visible focus; focus returns to the trigger on close
- [ ] All 18 routes server-render and appear in `app/sitemap.ts`
- [ ] Act III still holds ≥ 30 fps on the low tier with all objects lit
- [ ] `npm run build` green

## Open questions
- The deity mapping needs the founder's or a local source's input. Eighteen names attached to the
  wrong objects would be worse than no mapping — this is living religious tradition in the Kullu
  valley, not decoration. **Do not invent the mapping.**

## Verification results
_(fill in before starting Phase 5)_
