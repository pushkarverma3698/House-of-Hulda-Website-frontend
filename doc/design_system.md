# House of Hulda — Design System

> **Source of Truth:** `app/globals.css`
> This document maps every design token and utility class available in the system.

---

## 1. Color Palettes

The site supports **three switchable color palettes** via `data-palette` attribute on `<html>`. Palette A is the default.

### Palette A: Misty Deodar (Default)
| Token | Value | Usage |
|-------|-------|-------|
| `--forest-deep` | `#1A2E1A` | Primary dark green (nav bg, hero overlays) |
| `--deodar` | `#3D5A3D` | Mid-green (mountain mid-layers, accents) |
| `--cedar` | `#C4956A` | Warm brown/gold (accent, hover states) |
| `--parchment` | `#E8DDD0` | Warm off-white (alt backgrounds) |
| `--mist` | `#D4DCD4` | Cool grey-green (distant mountains, fog) |
| `--snow` | `#F5F2ED` | Primary background (warm white) |
| `--ink` | `#1C1C1C` | Primary text color |
| `--moss` | `#6B7F5E` | Muted green (body text accents, borders) |
| `--lantern` | `#D4A76A` | Warm gold (accent light, CTAs) |

### Palette B: Monsoon Cedar
| Token | Value | Usage |
|-------|-------|-------|
| `--bg` | `#F0E8DC` | Warm parchment background |
| `--bg-alt` | `#E0E5E0` | Soft sage alternate |
| `--primary` | `#1F2B1F` | Deep forest text |
| `--accent` | `#A67C52` | Earthen brown |
| `--green` | `#2C3E2C` | Dark evergreen |

### Palette C: Alpine Hearth
| Token | Value | Usage |
|-------|-------|-------|
| `--bg` | `#F5F5F0` | Clean alpine white |
| `--bg-alt` | `#EAEAE5` | Soft stone |
| `--primary` | `#1F2B1F` | Deep forest |
| `--accent` | `#B8845A` | Golden cedar |
| `--green` | `#4A6741` | Bright pine |

### Semantic Aliases (Active Palette)
These always resolve to the current palette:
```css
--bg:           var(--snow);
--bg-alt:       var(--parchment);
--primary:      var(--forest-deep);
--accent:       var(--cedar);
--accent-light: var(--lantern);
--green:        var(--deodar);
--green-light:  var(--moss);
--text:         var(--ink);
--border:       rgba(61,90,61,0.15);
--nav-bg:       rgba(26,46,26,0.0);
```

### Usage Rules
- **Never hardcode hex values** in components — always use `var(--token)`
- Use `color-mix(in srgb, var(--text), transparent 25%)` for muted text
- Selection highlight: `var(--accent)` background, `var(--snow)` text

---

## 2. Typography

### Font Stack
```css
--font-serif: 'Playfair Display', Georgia, serif;       /* Headlines */
--font-sans:  'Inter', system-ui, sans-serif;           /* Body text */
--font-ui:    'Outfit', system-ui, sans-serif;          /* UI labels, buttons */
```

### Scale
| Class | Font | Size | Weight | Line Height | Letter Spacing |
|-------|------|------|--------|-------------|----------------|
| `.display` | Serif | `clamp(3rem, 7vw, 6.5rem)` | 500 | 1.05 | -0.01em |
| `.heading-xl` | Serif | `clamp(2rem, 4vw, 3.5rem)` | 500 | 1.15 | -0.01em |
| `.heading-lg` | Serif | `clamp(1.6rem, 3vw, 2.5rem)` | 500 | 1.2 | — |
| `.heading-md` | Serif | `clamp(1.2rem, 2vw, 1.75rem)` | 500 | — | — |
| `.eyebrow` | UI | `0.8rem` | 500 | — | 0.18em (uppercase) |
| `.body-lg` | Sans | `clamp(1rem, 1.5vw, 1.15rem)` | 400 | 1.75 | — |

### Rules
- Headlines always use `font-family: var(--font-serif)`
- Body text always uses `font-family: var(--font-sans)`
- Buttons and labels use `font-family: var(--font-ui)`
- `.eyebrow` is always `text-transform: uppercase` with `letter-spacing: 0.18em`
- `.display` text color is typically `var(--primary)` or `var(--snow)` on dark backgrounds

---

## 3. Spacing & Layout

### Container
```css
.container {
  width: 100%;
  max-width: 1240px;
  margin: 0 auto;
  padding: 0 clamp(1.5rem, 5vw, 4rem);
}
```

### Section Spacing
```css
--section-py: clamp(5rem, 10vw, 9rem);

.section { padding: var(--section-py) 0; }
.section-alt { background: var(--bg-alt); }
```

### Border Radius
```css
--r-sm: 4px;    /* Small elements, input fields */
--r-md: 12px;   /* Cards, image containers */
--r-lg: 24px;   /* Large cards, modals */
--r-xl: 40px;   /* Hero elements, special features */
```

### Buttons use `border-radius: 100px` (pill shape)

---

## 4. Buttons

### Primary Button (`.btn-primary`)
- Background: `var(--primary)` → hover: `var(--accent)`
- Color: `var(--snow)`
- Padding: `0.875rem 2.25rem`
- Border-radius: `100px` (pill)
- Hover: `translateY(-2px)` + `box-shadow: 0 12px 32px rgba(0,0,0,0.2)`
- Transition: `0.3s var(--ease)`

### Outline Button (`.btn-outline`)
- Background: transparent → hover: `var(--primary)`
- Border: `1.5px solid var(--primary)`
- Hover: color shifts to `var(--snow)`, bg fills

### Ghost Button (`.btn-ghost`)
- Text only with bottom border
- Hover: gap between text and arrow widens (`0.5rem → 0.9rem`)

---

## 5. Animation Tokens

### Easing Curves
```css
--ease:        cubic-bezier(0.25, 0.46, 0.45, 0.94);  /* General smooth */
--ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);     /* Playful overshoot */
```

### GSAP Easing Map
| Effect | GSAP Ease | Duration |
|--------|-----------|----------|
| Text reveal (words) | `power4.out` | 1.2s |
| Image enter | `power3.inOut` | 0.8-1.0s |
| Button hover | `power2.out` | 0.3-0.4s |
| Magnetic snap-back | `elastic.out(1, 0.3)` | 0.6s |
| Parallax scrub | `none` (linear) | scrubbed |
| Section fade | `power2.inOut` | 0.6s |

### Reveal Animation Base
```css
.reveal {
  opacity: 0;
  transform: translateY(40px);
  transition: opacity 0.8s var(--ease), transform 0.8s var(--ease);
}
.reveal.visible {
  opacity: 1;
  transform: translateY(0);
}
```

### Stagger Delays
```css
.reveal-delay-1 { transition-delay: 0.15s; }
.reveal-delay-2 { transition-delay: 0.3s; }
.reveal-delay-3 { transition-delay: 0.45s; }
.reveal-delay-4 { transition-delay: 0.6s; }
```

---

## 6. Scrollbar & Selection

### Custom Scrollbar
```
Width: 6px
Track: var(--bg)
Thumb: var(--green-light)
Thumb hover: var(--green)
```

### Text Selection
```
Background: var(--accent)
Color: var(--snow)
```

---

## 7. Responsive Breakpoints

| Name | Width | Key Changes |
|------|-------|-------------|
| Desktop | >1024px | Full parallax, all animations, custom cursors |
| Tablet | 768-1024px | Reduced parallax layers, simplified hover |
| Mobile | <768px | No parallax, native scroll, simple fades |

---

*This document mirrors `globals.css`. If tokens change there, update here.*
*Last updated: 2026-04-09*
