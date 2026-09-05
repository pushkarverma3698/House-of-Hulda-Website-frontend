# House of Hulda: Gap Analysis & Missing Assets Tracker

> **Living Document**: This file tracks every missing asset, unoptimized dependency, incomplete shader, or pending task as we progress through implementation. Update this file at every milestone.

---

## 1. Missing Assets (To Be Generated / Acquired)

| ID | Item | Required For | Desired Format | Current Status |
| :--- | :--- | :--- | :--- | :--- |
| **A-01** | Atmospheric Video Loop: Mist | Act 1 Arrival & Act 3 Sanctuary | 5-8s MP4/WebM (<2MB), black background, additive blend | **MISSING** (Using WebGL particle fallback) |
| **A-02** | Atmospheric Video Loop: Steam | Act 3 Outdoor Balcony Tub | 5-8s MP4/WebM (<2MB), black background | **MISSING** |
| **A-03** | Atmospheric Video Loop: Hearth Embers | Act 4 Culinary Hearth | 5-8s MP4/WebM (<2MB), black background | **MISSING** (Currently using three.js particle embers) |
| **A-04** | Ambient Audio: Deodar Pine Wind | Global Soundscape (Act 1-3) | MP3 / OGG loop (<1.5MB), 44.1kHz | **MISSING** |
| **A-05** | Ambient Audio: Woodfire Crackle | Global Soundscape (Act 4-5) | MP3 / OGG loop (<1.5MB), 44.1kHz | **MISSING** |
| **A-06** | 3D GLB Model: Kath Kuni Joint | Phase 3 Interactive Heritage Sandbox | `.glb` (<3MB, Draco compressed) | **MISSING** (Using PBR textured cube placeholder) |
| **A-07** | 60-Frame Mobile Fallback Sequence | Phase 3 Sandbox on budget phones | 60 frames `.webp` (320x320) | **MISSING** |
| **A-08** | KTX2 Texture Compression | Mobile Safari VRAM optimization | All JPG textures converted to `.ktx2` via `toktx` | **PENDING** (Currently high-res JPG) |

---

## 2. Infrastructure Status (Phase 0 Execution)

| Task | Target File | Status | Notes |
| :--- | :--- | :--- | :--- |
| Single RAF Scroll Engine | `hooks/useScrollRig.ts` | **DONE** | Binds Lenis + GSAP ScrollTrigger via `gsap.ticker` to singleton `scrollState` |
| Camera Choreography Spline | `lib/cameraPath.ts` | **DONE** | Deterministic function mapping scroll $t \in [0, 1]$ to position, lookAt, and FOV |
| Camera Rig Controller | `components/canvas/CameraRig.tsx` | **DONE** | Frame-rate independent exponential decay ($1 - e^{-4\Delta t}$) for 60/120Hz displays |
| Unified WebGL Canvas | `components/canvas/CanvasRoot.tsx` | **DONE** | DPR clamp [1.0, 1.5], PerformanceMonitor, coarse-pointer tiering |
| Cinematic Post-Processing | `components/canvas/Effects.tsx` | **DONE** | Desktop only: Bloom, Film Grain, Vignette, Chromatic Aberration (Bypassed on mobile) |
| Providers Integration | `app/providers.tsx` | **DONE** | Mounts `useScrollRig` and re-exports `getLenis` cleanly |


---

## 3. Verified Working Baseline
* Next.js 15 App Router + React 19 + Three.js 0.185 + R3F 9.7 + Postprocessing 6.39
* Production build passes (`pnpm build` -> 0 errors, 22 static pages)
* Phase 1 Assets generated: 3 depth maps, 2 panoramic skyboxes, 2 PBR textures, 1 liquid distortion map.
