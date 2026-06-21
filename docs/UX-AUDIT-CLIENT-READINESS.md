# UX Audit — Client Readiness

**Project:** House of Hulda Manali — "The Ascent"  
**Date:** 17 June 2026  
**Scope:** Full-site review after P0 (Arrival hero + OG image)  
**Reference:** [`uploads/House-of-Hulda_Design-Brief_The-Ascent.md`](../uploads/House-of-Hulda_Design-Brief_The-Ascent.md), design prototype `The Ascent.dc.html`

---

## Executive summary

The scroll story, typography, and grade engine are **portfolio-grade**. The site is structurally ready to demo the narrative and booking flow. For a **client-facing presentation**, the Arrival showpiece is now a real photograph (P0 complete), but several trust and content gaps remain — most visibly procedural placeholders in Acts III–VII, production labels on image slots, and contradictory booking copy.

**Verdict:** Safe to demo the **story arc + Arrival moment + booking UI** with caveats. Not launch-ready until photography, real NAP, and booking copy are aligned.

---

## P0 deliverables (completed)

| Item | Status | Notes |
|------|--------|-------|
| `public/images/arrival-golden-hour.jpg` | Done | Wired via `next/image` in `Arrival.tsx` |
| `public/og.jpg` (1200×630) | Done | Cropped from hero; serves Open Graph |
| Mist dissolve + scroll reveal | Verified | Sticky pin, opacity/scale unchanged |
| Time-of-day slider | Verified | `todSky()` tint overlay on photo |
| `npm run build` | Pass | Static prerender OK |
| nano-banana in Cursor MCP | Configured | `~/.cursor/mcp.json` — restart MCP to activate |

**Image caveat:** Current hero was copied from existing nano-banana output. It shows a **"HIMALAYAN HOMESTEAD"** sign (wrong brand). Regenerate with [`docs/nano-banana-prompts.md`](nano-banana-prompts.md) when API quota resets (`node scripts/generate-arrival-hero.mjs`). Replace with on-location photography before go-live.

---

## Critical — would embarrass in a client meeting

| Issue | Location | Recommendation |
|-------|----------|----------------|
| Wrong brand text on hero photo | Arrival image | Regenerate: no signage, no text (see prompts doc) |
| Production shoot labels on placeholders | `Placeholder.tsx` bottom tag | Hide for client demo; labels only on hover when `src` set (partial fix in place) |
| Booking: "You're in" vs "we'll reach out within hours" | `BookingPanel.tsx` | Align copy — e.g. "Request received" + single follow-up message |
| Fake ★ 4.9 reviews | `Coda.tsx` | Label "Sample" for demo or link real profiles (user chose to keep placeholders) |
| 7 room/food/portrait slots still procedural | Sanctuaries, TheTable, Coda | P1 image pass |

---

## High — weakens conversion story

| Issue | Location | Recommendation |
|-------|----------|----------------|
| Booking mood panels are gradient-only | `BookingPanel.tsx` | P2: mood-specific photography per `content/packages.ts` labels |
| Wonder act is text + twinkle dots only | `Wonder.tsx` | Add at least one wide shot (deck under stars) |
| Marketplace is color gradients | `Coda.tsx` | Product still-life photos in P2 |
| No embedded map in trust block | Coda footer | Design brief §3 Act VII — add Maps embed or static map |
| Placeholder phone/email in footer + schema | `Coda.tsx`, `lib/schema.ts` | Fix before go-live |
| `Check availability` implies live inventory | `BookingPanel.tsx` | Rename to "Request dates" until Phase 3 |

---

## Medium — polish and accessibility

| Issue | Location | Recommendation |
|-------|----------|----------------|
| Arrival section 230vh — long on mobile | `Arrival.tsx` | Consider `max-sm:h-[180vh]` |
| No skip-to-content link | `layout.tsx` | Add for keyboard users |
| AI faces for fake hosts (when P1 runs) | Coda portraits | Use silhouettes or real photos only |
| Wonder vignettes lack visual anchors | `Wonder.tsx` | Small thumbnails per experience |
| Hero sign legibility at small sizes | Arrival card | Crop tighter on house or regenerate without sign |

---

## Strengths — preserve

- **Narrative architecture:** scroll = altitude + time + emotion (design brief §1)
- **Typography:** Cormorant Garamond + Mulish matches "printed travel essay" direction
- **Global grade:** five palette stops in `lib/grade.ts` track scroll faithfully
- **Persistent Reserve CTA** in header — always reachable
- **`prefers-reduced-motion`** path in globals + scroll engine
- **Copy quality:** sparse, sensory, on-brand
- **Performance:** ref-based scroll (no per-frame React state) — production-grade

---

## Client-demo checklist

### Ready to show

- [x] Full scroll story + color grade
- [x] Arrival hero photograph (with brand-sign caveat)
- [x] OG social preview (`/og.jpg`)
- [x] Mood-picker booking flow (demo mode)
- [x] Time-of-day slider on Arrival

### Defer or label as sample

- [ ] Room, table, portrait placeholders (Acts III, IV, VII)
- [ ] Host names, reviews, contact details
- [ ] Live booking / instant confirmation claim
- [ ] Marketplace product imagery

---

## Recommended next passes

1. **P0 fix:** Regenerate Arrival hero without signage when Gemini quota allows.
2. **P1:** Seven `Placeholder` slots → `docs/nano-banana-prompts.md` § P1.
3. **Copy pass:** Booking confirmation messaging + "Request dates" CTA.
4. **P2:** Booking mood panels + marketplace + Wonder hero image.
5. **Launch blockers:** Real NAP in `lib/schema.ts`, real host story, on-location photography.

---

## Verification log

- Dev server: `http://localhost:3000`
- Build: `npm run build` — success
- OG: `http://localhost:3000/og.jpg` — 1200×630
- Screenshots captured during audit: threshold, arrival (photo), invitation (booking), coda
