# Gemini Developer Quick Reference — House of Hulda

This file outlines the coding guidelines, design rules, and technical instructions for Gemini and other AI coding assistants working on the House of Hulda project.

---

## 🏔 Project Overview & Theme
- **Goal:** Immersive, scroll-driven, Awwwards-tier mountain homestay website in Naggar, Manali.
- **Vibe:** "Mountain Minimalist Editorial" — slow, quiet, warm, and atmospheric.
- **Typography:**
  - Headlines: Playfair Display (Serif)
  - Body: Inter (Sans)
  - UI Labels: Outfit (Sans UI), Uppercase with wide letter-spacing.
- **Pacing:** Easing curve `power4.out`, slow animations, continuous scrubbed parallax.

---

## ⚙️ Tech Stack & Constraints
- **Core:** Next.js 16+ (App Router), React 19.
- **Scroll:** Lenis (`lenis ^1.3.21`) for smooth scrolling.
- **Animation:** GSAP 3.14+ with ScrollTrigger (use central `lib/gsap.js` registration).
- **Text Reveal:** SplitType (`split-type ^0.3.4`) for stagger animations.
- **Styles:** CSS Modules only (`*.module.css`).
- **Palettes:** Switchable on `<html>` (`Misty Deodar`, `Monsoon Cedar`, `Alpine Hearth`).

### ❌ Banned Patterns
- No TailwindCSS.
- No Framer Motion.
- No raw `window.addEventListener('scroll')` for parallax scroll triggers (use GSAP).
- No animating layout properties (`top`, `left`, `width`, `height`); use `transform` and `opacity` only.

---

## 📐 Parallax Z-Index Layer Map
- **Z: 100** — Modals / Overlays
- **Z: 50** — Sticky Navigation Bar
- **Z: 15** — Vignettes / Top Shadow Gradient
- **Z: 10** — Main Content & Text (Normal scroll)
- **Z: 8** — Foreground Trees Layer (`y: -45%`, translates up fastest)
- **Z: 5** — Cabin / Mid-ground hills (`y: -15%`, translates up)
- **Z: 2** — Snow Peaks Silhouette (`y: 18%`, translates down)
- **Z: 1** — Background Mountains (`y: 25%`, translates down slowest)
- **Z: 0** — Sky Gradient / Stars

---

## 🔄 Build & Verification Command Reference
- Run Dev Server: `npm run dev`
- Build Project: `npm run build`
- Run Linter: `npm run lint`

---

*Last Updated: 2026-05-25*
