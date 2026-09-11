# House of Hulda — "The Ascent"

[![Live Demo](https://img.shields.io/badge/Live%20Website-houseofhuldamanali.com-amber?style=for-the-badge)](https://www.houseofhuldamanali.com)

A cinematic scroll-story engine and ultra-luxury web platform for a handcrafted heritage homestay in Naggar, Manali. Engineered on **Next.js 15 App Router**, this platform ditches static templates and clunky video players for a **direct-manipulation cinematic scrubbing** experience—where the user's scroll wheel directly controls the time continuum of high-definition cinematography at a locked 60 FPS.

Built by [Pushkar Verma](https://www.linkedin.com/in/pushkarverma3698/).

---

## 🏔 The Experience: Cinematic Scrubbing

When designing ultra-luxury digital experiences, static photography feels inert, and auto-playing video feels passive. The gold standard pioneered by Apple is **direct-manipulation cinematic scrubbing**. 

However, trying to achieve this by scrubbing a `<video>` element on the web fundamentally breaks down. Browsers throttle seek rates to keyframes, causing severe jitter, lag, and black-screen flashing on production networks.

To feel physical, responsive, and tactile, we built a bespoke **Frame Sequence Engine**:
- **1080p Image Sequence Architecture:** Replaces the `<video>` tag with a mathematically precise HTML5 `<canvas>` that paints individual JPEG frames based on scroll progress.
- **Aggressive Memory Management (LRU Cache):** Prevents iOS Jetsam from crashing Safari by strictly managing GPU VRAM limits, keeping the memory footprint under 50MB while streaming a massive sequence of frames.
- **Decoupled Scroll Physics:** Uses [Lenis](https://lenis.studiofreight.com/) for buttery virtual scrolling and GSAP ScrollTrigger to decouple DOM state from the high-frequency animation loop.
- **Zero-Latency Scrubbing:** Every scroll tick updates the screen within 16.6ms. No proxy blur flicker, no freezing.

## ✨ High-End Editorial Polish

The user interface isn't just an overlay; it's meticulously integrated into the film sequence as a cohesive luxury product.
- **Editorial Typography:** Beautifully tracked Cormorant Garamond display headlines mixed with chic utility mono-fonts (eyebrow tracking).
- **Refined Interactions:** Subtle frosted cream buttons with elegant `ease-exhale` hover animations, avoiding heavy neon drop shadows for a true, grounded hospitality feel.
- **Surgical Scroll Boundaries (L-10 Finale):** A custom GSAP ScrollTrigger mapping ensures the film stops exactly at the physical DOM boundary with a smooth deceleration and floating effect—eschewing clunky mathematical lerp hacks for pure, native-feeling scroll physics.

## 🛠 Tech Stack & Architecture

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Framework** | Next.js 15 (App Router) | Hybrid SSG/SSR architecture for instant first-paint |
| **Physics** | Lenis + GSAP 3 | 60fps virtual scroll interpolation and scroll-linked animations |
| **Rendering** | HTML5 `<canvas>` | High-performance bitmap rendering bypassing DOM layout thrashing |
| **Styling** | Tailwind CSS v3 | Custom design tokens, bespoke bezier curves, and editorial utility classes |
| **Icons & UI** | Lucide React + Shadcn | Accessible UI primitives and crisp iconography |

## 🚀 Quick Start

To run the platform locally and see the cinematic engine in action:

```bash
# Clone the repository
git clone https://github.com/pushkarverma3698/House-of-Hulda-Website-frontend.git
cd House-of-Hulda-Website-frontend

# Install dependencies (requires pnpm)
pnpm install

# Start the development server
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) to feel the scroll.

---

### Resources & Case Studies
- 🌐 **Live Website:** [houseofhuldamanali.com](https://www.houseofhuldamanali.com)
- 📖 **The Blueprint:** Read the full technical breakdown in [The Cinematic 3D Film Scrub Engine: Architecture & Case Study](./Cinematic%203d%20videos%20trick/CASE_STUDY_AND_PRODUCTION_BLUEPRINT.md).
