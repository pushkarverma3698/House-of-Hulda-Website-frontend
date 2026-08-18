# It plays at you. It never lets you reach back.

Mobile design audit + implementation, 18 Aug 2026. Branch `design/made-for-the-hand`.

Follows on from [the altitude and sky audit](./2026-08-18-altitude-and-sky.md).
That one fixed what a desktop visitor could see. This one is about the only
device that matters: a phone, held in one hand.

Everything below was measured at 390x844 dpr 3 and re-checked at 375x667 dpr 2
(`node scripts/mobile-probe.js`, `scripts/gl-work-probe.js`, `scripts/rail-probe.js`).

## The feeling, and where the phone breaks it

A phone is not a small cinema. It is **held**. It is warm in a palm, it answers
a thumb, and it can be put down in half a second.

This site was built as a cinema — and a very good one. But it treats the phone
like a screen you sit in front of: it plays at you for thirteen screens, it
never offers you anything to press while it is doing it, and it heats up in
your hand the whole time.

The person we are actually designing for tapped a link from Instagram at 11pm,
one-handed, in bed. Three things happen to them.

## 1. You cannot act while you are moved

**Measured at ten scroll stops.** From t = 0.098 to t = 0.99 — **89% of the
page** — the only booking control anywhere on screen was the WhatsApp circle.

The header carries a "Reserve" button. It hides itself on scroll-down, which is
the exact direction a visitor scrolls while they are falling for the place. The
real call to action does not arrive until t = 1.0, after **11,156 px — 13.2
screens, about fourteen thumb-flicks.**

So the film spends the golden hour, the attic and the hearth building desire,
and then gives it nowhere to go for another six screens. Here is the hearth
beat as it shipped — the best frame in the film, the moment someone decides they
want to go — with nothing on it to press:

`shots/mobile-before/t045.png`

That is the whole business problem in one screenshot.

## 2. It costs your hand

**Measured with a draw-call counter** (`scripts/gl-work-probe.js`, 2-second
window, film covering the scene at t = 0.25):

| | before |
|---|---|
| WebGL draw calls while the film covers the scene | **240** |
| WebGL draw calls while the sky *is* the screen | 480 |

The film canvas reports opacity 1 from t = 0 to t = 0.62. The 3D canvas
underneath reports opacity 1 the whole time. For the first **55% of the page —
six of the nine acts** — a skybox, two thousand star points, embers, drifting
atmosphere and a critically-damped camera were being shaded at full rate behind
a fully opaque photograph.

On a desktop that is wasted watts. In a hand it is **heat**, and heat is the one
design flaw a visitor feels physically. The phone warms, the SoC throttles, and
the site gets *worse the longer someone stays with it*. The people who scrolled
furthest were being punished hardest.

## 3. It hands you a spreadsheet at the emotional peak

L-07, The Eighteen Gods — the reason the site exists — measured **2,610 px on a
phone. That is 3.1 screens, 23% of the entire page, the single largest block on
the site.** Eighteen identical tiles, nine rows deep. It lands immediately after
the hearth, so the film ends and the visitor is handed a database:

`shots/mobile-before/t068.png`

Nothing in that grid invites a tap more than anything else. The feeling is work.

## What shipped

### 1. A reserve you can reach (`ReserveDock.tsx`)

A dock in the thumb zone, phone only, from the first beat to the last act.

Deliberately not a banner. It is the film's own HUD vocabulary — ink scrim,
amber hairline, `hud-mono`, and the running scene clock, so the one control that
follows you the whole way down also tells you how far you have come. It arrives
at t = 0.06 (the opening frame stays pure film) and **stands down when the
closing act's own button is on screen**, so the finale is one moment and not a
pair of buttons.

That handover is an `IntersectionObserver` on the closing button itself, not a
threshold on `t`. A guessed number left a stretch near the end with *no* reserve
anywhere: the closing section is 55% on screen while its centred button is still
below the fold. If the selector ever stops matching, the dock simply never
retires — the failure mode is "reserve stays reachable", which is the right way
for this to break.

| booking control on screen | before | after |
|---|---|---|
| t = 0.12 → 0.85 (7 stops) | WhatsApp only | **Reserve the stay** |
| t = 0.96 | WhatsApp only | **Reserve the stay** |
| t = 1.0 | Reserve The Stay | Reserve The Stay (dock retired) |

### 2. Stop rendering a sky nobody can see (`SceneRoot.tsx`)

`frameloop` flips to `'never'` while the film covers the scene, and wakes at
t = 0.55 — nine percent of the page, several seconds of scrolling, before the
dissolve begins at 0.64. `'never'` stops the loop without tearing down the GL
context, so nothing is re-uploaded at the moment it becomes visible, and the
wake margin absorbs first-render shader compilation.

| draw calls per 2s | before | after |
|---|---|---|
| film covering the scene (t = 0.25) | 240 | **0** |
| sky is the screen (t = 0.85) | 480 | **480** |

The second row is the important one: the sky itself is untouched.

### 3. The Eighteen Gods became a swipe (`CinematicExperience.tsx`)

A horizontal snap rail on a phone, the same grid from `sm` up. 18 cards at 44%
width, so two and a half are always visible — the half-card is the affordance,
and the "18 OBJECTS ACTIVE" pill now reads "· SWIPE →" on a phone.

`overscroll-x-contain` stops a swipe at the last card from triggering the
browser's back gesture. Verified with a real touch drag: the rail moved and the
page stayed at 6249 — the axis lock holds.

| | before | after |
|---|---|---|
| L-07 height @ 390x844 | 2,610 px | **1,766 px** |
| whole page | 11,156 px / 13.2 screens | **10,312 px / 12.2 screens** |

One screen shorter overall, and the sky is now visible above and below the panel
instead of being buried under it.

### 4. The bottom of the screen belongs to the hand again

There was no `viewportFit` and not one `env(safe-area-inset-*)` in the codebase.
The audio toggle finished 24 px from the bottom edge and the WhatsApp button
32 px — both inside the 34 px strip iOS reserves for the home-indicator swipe,
where a tap is as likely to leave the site as to work. Both now sit at
`calc(5.5rem + env(safe-area-inset-bottom))` on a phone, clear of the indicator
and of the dock, and return to their designed corners at `md`.

### 5. Sticky hover, killed in one line (`tailwind.config.ts`)

`future: { hoverOnlyWhenSupported: true }` compiles all **119** `hover:` rules
inside `@media (hover: hover)`. A phone cannot hover; what iOS does instead is
apply `:hover` on tap and leave it applied until you tap elsewhere — so a deity
tile you opened and closed stayed lit and scaled at 1.02, and the grid collected
a trail of tiles that looked selected and were not.

## Verification

Production build clean, `tsc --noEmit` clean.

Probed at **390x844 dpr 3** and **375x667 dpr 2** — both show unbroken reserve
coverage from t = 0.12 to the finale, and no tap target under 44 px except the
DateDial's 157x40 "Hold" link (pre-existing, untouched).

Before/after captured at ten scroll stops:
`node scripts/audit-shots.js shots/mobile-after 390 844 3`.

## Not verified — needs a real handset

1. **The heat claim is structural, not thermal.** 240 draw calls per 2 s going
   to 0 is measured; what that is worth in degrees and battery percent on a real
   phone is not. The container renders WebGL in software.
2. **The rail's feel.** Mechanics are proven (snap points, axis lock, no back
   gesture). Whether an 18-card swipe is a pleasure or a chore is a judgement
   only a thumb can make.
3. The dock has been seen at 390x844 and 375x667. Landscape is untested.

## Not done — deliberately

- **The L-07 panel is still `bg-ink/[0.88]` on a phone.** It sits directly on
  the star field it is describing, and dropping the ink would let the sky
  through — but mobile deliberately has no `backdrop-blur` for performance, and
  over the tail of the film the copy would be marginal. Shortening the panel put
  the sky back on screen without touching contrast. Lowering the ink is a
  readability call worth making with a real device in hand.
- **The film canvas still renders at dpr 3 on a phone** — a 1170x2532 backing
  store fed from a 720x1280 master. The extra pixels cannot add detail the
  source does not have, and dpr 2 would cut the per-frame fill by 2.25x. It is a
  sharpness-versus-heat trade that should be judged on a handset, not in a
  container.
- **12.2 screens is still a long page.** Cutting it further is a content
  decision, not an engineering one.
- The preloader is still a 4-second black wall before the first frame.
- `public/frames/phase1-3` — 65 MB of unreferenced 4K frames still in the deploy.
