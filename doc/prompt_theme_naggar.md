# Prompt Theme: Naggar & The Himalayas — House of Hulda

> **Usage:** Read this document BEFORE generating or modifying ANY UI component. It defines the emotional and atmospheric constraints that every visual decision must align with.

---

## 1. The Emotional Core

The user browsing this website should feel as if they are **physically entering the Himalayas**. Each scroll tick is a step deeper into the mountains. The journey progresses:

1. **Above the clouds** → Hero section: vast, epic, tiny-human-in-big-nature feeling
2. **Approaching the village** → About section: warmth begins, wood textures appear
3. **Inside the cabin** → Rooms section: intimate, golden light, crackling fire
4. **Exploring the landscape** → Experience section: adventure, rivers, trails, deodar forests
5. **Remembering** → Gallery/Testimonials: nostalgia, soft tones, editorial photography
6. **Deciding to return** → Booking CTA: warm invitation, urgency without pressure

### Sensory Palette
| Sense | What the User Should Feel |
|-------|--------------------------|
| Sight | Mist curling through deodar pines, snow on distant peaks, golden window glow |
| Sound | Silence broken only by wind through pine needles (imagined through pacing) |
| Touch | Rough hewn wood, warm wool blankets, cold mountain air on face |
| Smell | Cedar smoke, pine resin, wet earth after rain |
| Temperature | Cold outside, warm inside — the contrast is the entire brand |

---

## 2. Visual & Atmospheric Guidelines

### Photography Style
- **National Geographic meets Architectural Digest** — not Instagram filters
- Deep, moody shadows with selective warm light (golden hour or firelight)
- Allow negative space — sky, fog, and empty landscape are features, not gaps
- Humans appear small against the landscape (emphasizes scale of mountains)
- Interior shots show texture: wood grain, stone walls, woven fabrics

### Texture & Grain
- Apply subtle **film grain** overlay (1-3% opacity) on hero/gallery images
- Use **CSS `backdrop-filter: blur()`** on overlapping elements for frosted glass
- Background images should have slight desaturation (90% saturation) for editorial feel

### Atmospheric Effects
- **Mist/Fog:** Semi-transparent gradient overlays between parallax layers
- **Volumetric light:** Simulated with radial gradients from windows in evening scenes
- **Chimney smoke:** Animated SVG path or CSS-animated particle (already in `DetailedCabin`)

---

## 3. Animation & UX Directives

### Pacing Rules
| Interaction | Speed | Feel |
|-------------|-------|------|
| Page scroll | Slow, smooth | Walking through a forest |
| Text reveal | 1.2s per batch | Words settling like snowfall |
| Image reveal | 0.8-1.0s | Fog clearing to reveal a view |
| Button hover | 0.3s | Touching warm wood |
| Section transition | Gradual (scrubbed) | Time of day changing |
| Parallax layers | Continuous | Looking out a moving window |

### The "Scroll = Journey" Metaphor
The scroll should never feel like scrolling a webpage. It should feel like:
- **Act 1 (Hero):** Standing at a mountain overlook — vast, quiet, epic
- **Act 2 (About/Rooms):** Walking down a forest trail toward a glowing cabin
- **Act 3 (Experience/Gallery):** Inside the cabin, looking through windows at the world
- **Act 4 (CTA/Footer):** Checking out, but never wanting to leave

### Parallax Layers (Core Visual Identity)
```
Foreground (Z:20-30): Deodar pine silhouettes, architectural frames, mist particles
  → Moves FASTEST on scroll (y: -45%) — viewer feels immersed "inside" the trees

Mid-ground (Z:5-10): Content, cabin, rolling hills
  → Normal to moderate scroll speed — the story unfolds here

Background (Z:0): Himalayan mountain ranges, vast sky
  → Moves SLOWEST (y: +25%) — feels infinitely distant, unreachable
```

### Text Entry Animation
- Split by **line and word** using SplitType
- Words animate upward from invisible overflow mask
- Easing: `power4.out` (fast, then gentle landing — like setting down a feather)
- Stagger: `0.03-0.05s` per word
- Entry trigger: element top hits 85% of viewport

### Hover States & Micro-interactions
- **Magnetic buttons:** "Book a Stay" CTA pulls slightly toward cursor
- **Image hover:** Subtle scale (1.0 → 1.05) + warm shadow bloom
- **Link hover:** Animated underline extends from left (scaleX 0→1)
- **Card hover:** Slight Y-lift + dim siblings (follow.art + sequel pattern)

---

## 4. Color Philosophy

### Why These Colors?
| Token | Inspiration | Emotional Purpose |
|-------|-------------|-------------------|
| Forest Deep `#1A2E1A` | Dense deodar forest at dusk | Grounding, depth, authority |
| Deodar `#3D5A3D` | Pine canopy in diffused light | Life, growth, serenity |
| Cedar `#C4956A` | Aged Kath Kuni wooden beams | Warmth, history, craft |
| Parchment `#E8DDD0` | Sun-bleached prayer flags | Comfort, heritage, softness |
| Mist `#D4DCD4` | Morning valley fog | Mystery, calm, infinity |
| Snow `#F5F2ED` | First snowfall on peaks | Purity, space, clarity |
| Ink `#1C1C1C` | Deep night sky above treeline | Contrast, readability |
| Moss `#6B7F5E` | Lichen on ancient stone walls | Age, organic, texture |
| Lantern `#D4A76A` | Warm light through cabin window | Invitation, hope, home |

### The Warm/Cold Contrast
The entire brand is built on **thermal contrast**:
- **Outside:** Cool colors (mist, snow, forest-deep, deodar)
- **Inside:** Warm colors (cedar, lantern, parchment)
- This contrast should manifest in every section — dark exterior sections transition to warm interior sections

---

## 5. Typography Intent

### Playfair Display (Serif) — "The Voice of the Mountains"
- Used for headlines and display text
- Conveys **elegance, timelessness, editorial authority**
- Always rendered at maximum size — mountains are not subtle

### Inter (Sans) — "The Voice of Clarity"
- Used for body copy and descriptions
- Conveys **modern reliability, readability, warmth**
- Lightweight (300-400) to avoid competing with serif headlines

### Outfit (UI) — "The Voice of Action"
- Used for buttons, labels, eyebrow text
- Conveys **precision, contemporary craft**
- Always uppercase with wide letter-spacing for labels

---

## 6. Implementation Rules for AI Agents

When generating components based on this theme, you **MUST**:

1. ✅ Wrap the application in a smooth scroll context (Lenis via `LenisProvider.js`)
2. ✅ Use `useGSAP` hook from `@gsap/react` for all scroll-linked animations
3. ✅ Never use generic zoom-ins — use `transform` + `clip-path` for revealing content
4. ✅ Use CSS custom properties (`var(--mist)`, `var(--cedar)`, etc.) — never hardcode hex
5. ✅ Maintain extensive negative space — elements breathe like mountain air
6. ✅ Apply film-grain texture on photographic sections
7. ✅ Ensure foreground mountain elements frame the viewport without blocking content
8. ✅ Every image should feel like a curated editorial photograph, not a stock photo
9. ❌ Never use bright, saturated colors (red, blue, neon) — this is mountain earth tones only
10. ❌ Never use fast, flashy animations — everything is deliberate and slow

---

*This is the foundational emotional & aesthetic constraint document.*
*Last updated: 2026-04-09*
