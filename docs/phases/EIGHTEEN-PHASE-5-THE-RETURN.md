# EIGHTEEN · Phase 5 — The Return

> Derives from `docs/VISION-EIGHTEEN.md`. Requires Phase 4 verified.

## Goal
Make the film convert, and ship it. A film that nobody can book from is a screensaver.

## Deliverables
- [ ] **Persistent navigation on the homepage** — minimal, film-safe, always reachable →
      `/stay`, `/cafe`, `/naggar`, `/blog`. The homepage currently contains **exactly one link** (the
      WhatsApp FAB) and passes zero internal link equity to the routes
      `docs/PLATFORM-AUDIT-AND-NEXT-STEPS.md` calls the biggest remaining organic lever.
- [ ] **A real booking drawer** at `app/@booking/(.)book` — URL-addressable, opening over the film
      without unmounting the canvas. Reads `content/packages.ts`, posts to the existing
      `app/api/enquiry/route.ts`, and degrades to the WhatsApp deep link from `whatsappLink()`.
      Reuse the existing `components/booking/BookingPanel.tsx` rather than writing a second one.
- [ ] **Wire the dead CTA.** `app/page.tsx:100` is a bare `<button>` with no handler — the single
      conversion point in the entire experience does nothing.
- [ ] **A CTA that persists** past the dawn beat, plus contextual entries during Act II where the
      rooms and the café are actually on screen. One button at 63% scroll is not a funnel.
- [ ] `@graph` JSON-LD updated for the corrected Rumsu geo — `LodgingBusiness` + `Cafe` +
      `TouristAttraction` + `FAQPage`; sitemap includes the eighteen `/sky/[slug]` routes.
- [ ] **Performance budget enforced in CI** — LCP ≤ 2.5 s on a Moto G4 / 4G profile, TBT ≤ 200 ms,
      CLS ≤ 0.1, mobile film payload ≤ 6 MB. Lighthouse CI wired into `amplify.yml`.
- [ ] **Correct `docs/plans/2026-08-08-claude-plans-synthesis-and-audit.md`.** Its claims that the
      production build is green and that SunCalc is integrated are both false and will mislead the
      next session. Mark the resolved items and strike the false ones.

## Architecture decisions
- **Intercepting parallel route for booking.** WHY: the drawer must be a URL (shareable, back-button
  correct, indexable) *and* must not unmount the canvas — losing the decode pool and WebGL context on
  every open would cost seconds and a black flash. `@booking/(.)book` is the only pattern that gives
  both.
- **Nav is film-safe, not chrome.** Low-contrast, small, corner-anchored, always present. WHY: the
  film's authority collapses if it is wrapped in a normal website header — but a homepage with no
  outbound links is an SEO dead end and a conversion dead end. This is the compromise that costs the
  least.
- **Enquiry, not payment.** Razorpay stays deferred. WHY: `PLATFORM-AUDIT-AND-NEXT-STEPS.md` puts
  direct payments at Phase 4 of the business roadmap, behind OTA parity and real photos. Shipping a
  payment flow before the calendar is synced creates double-booking risk.
- **The budget is a gate, not a report.** CI fails the build on breach. WHY: a 41 MB film is how this
  regressed the first time; a number nobody enforces is a number that drifts.

## Antigravity dispatch
Delegable:
- The nav component, against a Claude-provided design token set and placement spec.
- The drawer form UI, against the existing `BookingPanel` pattern.
- The Lighthouse CI wiring in `amplify.yml`.

Prompt contract:
> Goal: add Lighthouse CI to `amplify.yml` for `~/Projects/house-of-hulda`, failing the build if
> mobile performance < 75, accessibility < 95, LCP > 2.5s, TBT > 200ms, or CLS > 0.1.
> In scope: `amplify.yml`, `.lighthouserc.json`, `package.json` scripts. Forbidden: `app/`, `components/`.
> Verify: run the LHCI command locally against a production build; report the raw score table.

Stays with Claude: the conversion architecture, the intercepting route, the schema, the budget
thresholds, and the correction of the stale synthesis doc.

## Success criteria
- [ ] Homepage exposes ≥ 4 crawlable internal links
- [ ] Booking drawer reachable by URL **and** by click; submits successfully; degrades to WhatsApp
      with JS disabled or the API down
- [ ] Lighthouse mobile performance ≥ 75 and accessibility ≥ 95
- [ ] A first-time visitor on a cold 4G profile reaches a bookable state in under 15 s
- [ ] `npm run build` green; CI budget gate demonstrably fails on an injected 10 MB regression
- [ ] The synthesis doc contains no false status claims

## Open questions
- Whether the whole-home, per-room and loft-bed inventory sold on the site matches what is actually
  listed on Airbnb. A mismatch between the site and the OTA is a guest-facing failure, and
  `PLATFORM-AUDIT-AND-NEXT-STEPS.md` already flags cross-platform consistency as a rule. Founder call.

## Verification results
_(fill in at launch)_
