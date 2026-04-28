# Inspiration Website Deep-Dive Analysis

> **Purpose:** This document provides an exhaustive breakdown of the UI, UX, animations, parallax effects, and interaction design found in our four reference websites. Use it as a technical blueprint when implementing new sections.

---

## 1. follow.art (Primary Inspiration) ⭐

**Award:** Awwwards Site of the Day (January 29, 2026)
**Type:** Artist/curator social platform — storytelling-driven showcase
**Overall Feel:** Quiet, intentional, cinematic, gallery-like

### 1.1 Technology Stack
| Technology | Usage |
|------------|-------|
| GSAP + ScrollTrigger | Core animation engine for all scroll-linked effects |
| WebGL (Three.js) | High-performance 3D rendering for hero/background elements |
| React | Component architecture |
| Lenis (or equivalent) | Virtual smooth scrolling for cinematic pacing |
| SplitType/SplitText | Text splitting for word-by-word character animation |
| `will-change: transform` | GPU layer promotion for smooth compositing |

### 1.2 Scroll Architecture
- **Scrollytelling approach:** The page doesn't simply scroll — it *reveals*. Scroll events are intercepted by Lenis and mapped to GSAP timeline progress.
- **Scrubbed timelines:** Each section has a GSAP timeline with `scrub: true`, meaning animation progress is directly tied to scroll position (not triggered on enter/leave).
- **Pinned sections:** Key storytelling moments pin the viewport while internal content transforms (text swaps, image transitions, color shifts).
- **Scroll velocity awareness:** Some effects (like parallax intensity or blur) respond to scroll speed, not just position.

### 1.3 Animation Techniques

#### Text Reveals
- Text is split by **line and word** using SplitType
- Words animate upward (`yPercent: 100 → 0`) from a hidden overflow mask
- Stagger: `0.03-0.05s` per word, creating a typewriter-like wave
- Easing: `power4.out` — fast start, gentle landing
- Lines overflow is hidden via CSS `overflow: hidden` on the line wrapper

```css
/* CSS pattern for text reveal masks */
.line-wrapper {
  overflow: hidden;
  display: block;
}
.word {
  display: inline-block;
  transform: translateY(100%);
  opacity: 0;
}
```

#### Image Transitions
- Images don't simply fade in — they reveal via **animated `clip-path`**:
  - `clip-path: inset(100% 0 0 0)` → `clip-path: inset(0)` (bottom-to-top reveal)
  - Or `clip-path: polygon(...)` for diagonal/custom shapes
- Simultaneous subtle **scale** from `1.15` → `1.0` creates a "settling" effect
- Image containers have `overflow: hidden` to mask the scale

#### Parallax & Layering
- Background imagery moves at ~40-60% scroll speed
- Foreground text moves at 100% (normal)
- Decorative elements move at 120-140% (slight overscroll)
- Creates a palpable sense of **physical depth** between content layers

#### Color Shifts
- Background color transitions between sections using scroll-linked `backgroundColor` tweens
- Dark → light → dark flow guides emotional pacing
- Transitions are smooth (scrubbed), not abrupt

### 1.4 Micro-Interactions
- **Hover on images:** Subtle scale (`1.0 → 1.05`) with a soft box-shadow bloom
- **Hover on links:** Animated underline extends from left-to-right using `scaleX` transform
- **Button hover:** Slight Y lift (`translateY(-2px)`) with shadow deepening
- **Custom cursor:** Not default — likely a small dot that scales up on interactive elements

### 1.5 Key Takeaways for House of Hulda
- ✅ The **cinematic scroll pacing** is exactly what we need for the mountain journey
- ✅ Text reveal pattern (SplitType + overflow mask + stagger) → already implemented in our `AnimatedText.js`
- ✅ Clip-path image reveals → implement for room/gallery images
- ✅ Section-to-section color transitions → implement between mountain and interior sections
- 🔲 WebGL background → adapt concept using our PNG mountain layers instead of 3D

---

## 2. duyvenvoorde.nl (Interaction Masterclass)

**Type:** Premium floristry/nature wholesaler
**Overall Feel:** Lush, organic, tactile, rhythmic

### 2.1 Technology Stack
| Technology | Usage |
|------------|-------|
| GSAP + ScrollTrigger | Pinning, horizontal scroll, staggered reveals |
| Lenis | Buttery-smooth momentum-based scrolling |
| Custom CSS animations | Micro hover effects |

### 2.2 Key Animation Patterns

#### Horizontal Scroll Sections
- A vertical scroll section is **pinned** (`pin: true`) while content scrolls horizontally
- Implementation: Container with `display: flex`, content wider than viewport, `x` tween linked to scroll

```jsx
// Concept for horizontal scroll in GSAP
gsap.to(horizontalPanel.current, {
  x: () => -(horizontalPanel.current.scrollWidth - window.innerWidth),
  ease: 'none',
  scrollTrigger: {
    trigger: sectionRef.current,
    pin: true,
    scrub: 1,
    end: () => '+=' + horizontalPanel.current.scrollWidth,
  }
});
```

#### Masked Image Reveals (`reveal-from-cover`)
- Images start with `clip-path: inset(0 100% 0 0)` (fully clipped from right)
- On scroll entry: `clip-path: inset(0 0% 0 0)` (fully revealed)
- Overlaid with a colored `::after` pseudo-element that slides away simultaneously

#### Magnetic Buttons
- Button tracking: on `mousemove`, calculate offset from button center
- Button DOM element translates slightly toward cursor position
- On `mouseleave`, spring-back to origin with elastic easing

```jsx
// Magnetic button concept
const onMouseMove = (e) => {
  const rect = btnRef.current.getBoundingClientRect();
  const x = e.clientX - rect.left - rect.width / 2;
  const y = e.clientY - rect.top - rect.height / 2;
  gsap.to(btnRef.current, {
    x: x * 0.3,
    y: y * 0.3,
    duration: 0.4,
    ease: 'power2.out',
  });
};

const onMouseLeave = () => {
  gsap.to(btnRef.current, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.3)' });
};
```

#### Staggered Grid Reveals
- Grid items enter with `y: 40, opacity: 0` → `y: 0, opacity: 1`
- Stagger: `0.1s` per item
- Uses `ScrollTrigger.batch()` for performance with many elements

#### Cursor-Following Hover Media
- When hovering list items, a floating image/video appears near the cursor
- Image follows cursor position with slight lag (lerp)
- Different image per list item

### 2.3 Typography & Spacing
- **Bold, oversized headlines** with extreme negative space
- Brutalist-yet-elegant — heavy font weight, generous line-height
- Whitespace is used aggressively to force focus on singular elements
- Section padding: often 120-180px vertical

### 2.4 Key Takeaways for House of Hulda
- ✅ Magnetic buttons → implement on "Book a Stay" CTAs
- ✅ Mask-reveal for images → implement on property photos
- ✅ Horizontal scroll → could work for room showcase carousel
- ✅ Staggered batch reveals → implement on gallery grid
- ✅ Extreme whitespace philosophy → already aligned with our design tokens

---

## 3. sequel.co (Premium Polish)

**Type:** Digital family office for athletes & entrepreneurs
**Overall Feel:** Ultra-premium, dark, epic, cinematic

### 3.1 Key Animation Patterns

#### Ken Burns Background Images
- Hero images have continuous slow zoom: `scale: 1 → 1.1` over 20-30 seconds
- Combined with slight `y` drift for depth
- Creates a living, breathing hero section even without user scroll

```jsx
// Ken Burns effect
gsap.fromTo(heroImage.current,
  { scale: 1 },
  { scale: 1.1, duration: 25, ease: 'none', repeat: -1, yoyo: true }
);
```

#### Animated Counter Numbers
- Stats/numbers count up from 0 to final value on scroll entry
- Uses `gsap.to()` with `snap: { innerText: 1 }` for integer counting
- Combined with `+` or `$` prefix/suffix text

#### Foreground/Background Parallax Split
- Large hero text sits in the foreground at 100% scroll speed
- Background image moves at ~70% scroll speed
- The divergence creates a "floating text" effect

#### Micro-Interactions
- Links have animated underlines (scaleX from 0 → 1 on hover)
- Cards have subtle Y-lift and shadow on hover
- Image grids: hovering one card slightly dims/blurs others

#### Manifesto Animation (Text Carousel)
- "We believe in..." section cycles through phrases
- Each phrase fades/slides out as the next enters
- Scroll-driven: tied to scroll position within a pinned section

### 3.2 Typography
- Very refined serif + sans pairing
- Display text: uppercase, wide letter-spacing, dramatic sizing
- Body: lightweight sans-serif for contrast with heavy headlines

### 3.3 Key Takeaways for House of Hulda
- ✅ Ken Burns on hero imagery → implement for mountain hero
- ✅ Counting numbers → implement for stats (2k meters, 4 rooms, etc.)
- ✅ Text/image parallax split → already conceptually in our Hero
- ✅ Card dim-on-hover → implement in Rooms grid
- ✅ Pinned text cycling → could use for guest testimonials

---

## 4. mountain.learnframer.site (Parallax Blueprint)

**Type:** Demonstration of mountain parallax effect in Framer
**Overall Feel:** Dramatic, layered, depth-rich

### 4.1 Layer Architecture (Critical Reference)

The effect uses **4-5 distinct layers** stacked with `position: absolute`:

| Layer | Content | Scroll Speed | Z-Index |
|-------|---------|--------------|---------|
| 1 (Deepest) | Sky gradient / distant haze | 30-40% of scroll | 1 |
| 2 | Distant snow-capped mountains | 50-60% of scroll | 2 |
| 3 | Mid-ground terrain / house | 70-80% of scroll | 3 |
| 4 (Nearest) | Foreground trees / rocks | 110-130% of scroll | 4 |
| Text | Title / CTA | 100% (normal) | 5 |

### 4.2 Implementation Technique
- Container: `position: relative; overflow: hidden; height: 100vh`
- Each layer: `position: absolute; inset: 0` with oversized height/width (120-150%)
- Scroll speed variation achieved via different `y` tween values in ScrollTrigger
- The key insight: **background layers move DOWN (positive Y); foreground layers move UP (negative Y)**

```
Scroll Direction: ↓ (user scrolls down)

Background (z:1):  Moves DOWN at 25% → appears to stay in place / drift slowly
Mid-ground (z:3):  Moves UP at -15% → appears to scroll normally
Foreground (z:5):  Moves UP at -45% → appears to rush past the viewer
```

### 4.3 Visual Transitions
- As user scrolls past the hero, mountain layers separate, revealing content beneath
- Bottom of hero has a gradient fade overlay to blend into the content section
- Mist overlay with `mix-blend-mode: screen` adds atmospheric haze between layers

### 4.4 Key Takeaways for House of Hulda
- ✅ Our `MountainParallax.js` already implements this pattern with SVGs
- 🔲 **Upgrade needed:** Replace SVGs with photorealistic PNG layers (see `doc/nano_banana_prompts.md`)
- ✅ Layer speed ratios documented: bg +25%, mid -15%, fg -45%
- ✅ Gradient fade overlay at bottom → already in `Hero.jsx` as `fadeOverlay`

---

## Summary: Combined Animation Playbook for House of Hulda

| Technique | Source | Priority | Status |
|-----------|--------|----------|--------|
| Multi-layer parallax (mountains) | mountain.learnframer | 🔴 P0 | ✅ SVG version done |
| Text word reveals (SplitType + stagger) | follow.art | 🔴 P0 | ✅ AnimatedText.js done |
| Smooth scroll (Lenis) | all sites | 🔴 P0 | ✅ LenisProvider.js done |
| Clip-path image reveals | follow.art + duyvenvoorde | 🟡 P1 | 🔲 Not yet |
| Magnetic buttons | duyvenvoorde | 🟡 P1 | 🔲 Not yet |
| Ken Burns hero image | sequel | 🟡 P1 | 🔲 Not yet |
| Counting stat numbers | sequel | 🟢 P2 | 🔲 Not yet |
| Horizontal scroll rooms | duyvenvoorde | 🟢 P2 | 🔲 Not yet |
| Custom cursor | follow.art + duyvenvoorde | 🟢 P2 | 🔲 Not yet |
| Section color transitions | follow.art | 🟢 P2 | 🔲 Not yet |
| Cursor-following hover images | duyvenvoorde | 🔵 P3 | 🔲 Not yet |
| WebGL particle effects (snow/mist) | follow.art | 🔵 P3 | 🔲 Not yet |

---

*Last updated: 2026-04-09*
