# Claude / AI Assistant Rules — House of Hulda

This file configures Claude (and similar AI assistants like Cursor, Gemini, Copilot) to seamlessly integrate with the House of Hulda web application environment.

---

## 🏔 Project Overview

**House of Hulda** is a luxury Himalayan homestay website for a property in **Naggar, Manali, Himachal Pradesh**. The web experience must be **Awwwards-tier** — deeply immersive, scroll-driven, and cinematic. Think `follow.art` meets mountain editorial photography.

### Key Inspirations (Ranked by Influence)
1. **follow.art** — Primary: scroll-driven storytelling, text reveals, cinematic pacing, WebGL depth
2. **mountain.learnframer.site** — Parallax: multi-layer mountain depth effect with foreground/background separation
3. **duyvenvoorde.nl** — Interactions: magnetic buttons, horizontal scroll sections, masked image reveals
4. **sequel.co** — Polish: Ken Burns image scaling, premium typography, minimal interface

---

## 🎨 Theme Instructions

### Emotional Core
The user should feel they are **physically entering the Himalayas** as they scroll. Cold mountain air, warm wooden interiors, mist curling through deodar pines, golden evening light through cabin windows.

### Visual Rules
- Heavy utilization of **multi-layer parallax** (mountains, house, trees, mist — each at different scroll speeds)
- Color palette derived from nature: Deodar greens, mountain mist whites, cedar wood browns, dark alpine slates
- **Film grain texture** overlaid on hero images for an editorial photography feel
- **Volumetric mist/fog** layers using semi-transparent gradients or animated PNGs
- All imagery should feel like a **National Geographic Himalayan photo essay**

### Typography Rules
- **Display/Headlines:** Playfair Display (serif) — elegant, editorial, weight 500
- **Body/UI:** Inter (sans-serif) — clean, readable, weight 300-500
- **Labels/Eyebrows:** Outfit — modern, uppercase with wide letter-spacing
- Headlines use `clamp()` for fluid sizing: `clamp(3rem, 7vw, 6.5rem)` for display
- Line height: 1.05 for display, 1.15-1.2 for headings, 1.6-1.75 for body

### Spacing Rules
- Sections separated by generous `clamp(5rem, 10vw, 9rem)` vertical padding
- Container max-width: 1240px, centered
- Elements should **breathe** — when in doubt, add more whitespace
- Never let content feel cramped; mountain air demands open space

See `doc/prompt_theme_naggar.md` for the full thematic rulebook.

---

## ⚙️ Technical Instructions

### Stack (Strictly Enforced)
- **Next.js 16+** (App Router, React 19) — `'use client'` on interactive components
- **GSAP 3.14+** with ScrollTrigger — all scroll-linked animations
- **Lenis** — virtual smooth scrolling (replaces native scroll)
- **SplitType** — text splitting for word/line reveal animations
- **CSS Modules** — component-scoped styling (NOT Tailwind)
- **CSS Custom Properties** — all design tokens in `globals.css :root`

### Animation Architecture
When generating React components, always:

1. **Modularize animations.** Use independent `useRef` arrays and `useGSAP` to manage scopes and avoid memory leaks.
2. **Prefer GPU-accelerated properties.** Only animate `transform` (translate, scale, rotate) and `opacity`. Never animate width/height/top/left.
3. **Use `clip-path` for reveals.** Instead of generic fade-ins, reveal images with animated `clip-path: inset()` or `polygon()`.
4. **Scrub, don't trigger.** For scroll-linked effects, use `scrub: true` so animation progress maps directly to scroll position.
5. **Stagger entries.** Text and grid items should enter with `stagger: 0.05-0.15` delays for rhythm.
6. **Avoid plain HTML scrollbars.** Assume Lenis is providing the scrolling context.

### GSAP Import Pattern (Required)
```jsx
// Always import from the centralized config:
import { gsap, ScrollTrigger } from '../lib/gsap';
import { useGSAP } from '@gsap/react';
```

### Lenis + GSAP Sync
The `LenisProvider.js` wraps the entire app. GSAP ScrollTrigger is automatically aware of the smooth scroll position. If you add new scroll-dependent features, ensure they work within the Lenis RAF loop.

---

## 🧠 Memory & Workflow

### Before Every Task
1. **Check `/doc` first.** Before replying to styling, animation, or structural tasks, read the relevant reference material in `/doc`.
2. **Check existing components.** Run through `doc/component_registry.md` to see what already exists and how it's animated.
3. **Check the Z-Index map.** Parallax layers have strict Z-ordering. See `AGENTS.md` > Parallax Z-Index System.

### During Tasks
4. **Ask clarifying questions** regarding Z-Index layering if the user proposes overlapping mountain graphics with textual content.
5. **Never break existing ScrollTriggers** without notifying the user first.
6. **Track animation timelines** — if a component uses ScrollTrigger with `pin: true`, no other trigger should overlap that scroll range.

### After Every Task
7. **Update `doc/component_registry.md`** if you created or modified a component.
8. **Update this file (`CLAUDE.md`)** if you discovered a new pattern or constraint worth preserving.
9. **Test mentally:** Would this animation run at 60fps? Does it use only `transform`/`opacity`?

---

## ✍️ Coding Standards

### Component Export Pattern
```jsx
// Named arrow function, default export
export default function ComponentName() { }

// For sub-components within the same file:
const SubComponent = ({ prop }) => { };
```

### CSS Module Conventions
```css
/* BEM-inspired naming within modules */
.wrapper { }           /* Root element */
.title { }             /* Primary text */
.imageWrap { }         /* Image container */
.grid { }              /* Layout grid */
.stat { }              /* Repeated item */
.statNumber { }        /* Child of repeated item */
```

### Animation Documentation
Document any complex GSAP timeline with inline comments explaining timings:
```jsx
useGSAP(() => {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: containerRef.current,
      start: 'top 80%',     // Fires when top of element hits 80% viewport
      end: 'bottom 20%',    // Ends when bottom hits 20% viewport
      scrub: 1.5,           // Smooth scrub with 1.5s lag
    }
  });

  // Phase 1: Title fades up (0→0.3 progress)
  tl.from(titleRef.current, { y: 60, opacity: 0, duration: 0.3 });

  // Phase 2: Image reveals via clip-path (0.2→0.6 progress)
  tl.from(imageRef.current, {
    clipPath: 'inset(100% 0 0 0)',
    duration: 0.4,
  }, '-=0.1'); // Overlap by 0.1
}, { scope: containerRef });
```

### Responsive Priority
- **Desktop first** — all parallax, custom cursors, magnetic effects, full animation
- **Mobile graceful degradation** — disable parallax, simplify to fade-up reveals, use native scroll
- Media queries: `@media (max-width: 768px)` for mobile overrides

---

## 🔁 Auto-Improvement Protocol

This file is a **living document**. After every development session:

1. If you learned something new about this codebase → **add it here**
2. If you found a bug pattern → **add a warning here**
3. If you discovered a better animation technique → **update the technique description**
4. If a new dependency was added → **update the tech stack section**

```
Changelog:
─────────────────────────────────────────────────
2026-04-09  Initial comprehensive version created
            - Full theme, technical, and workflow documentation
            - Inspiration site analysis integrated
            - Parallax layer system documented
─────────────────────────────────────────────────
```
