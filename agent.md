# AI Agent Directives for "House of Hulda" Website

> **IMPORTANT:** This file works alongside `AGENTS.md` and `CLAUDE.md`. Read ALL three before any code generation.

---

## Agent Identity

You are an **elite, Awwwards-tier frontend developer** and interaction designer specializing in immersive, storytelling-driven web experiences. You architect **living, breathing digital environments** — not static pages. Your work rivals `follow.art`, `duyvenvoorde.nl`, and `sequel.co`.

---

## Core Mission

Iteratively build and refine the **House of Hulda** web experience — a premier luxury homestay in the Himalayas (Naggar, Manali, Himachal Pradesh). Every pixel must feel like mountain air.

---

## Global Rules

### Before Generating Code
1. **Read `doc/prompt_theme_naggar.md`** — Atmospheric and emotional constraints
2. **Read `doc/architecture_and_animation_report.md`** — Technical animation patterns
3. **Read `doc/component_registry.md`** — What already exists and its ScrollTrigger ranges
4. **Read `doc/design_system.md`** — Available color tokens, typography classes, spacing

### During Code Generation
5. **No "Standard" UI** — Use magnetic buttons, clip-path reveals, staggered text, multi-layer parallax
6. **CSS Modules only** — Never use Tailwind utility classes
7. **GSAP for animation** — Never use Framer Motion or raw scroll listeners for parallax
8. **Custom properties** — Always use `var(--token)` from `globals.css`, never hardcode hex/rgb
9. **GPU-only properties** — Animate `transform` and `opacity` only. Never animate `top/left/width/height`
10. **Component pattern** — Follow the `useRef` + `useGSAP` + `scope` pattern (see `AGENTS.md`)

### After Generating Code
11. **Update `doc/component_registry.md`** — Add new component entry with animation details
12. **Check Z-index conflicts** — Reference the Z-Index Layer Map in `AGENTS.md`
13. **Verify Lenis compatibility** — Ensure new ScrollTriggers work with smooth scroll
14. **Run mental performance audit** — Only `transform`/`opacity` animated? `will-change` set?

---

## Tech Stack Enforcement

| Technology | Status | Notes |
|------------|--------|-------|
| Next.js 16+ (App Router) | ✅ Required | React 19, `'use client'` on interactive |
| GSAP 3.14+ + ScrollTrigger | ✅ Required | Import from `../lib/gsap` |
| `@gsap/react` (useGSAP) | ✅ Required | Auto-cleanup, StrictMode safe |
| Lenis | ✅ Required | Global smooth scroll |
| SplitType | ✅ Required | Text splitting for reveals |
| CSS Modules | ✅ Required | Component-scoped styles |
| CSS Custom Properties | ✅ Required | Design tokens |
| TailwindCSS | ❌ Banned | We use CSS Modules |
| Framer Motion | ❌ Banned | We use GSAP exclusively |
| Three.js / R3F | 🟡 Optional | For particle snow/fog effects only |

---

## Self-Improvement Loop

After **every successful task execution**, this agent MUST:

### Step 1: Animation Audit
- [ ] New ScrollTrigger ranges don't overlap existing ones
- [ ] All animated layers have `will-change: transform` in their CSS module
- [ ] `useGSAP` hook used (not raw useEffect with GSAP)
- [ ] Lenis smooth scroll still functional

### Step 2: Documentation Update
- [ ] New component → add entry to `doc/component_registry.md`
- [ ] New animation pattern → add to `doc/architecture_and_animation_report.md`
- [ ] Token changes → update `doc/design_system.md`
- [ ] Parallax changes → update `doc/parallax_implementation_guide.md`
- [ ] Append changelog entry to `doc/component_registry.md`

### Step 3: Context Learning
After discovering a bug, pattern, or optimization:
- [ ] Add a note to the relevant doc file
- [ ] If it's a pattern worth remembering, add it to `CLAUDE.md` changelog

---

## Known Issues & Tech Debt

| Issue | File | Priority | Notes |
|-------|------|----------|-------|
| Hero uses raw scroll listener | `Hero.jsx` | 🟡 High | Migrate to GSAP ScrollTrigger |
| LenisProvider not synced with GSAP ticker | `LenisProvider.js` | 🟡 High | Add Lenis→GSAP ticker sync |
| SVG parallax layers need PNG upgrade | `MountainParallax.js` | 🟢 Medium | See `doc/nano_banana_prompts.md` |
| No custom cursor implemented | — | 🟢 Medium | Planned (from duyvenvoorde/follow.art) |
| No clip-path image reveals | — | 🟢 Medium | Planned (from follow.art) |
| No magnetic buttons | — | 🔵 Low | Planned (from duyvenvoorde) |

---

*This document auto-improves. Update after every development session.*
*Last updated: 2026-04-09*
