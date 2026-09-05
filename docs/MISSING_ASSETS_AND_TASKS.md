# House of Hulda: Gap Analysis & Missing Assets Tracker

> **Living Document**: This file tracks every missing asset, unoptimized dependency, incomplete shader, or pending task as we progress through implementation. Update this file at every milestone.

---

## 1. Missing Assets (To Be Generated / Acquired)

| ID | Item | Required For | Desired Format | Current Status |
| :--- | :--- | :--- | :--- | :--- |
| **A-01** | Atmospheric Video Loop: Mist | Act 1 Arrival & Act 3 Sanctuary | 5-8s WebM/MP4 (<2MB), pure black background, additive blend | **FALLBACK ACTIVE** (WebGL particle fog active; video loop adds volumetric fidelity) |
| **A-02** | Atmospheric Video Loop: Steam | Act 3 Outdoor Balcony Tub | 5-8s WebM/MP4 (<2MB), pure black background, additive blend | **PENDING** |
| **A-03** | Atmospheric Video Loop: Hearth Embers | Act 4 Culinary Hearth | 5-8s WebM/MP4 (<2MB), pure black background, additive blend | **FALLBACK ACTIVE** (3D particle embers active; video loop adds photoreal sparks) |
| **A-04** | Ambient Audio: Deodar Pine Wind | Global Soundscape (Act 1-3) | MP3 / OGG loop (<1.5MB, 96kbps), 44.1kHz, seamless loop | **PENDING** (Soundscape UI toggle active; wired to audio element) |
| **A-05** | Ambient Audio: Woodfire Crackle | Global Soundscape (Act 4-5) | MP3 / OGG loop (<1.5MB, 96kbps), 44.1kHz, seamless loop | **PENDING** |
| **A-06** | 3D GLB Model: Kath Kuni Joint | Phase 3 Interactive Heritage Sandbox | `.glb` (<3MB, Draco compressed, PBR materials) | **FUNCTIONAL BASELINE ACTIVE** (Procedural 8-course PBR textured interlocking assembly active; custom `.glb` will add sculpted wood chiseling) |
| **A-07** | 60-Frame Mobile Fallback Sequence | Phase 3 Sandbox on extreme low-tier devices | 60 frames `.webp` (320x320) | **PENDING** |
| **A-08** | KTX2 Texture Compression | Mobile Safari VRAM optimization | All JPG textures converted to `.ktx2` via `toktx` | **PENDING** (Currently 1024x1024 JPG textures under 150KB) |

---

## 2. Infrastructure & Component Status

| Task | Target File | Status | Notes |
| :--- | :--- | :--- | :--- |
| Single RAF Scroll Engine | `hooks/useScrollRig.ts` | **DONE** | Binds Lenis + GSAP ScrollTrigger via `gsap.ticker` to singleton `scrollState` |
| Camera Choreography Spline | `lib/cameraPath.ts` | **DONE** | Calibrated 16:9 cinematic dolly-zoom path across all 8 acts |
| Camera Rig Controller | `components/canvas/CameraRig.tsx` | **DONE** | Frame-rate independent exponential decay ($1 - e^{-4\Delta t}$) for 60/120Hz displays |
| Unified WebGL Canvas | `components/canvas/CanvasRoot.tsx` | **DONE** | DPR clamp [1.0, 1.5], PerformanceMonitor, coarse-pointer tiering |
| Cinematic Post-Processing | `components/canvas/Effects.tsx` | **DONE** | Desktop: Bloom, Film Grain, Vignette, Chromatic Aberration (Bypassed on mobile) |
| WebGL Displacement Plane | `components/canvas/DisplacementPlane.tsx` | **DONE** | 128x128 geometric vertex displacement + velocity-driven chromatic dispersion shader |
| Environment Skybox Crossfader | `components/canvas/EnvironmentCrossfader.tsx` | **DONE** | Smooth 360° spherical blending: Day → Night Celestial → Dawn Sunrise |
| Master 3D Narrative Spine | `components/canvas/CinematicSpine.tsx` | **DONE** | Orchestrates 8-Act narrative flow, replacing the legacy 240-frame 2D JPEG scrubber |
| Tactile Heritage Sandbox | `components/canvas/HeritageSandbox.tsx` | **DONE** | 3D Kath-Kuni architectural joint sandbox with Drei PresentationControls, dynamic cursor lighting, PBR wood & stone, editorial specs |
| Liquid WebGL Gallery | `components/canvas/WebGLGallery.tsx` | **DONE** | Custom GLSL fluid wave ripple distortion shader, swipe/mouse scrubbing, responsive full-bleed viewer |
| Adversarial Visual Refinements | Multiple files | **DONE** | Left-aligned L-02 copy, centered L-03 to prevent button overlap, midnight skybox lighting calibrated (0.02 directional), mobile audio button relocated |

---

## 3. How Remaining Assets Will Be Acquired & Integrated

### A. Atmospheric Video Loops (A-01, A-02, A-03)
- **Source / Pipeline**: Generate 6-second seamless video loops using generative video tooling (Fal.ai Wan2.1 / Runway Gen-3 / Google Veo) with prompts focused on high-contrast lighting against pure #000000 black background:
  - *Mist*: "Thick atmospheric Himalayan valley fog moving slowly horizontally against a pure black background, cinematic, 4k, monochrome".
  - *Steam*: "Delicate thermal bath steam wisps curling upwards softly against pitch black studio background".
  - *Embers*: "Subtle slow-drifting golden glowing cedar wood embers rising gently in the dark".
- **Integration**: Placed in `public/videos/`. Loaded into Three.js via `THREE.VideoTexture` with `meshBasicMaterial({ transparent: true, blending: THREE.AdditiveBlending, opacity: 0.65 })`. Additive blending eliminates black backgrounds automatically with 0 alpha channel overhead.

### B. Ambient Soundscapes (A-04, A-05)
- **Source / Pipeline**: Stereo field recordings or curated library audio (Freesound / Artlist) trimmed to seamless 30-second loops, compressed to 96kbps OGG + MP3:
  - *Wind*: Low howling mountain pine breeze with distant temple bells.
  - *Fire*: Soft crackle of aged deodar rootwood in a cast-iron stove.
- **Integration**: Placed in `public/audio/`. Managed in `components/film/Soundscape.tsx` using dynamic HTML5 `Audio` elements with crossfading volume ramps tied to `scrollState.progress` (e.g. fire volume peaks during Act 4 L-06 `t ∈ [0.55, 0.70]`).

### C. 3D GLB Model (A-06) & Fallback (A-07)
- **Source / Pipeline**: Exported from Blender with Draco compression (`gltf-pipeline -i model.gltf -o kath_kuni.glb -d`), keeping polygon count under 30k triangles and texture atlas to 2048x2048.
- **Integration**: In `components/canvas/HeritageSandbox.tsx`, replace the procedural `<KathKuniModel />` mesh with `const { scene } = useGLTF('/models/kath_kuni.glb')`. The current procedural model already serves as the complete functional fallback.

### D. Texture Optimization (A-08)
- **Pipeline**: Run `toktx --bcmp --genmipmap public/textures/*.ktx2 public/textures/*.jpg`.
- **Integration**: Use `@react-three/drei`'s `useKTX2` loader with fallback to standard JPG for browsers without KHR_texture_basisu extension.

---

## 4. Verified Working Baseline
* Next.js 15 App Router + React 19 + Three.js 0.185 + R3F 9.7 + Postprocessing 6.39
* Production build passes (`pnpm build` -> 0 errors, 22 static pages)
* Full Playwright runtime verification completed across both Desktop (1440x900) and Mobile (390x844) viewports.
