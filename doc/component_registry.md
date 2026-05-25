# Component Registry

> **Purpose:** Track all existing components, their animation patterns, and their ScrollTrigger usage to prevent conflicts.

---

## Active Components

### 1. `MountainParallax.js`
- **Type:** Layout wrapper (wraps entire `<main>`)
- **CSS:** `MountainParallax.module.css`
- **Animation:** 3 scrubbed ScrollTriggers (bg, mid, fg parallax layers)
- **Trigger:** `containerRef.current` | Start: `top top` | End: `bottom top`
- **Z-Layers:** 0 (bg), 5 (mid), 10 (content), 20 (fg)
- **Sub-components:** `DetailedCabin`, `InfographicDeodar` (inline SVGs)
- **⚠️ Note:** Currently uses SVGs; planned upgrade to PNG layers

### 2. `Hero.jsx`
- **Type:** Full-viewport hero section
- **CSS:** `Hero.module.css`
- **Animation:** Parallax via `window.addEventListener('scroll')` (⚠️ should migrate to GSAP)
- **Layers:** 7 layers (sky, distant mountains, mid mountains, content, foreground, mist, fade)
- **Z-Layers:** 1-7 (internal)
- **Dependencies:** `AnimatedText`
- **⚠️ Issue:** Uses raw scroll listener instead of GSAP ScrollTrigger — conflicts with Lenis

### 3. `AnimatedText.js`
- **Type:** Reusable text animation wrapper
- **CSS:** `AnimatedText.module.css`
- **Animation:** SplitType word split + GSAP stagger reveal
- **Trigger:** Self (textRef) | Start: `top 85%` | Once: true
- **Props:** `tag`, `className`, `delay`
- **Pattern:** Words animate from `yPercent:100, opacity:0` → `yPercent:0, opacity:1`

### 4. `Navbar.jsx`
- **Type:** Fixed navigation bar
- **CSS:** `Navbar.module.css`
- **Animation:** CSS transition on scroll state change (background opacity)
- **Z-Index:** 50 (above all content)
- **Features:** Palette switcher (A/B/C), hamburger mobile menu, "Book a Stay" CTA
- **Scroll Detection:** `window.addEventListener('scroll')` (lightweight, OK to keep)

### 5. `About.jsx`
- **Type:** Content section
- **CSS:** `About.module.css`
- **Animation:** IntersectionObserver-based `.reveal` class toggle
- **Pattern:** Elements with `.reveal` class get `.visible` added on intersection
- **Content:** Property description, stats (2k meters, 4 rooms, ∞ views), placeholder image

### 6. `Rooms.jsx`
- **Type:** Room showcase section
- **CSS:** `Rooms.module.css`
- **Animation:** IntersectionObserver `.reveal` pattern
- **Content:** Room cards grid

### 7. `Experience.jsx`
- **Type:** Activities/experience section
- **CSS:** `Experience.module.css`
- **Animation:** IntersectionObserver `.reveal` pattern

### 8. `Gallery.jsx`
- **Type:** Photo gallery section
- **CSS:** `Gallery.module.css`
- **Animation:** IntersectionObserver `.reveal` pattern

### 9. `ParallaxDivider.jsx`
- **Type:** Decorative divider between sections
- **CSS:** `ParallaxDivider.module.css`
- **Animation:** GSAP ScrollTrigger scrubbed parallax on background image

### 10. `Testimonials.jsx`
- **Type:** Guest reviews section
- **CSS:** `Testimonials.module.css`
- **Animation:** IntersectionObserver `.reveal` pattern

### 11. `BookingCTA.jsx`
- **Type:** Call-to-action section
- **CSS:** `BookingCTA.module.css`
- **Animation:** IntersectionObserver `.reveal` pattern

### 12. `Footer.jsx`
- **Type:** Footer with contact info
- **CSS:** `Footer.module.css`
- **Animation:** None

### 13. `LenisProvider.js`
- **Type:** Context provider (wraps app in `layout.js`)
- **Animation:** Initializes Lenis smooth scroll with custom easing
- **Config:** `duration: 1.2`, `smooth: true`, `smoothTouch: false`
- **⚠️ Note:** Currently runs its own RAF loop separate from GSAP ticker — sync recommended

---

## Utility Files

### `lib/gsap.js`
- Centralized GSAP + ScrollTrigger registration
- Single source of truth for plugin imports
- Guards against server-side execution: `if (typeof window !== 'undefined')`

### `app/globals.css`
- Design tokens (3 color palettes)
- Typography classes
- Button styles
- Reveal animation base classes
- Scrollbar customization

---

## ScrollTrigger Conflict Map

```
Scroll Position:  0vh ─────────── 100vh ─────────── 200vh ─────────── ...
                   │                │                  │
MountainParallax:  ██████████████████████████████████████████████████ (full page)
Hero Parallax:     ████████████████ (hero only, raw scroll listener)
AnimatedText:      ·──────·──────·  (scattered, once-fire, no scrub)
ParallaxDivider:             ·─────· (single section, scrubbed)
```

**No conflicts currently**, but Hero's raw scroll listener should be migrated to GSAP for consistency.

---

## Changelog

### 2026-04-09 — Initial Registry — Full Audit
Complete inventory of all 13 components with animation patterns, Z-index usage, and ScrollTrigger configurations documented. Identified Hero.jsx scroll listener as migration target.

### 2026-05-25 — Parallax & Rooms Upgrades — Enhancement Suite
- Standardized all `MountainParallax` layers (`.mountainLayer`, `.cabinLayer`, `.treesLayer`) to `140%` height to fix widescreen asset alignment.
- Added `.topShadow` vignette overlay for sticky navbar readability.
- Re-architected `Rooms.jsx` to display 3 rooms (Whisperwood, Cloudloft, Amber Hearth), shifted headers/content down to clear sticky navbar, and enabled eager image loading to resolve scroll lag.
- Enhanced booking form redirect to WhatsApp number `919779260517` and made Name/Phone optional for a quick checkout.
