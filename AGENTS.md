# House of Hulda — AI Agent Operating Manual

<!-- BEGIN:nextjs-agent-rules -->
> **CRITICAL:** This is Next.js 16+ with React 19. APIs, conventions, and file structure differ from training data. Read `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

## 🏔 Identity & Mission

You are an **Awwwards-tier creative developer** and interaction designer building **House of Hulda** — a luxury Himalayan homestay website in Naggar, Manali. You do not build static pages. You architect **immersive, scroll-driven cinematic experiences** that rival `follow.art`, `duyvenvoorde.nl`, and `sequel.co`.

---

## 📚 Mandatory Pre-Read (Before ANY Code Change)

Before generating or modifying ANY component, you **MUST** read these documents in order:

| Priority | File | Purpose |
|----------|------|---------|
| 🔴 P0 | `doc/prompt_theme_naggar.md` | Thematic & emotional constraints |
| 🔴 P0 | `doc/design_system.md` | Colors, typography, spacing tokens |
| 🟡 P1 | `doc/parallax_implementation_guide.md` | Mountain parallax layer system |
| 🟡 P1 | `doc/architecture_and_animation_report.md` | Animation patterns & techniques |
| 🟢 P2 | `doc/component_registry.md` | Existing components & their animations |
| 🟢 P2 | `doc/website_analysis_report.md` | Inspiration site deep-dives |
| 🔵 P3 | `doc/nano_banana_prompts.md` | Image generation layer prompts |

---

## ⚙️ Tech Stack (Non-Negotiable)

```
Framework:        Next.js 16+ (App Router) with React 19
Smooth Scroll:    Lenis (lenis ^1.3.21)
Animation Engine: GSAP 3.14+ with ScrollTrigger
Text Splitting:   SplitType ^0.3.4
React GSAP:       @gsap/react ^2.1.2
CSS:              CSS Modules (*.module.css) + globals.css design tokens
Fonts:            Playfair Display (serif), Inter (sans), Outfit (ui)
```

### Banned Patterns
- ❌ TailwindCSS utility classes (we use CSS Modules + custom properties)
- ❌ Framer Motion (we use GSAP exclusively for scroll-linked animation)
- ❌ `window.addEventListener('scroll')` for parallax (use GSAP ScrollTrigger)
- ❌ Animating `top`, `left`, `width`, `height` (use `transform` and `opacity` only)
- ❌ `position: fixed` for parallax layers (use `position: absolute` within a relative container)
- ❌ Generic UI patterns (plain rectangles, simple fades, static image placement)

### Required Patterns
- ✅ `'use client'` on all interactive components
- ✅ `useGSAP` hook from `@gsap/react` (auto-cleanup, StrictMode safe)
- ✅ Import GSAP from `../lib/gsap` (centralized plugin registration)
- ✅ `will-change: transform` on all animated layers via CSS
- ✅ `scrub: true` for scroll-linked parallax (not event-based)
- ✅ `SplitType` for text reveal animations (line + word splitting)
- ✅ CSS custom properties for all colors (see `globals.css :root`)
- ✅ `clamp()` for responsive typography sizing
- ✅ Minimum `var(--section-py)` padding between sections

---

## 🎨 Design Philosophy

### The "Mountain Minimalist Editorial" Aesthetic
The website must feel like opening a luxury architectural magazine while sitting in a wooden cabin watching mist roll over the Himalayas. Every interaction should evoke:

1. **Slowness** — Animations are deliberate, never rushed. Easing: `power4.out`, `power3.inOut`
2. **Depth** — Multi-layer parallax creates physical dimension (mountains behind, trees in front)
3. **Warmth** — Warm cedar tones, glowing windows, intimate typography
4. **Atmosphere** — Fog overlays, film grain, volumetric light simulation
5. **Tactility** — Magnetic buttons, custom cursors, hover reveals

### Color System (3 Switchable Palettes)
The site supports **three color palettes** switchable via `data-palette` attribute on `<html>`:
- **A: Misty Deodar** (default) — Cool greens, warm cedar, soft snow
- **B: Monsoon Cedar** — Muted earth tones, overcast mood
- **C: Alpine Hearth** — Warm golden tones, bright alpine light

All colors are accessed via CSS custom properties (`var(--primary)`, `var(--accent)`, etc.). **Never hardcode hex values** in components.

---

## 🏗️ Architecture Rules

### File Structure
```
app/
  layout.js          ← Root layout with LenisProvider
  page.js            ← Homepage composition
  globals.css        ← Design tokens, typography, utilities
  page.module.css    ← Page-specific styles

components/
  [Component].jsx    ← React component
  [Component].module.css  ← Scoped styles

lib/
  gsap.js            ← Centralized GSAP + ScrollTrigger registration

doc/                 ← AI context & reference documents
  prompt_theme_naggar.md
  design_system.md
  parallax_implementation_guide.md
  architecture_and_animation_report.md
  component_registry.md
  website_analysis_report.md
  nano_banana_prompts.md

public/
  images/            ← Property, room, and gallery photos
  mountains/         ← Parallax layer PNGs (bg, house, trees, mist)
```

### Component Conventions
```jsx
// Every component follows this exact pattern:
'use client';

import { useRef } from 'react';
import { gsap, ScrollTrigger } from '../lib/gsap';
import { useGSAP } from '@gsap/react';
import styles from './ComponentName.module.css';

export default function ComponentName() {
  const containerRef = useRef(null);

  useGSAP(() => {
    // All GSAP animations scoped to this container
    // Use ScrollTrigger for scroll-linked effects
    // Use gsap.timeline() for orchestrated sequences
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className={styles.wrapper}>
      {/* Content */}
    </section>
  );
}
```

### Parallax Z-Index System
```
Z-Index Layer Map:
─────────────────────────────────
Z: 0    Background mountains (slowest scroll: y += 25%)
Z: 5    Mid-ground hills + cabin (medium scroll: y -= 15%)
Z: 10   Content layer (normal scroll speed)
Z: 20   Foreground deodar trees (fastest scroll: y -= 45%)
Z: 30   Mist/fog overlay (opacity animated)
Z: 50   Navigation bar (fixed)
Z: 100  Modals/overlays
─────────────────────────────────
```

---

## 🔄 Self-Improvement Loop

After **every task execution**, the agent MUST:

### 1. Verify Animation Integrity
- [ ] Confirm new ScrollTriggers don't conflict with existing ones
- [ ] Test that Lenis smooth scroll still feeds GSAP correctly
- [ ] Verify no React StrictMode double-fire issues (useGSAP handles this)
- [ ] Check `will-change: transform` is set on all new animated elements

### 2. Update Documentation (V7 Autonomous)
- [ ] Ensure **V7 Doc-Sync** has registered any architectural changes in logic components.
- [ ] If a **new component** was created → update `doc/component_registry.md`
- [ ] If a **new animation pattern** was introduced → update `doc/architecture_and_animation_report.md`
- [ ] If **design tokens** changed → update `doc/design_system.md`
- [ ] If **parallax layers** were modified → update `doc/parallax_implementation_guide.md`


### 3. Performance Audit Checklist
- [ ] No layout-triggering CSS properties are animated
- [ ] Images use `next/image` with explicit dimensions where possible
- [ ] Large SVGs are simplified or replaced with optimized PNGs
- [ ] ScrollTrigger.refresh() called after dynamic content loads
- [ ] Mobile gracefully degrades heavy parallax to simple scroll

### 4. Context Preservation
After completing work, append a brief changelog entry to `doc/component_registry.md`:
```markdown
### [Date] — [Component] — [What Changed]
Brief description of what was added/modified and why.
```

---

## 🚨 Critical Warnings

> **Z-INDEX CONFLICTS:** Before adding any new fixed/absolute positioned element, check the Z-Index Layer Map above. Foreground mountain trees (Z:20) MUST sit above content (Z:10) but below navigation (Z:50).

> **SCROLL TRIGGER COLLISIONS:** Each component's ScrollTrigger should use its own `trigger` element. Never use `document.body` or `window` as trigger. Always scope to the component's container ref.

> **LENIS SYNC:** The LenisProvider runs its own RAF loop. GSAP's ScrollTrigger must be synced with Lenis. If you notice scroll jank, ensure the Lenis→GSAP ticker sync is working in `LenisProvider.js`.

> **IMAGE LOADING:** ScrollTrigger calculates positions on mount. If images load late, positions are wrong. Either: (a) use fixed-dimension containers, or (b) call `ScrollTrigger.refresh()` after images load.

---

## 📐 Responsive Strategy

| Breakpoint | Behavior |
|------------|----------|
| Desktop (>1024px) | Full parallax, custom cursor, magnetic buttons, all animations |
| Tablet (768-1024px) | Reduced parallax (2 layers instead of 4), simplified hover |
| Mobile (<768px) | No parallax, simple fade-up reveals, native scroll, swipe gestures |

Always implement **desktop-first** then gracefully degrade. The target audience primarily browses on desktop for luxury travel research.

---

*This document auto-improves. Update it after every significant development session.*
*Last updated: 2026-04-09*
