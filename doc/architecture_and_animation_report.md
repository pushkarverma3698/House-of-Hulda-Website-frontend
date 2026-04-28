# Technical Animation & Architecture Report

## 1. Overview & Goal

This report synthesizes animation techniques from four reference websites and maps them to House of Hulda's implementation. It serves as the **technical playbook** for all scroll-driven interactions.

Primary Inspirations: `follow.art`, `duyvenvoorde.nl`, `sequel.co`, `mountain.learnframer.site`

---

## 2. Animation Engine: GSAP + ScrollTrigger + Lenis

### Core Flow
```
User Scrolls → Lenis intercepts → Smooth position calculated → 
GSAP ticker synced → ScrollTrigger evaluates → Animations scrub to position
```

### Lenis → GSAP Sync (Critical)
```jsx
// In LenisProvider.js — Lenis feeds its RAF to GSAP
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
```

### ScrollTrigger Patterns

#### Pattern A: Scrubbed Parallax (continuous)
```jsx
gsap.to(element, {
  y: '25%', ease: 'none',
  scrollTrigger: { trigger, start: 'top top', end: 'bottom top', scrub: true }
});
```
**Used for:** Mountain layers, background images, decorative elements

#### Pattern B: Enter-Once Reveal (triggered)
```jsx
ScrollTrigger.create({
  trigger: element, start: 'top 85%',
  onEnter: () => gsap.to(words, { yPercent: 0, opacity: 1, stagger: 0.05 }),
  once: true
});
```
**Used for:** Text reveals (AnimatedText), stat counters, section headings

#### Pattern C: Pinned Timeline (scroll-driven sequence)
```jsx
gsap.timeline({ scrollTrigger: { trigger, pin: true, scrub: 1, end: '+=3000' } })
  .from(el1, { opacity: 0 })
  .from(el2, { x: 100 })
  .to(el3, { scale: 1.2 });
```
**Used for:** Horizontal scroll sections, manifesto/testimonial sequences

#### Pattern D: Batch Stagger (multiple elements)
```jsx
ScrollTrigger.batch('.grid-item', {
  onEnter: (batch) => gsap.to(batch, { y: 0, opacity: 1, stagger: 0.1 }),
  start: 'top 80%'
});
```
**Used for:** Gallery grids, room cards, feature lists

---

## 3. Text Animation System

### Current: `AnimatedText.js`
- Uses `SplitType` to split into `lines` and `words`
- Words start at `yPercent: 100, opacity: 0`
- On scroll enter (top 85%): animate to `yPercent: 0, opacity: 1`
- Stagger: `0.05s`, duration: `1.2s`, ease: `power4.out`
- Wrapped in overflow-hidden line containers
- Fires once (`once: true`)

### Text Reveal CSS Pattern
```css
.animatedText { overflow: hidden; }
/* SplitType automatically wraps lines in overflow:hidden divs */
/* Words are display:inline-block for individual transform */
```

### Planned Enhancements
- **Character-level animation** for hero titles (stagger: 0.02s per char)
- **Scrubbed text reveals** for pinned story sections
- **Fade-out on exit** for sections that transition to different backgrounds

---

## 4. Image Reveal Techniques

### Clip-Path Reveal (from follow.art + duyvenvoorde)
```jsx
gsap.from(image, {
  clipPath: 'inset(100% 0 0 0)',  // Hidden from bottom
  scale: 1.15,
  duration: 1.2,
  ease: 'power3.inOut',
  scrollTrigger: { trigger: image, start: 'top 80%', once: true }
});
```

### Ken Burns Effect (from sequel.co)
```jsx
gsap.fromTo(heroImage, { scale: 1 }, { scale: 1.1, duration: 25, ease: 'none', repeat: -1, yoyo: true });
```

### Mask Reveal with Color Wipe
```jsx
// Colored overlay slides away to reveal image
gsap.to(overlay, {
  xPercent: 100, duration: 0.8, ease: 'power3.inOut',
  scrollTrigger: { trigger: container, start: 'top 75%', once: true }
});
gsap.from(image, {
  scale: 1.3, duration: 1.2, ease: 'power3.out', delay: 0.4
});
```

---

## 5. Interaction Patterns

### Magnetic Buttons (from duyvenvoorde)
```jsx
onMouseMove: calculate offset from button center → gsap.to(btn, { x: offset*0.3, y: offset*0.3 })
onMouseLeave: gsap.to(btn, { x: 0, y: 0, ease: 'elastic.out(1, 0.3)' })
```

### Custom Cursor
- Small circle (8px) follows mouse with lerp lag
- Scales up (24px) over interactive elements
- Blend-mode: difference (inverts on dark/light backgrounds)

### Hover Image Dim (from sequel)
```jsx
// On grid item hover, dim siblings
onMouseEnter: gsap.to(siblings, { opacity: 0.4, filter: 'blur(2px)', duration: 0.4 })
onMouseLeave: gsap.to(allItems, { opacity: 1, filter: 'blur(0px)', duration: 0.4 })
```

---

## 6. Section Color Transitions (from follow.art)
```jsx
// Background color shifts as user scrolls between sections
gsap.to('body', {
  backgroundColor: '#1A2E1A',  // Dark forest
  scrollTrigger: { trigger: darkSection, start: 'top center', end: 'top top', scrub: true }
});
```

---

## 7. Performance Rules

| DO ✅ | DON'T ❌ |
|-------|---------|
| Animate `transform`, `opacity` | Animate `top`, `left`, `width`, `height` |
| Use `will-change: transform` | Use `will-change` on 50+ elements |
| Use `scrub: true` for scroll-linked | Use `scroll` event listener for parallax |
| Scope ScrollTrigger to component ref | Use `document.body` as trigger |
| Use `useGSAP` hook (auto cleanup) | Manual `gsap.to()` without cleanup |
| Use `gsap.set()` for initial state | Use CSS transitions for scroll effects |

---

*Last updated: 2026-04-09*
