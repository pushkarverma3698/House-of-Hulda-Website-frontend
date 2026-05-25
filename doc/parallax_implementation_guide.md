# Mountain Parallax Implementation Guide

> **Component:** `components/MountainParallax.js` | **CSS:** `components/MountainParallax.module.css`

---

## 1. Architecture Overview

Multi-layer parallax creates depth by moving stacked visual layers at different scroll speeds.

```
Z:50  Navigation Bar (fixed)
Z:30  Mist/Fog Overlay (opacity animated)
Z:20  Foreground Deodar Trees (y: -45%)    ← Fastest UP
Z:10  Content Layer (normal scroll)
Z:5   Mid-ground Hills + Cabin (y: -15%)
Z:0   Background Mountains (y: +25%)       ← Slowest DOWN
```

---

## 2. Layer Specs

| Layer | z-index | Height | GSAP y | Speed |
|-------|---------|--------|--------|-------|
| Background Mountains | 0 | 120vh | +25% | Slowest (drifts down) |
| Mid-ground Hills+Cabin | 5 | 120vh | -15% | Medium |
| Content | 10 | auto | normal | Reference point |
| Foreground Trees | 20 | 150vh | -45% | Fastest (rushes up) |
| Mist Overlay | 30 | 60vh | opacity fade | Atmospheric |

### ScrollTrigger Config (All Layers)
```jsx
{ trigger: containerRef.current, start: 'top top', end: 'bottom top', scrub: true, ease: 'none' }
```

---

## 3. Current SVG Implementation

- Background: 3 mountain paths with gradients (`skyGrad`, `peakGrad1`, `baseGrad1`)
- Mid-ground: Rolling hill curves + `DetailedCabin` SVG component with glowing windows & animated chimney smoke
- Foreground: `InfographicDeodar` tree components clustered left/right edges
- All layers use `position: absolute` within a `position: relative` wrapper

---

## 4. PNG Upgrade Path

Replace SVGs with photorealistic transparent PNGs (see `doc/nano_banana_prompts.md`):

| File | Format | Purpose |
|------|--------|---------|
| `public/mountains/parallax-bg.jpg` | JPG 16:9 | Himalayan peaks + sky |
| `public/mountains/parallax-house.png` | PNG transparent | Kath Kuni cabin |
| `public/mountains/parallax-fg-trees.png` | PNG transparent | Deodar tree silhouettes |
| `public/mountains/parallax-mist.png` | PNG on black | Fog (use `mix-blend-mode: screen`) |

### Image Layer CSS
```css
.layerImage { width: 100%; height: 100%; object-fit: cover; will-change: transform; }
.mistImage { opacity: 0.5; mix-blend-mode: screen; }
```

---

## 5. Performance

- `will-change: transform` on all animated layers
- `pointer-events: none` on decorative layers
- `overflow: hidden` on wrapper to prevent horizontal scroll
- Call `ScrollTrigger.refresh()` after images load
- Mobile: disable parallax entirely, use static background fallback

## 6. Troubleshooting

| Problem | Fix |
|---------|-----|
| Jitter on scroll | Sync Lenis RAF with ScrollTrigger.update() |
| Wrong positions after refresh | ScrollTrigger.refresh() after image onLoad |
| Trees blocking clicks | pointer-events: none on fg layer |
| White gap below | Increase layer height to 150vh+ |

---

*Last updated: 2026-04-09*
