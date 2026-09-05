# House of Hulda: Layout, Wireframe & Architecture Plan

This document outlines the technical wireframing and global layout strategy to merge the `3d-website-factory` engine (GSAP + Lenis + R3F) into the `house-of-hulda` repository.

## 1. Global Architecture (The DOM vs. WebGL Split)

The golden rule for a $50k cinematic experience is **decoupling the DOM from the 3D Canvas**. 
We will have two distinct layers running simultaneously:

1.  **The Background Layer (WebGL / `<CanvasRoot>`)**: Fixed at `z-index: -10`. This renders all images (via Depth Displacement shaders), atmospheric particles, and HDRIs.
2.  **The Foreground Layer (DOM / Next.js UI)**: Normal HTML/CSS. This contains typography, layout structure, semantic HTML, and the Booking Drawer.

## 2. Core Layout Implementation Steps

### Phase 1: The Scroll Engine (`hooks/useScrollRig.ts`)
*   **Action:** Transplant `useScrollRig.ts` into the repo.
*   **Mechanism:** Binds `Lenis` directly to GSAP's `ScrollTrigger` via a single `requestAnimationFrame` loop.
*   **State:** Writes to a globally accessible Javascript object (`scrollState.progress` from `0.0` to `1.0`) so the 3D canvas can read scroll depth without causing expensive React re-renders.

### Phase 2: The Global Layout (`app/layout.tsx`)
*   **Action:** Update the root layout.
*   **Structure:**
    ```tsx
    <body>
      {/* 1. Global Navigation (Fixed, Transparent initially) */}
      <GlobalNav />
      
      {/* 2. The 3D Canvas (Fixed behind everything) */}
      <CanvasRoot />
      
      {/* 3. The Scrollable Content (Semantic HTML wireframe) */}
      <main className="relative z-10">
        <Act1HeroSection />
        <Act2HeritageSection />
        <Act3SanctuarySection />
        {/* ... */}
      </main>
      
      {/* 4. Overlays */}
      <BookingDrawer />
    </body>
    ```

### Phase 3: The Canvas Root (`components/canvas/CanvasRoot.tsx`)
*   **Action:** Setup the global Three.js environment.
*   **Features:**
    *   `PerformanceMonitor`: Dynamically scales DPR (Device Pixel Ratio) between `1.0` and `1.5` based on the user's GPU performance, solving lag issues.
    *   `EffectComposer`: Applies cinematic post-processing (Bloom, Chromatic Aberration, Vignette, Noise) globally to all 3D scenes.
    *   `CameraRig`: Moves the 3D camera purely based on `scrollState.progress`.

### Phase 4: Wireframing the 8-Act Sections (The Z-Axis Sync)
*Art Director Note: We cannot have the DOM arbitrarily scrolling while the WebGL camera moves independently. They must be perfectly synchronized.*

Instead of relying solely on CSS positioning, we will use Drei's `<ScrollControls>` or map our DOM opacities perfectly to the exact `t` values in our `cameraPath.ts`. 
*   **Act 1 Wireframe:** `100vh`. Absolutely positioned fluid-type headline using `clamp()`. Transparent background to reveal the WebGL canvas.
*   **Act 3 Wireframe (The Z-Axis Reveal):** Instead of a cliché 300vh horizontal scroll lock, we keep the user scrolling down, but the WebGL camera pushes *forward* along the Z-axis. As the camera pushes forward, the DOM text for each room fades in and out at specific `z` depths. This makes the rooms feel like they are emerging from the fog, not just sliding across a screen.

## 3. The Sensory Polish & Booking Integration
*   **Sound Design Integration:** We will initialize a global `Howler.js` audio context that reads the `scrollState.progress` to cross-fade ambient tracks (e.g., Wind → Fire crackling).
*   **Instant Booking:** The Booking Drawer must remain instantaneous. It will be pre-fetched and exist in the React tree at all times (hidden via CSS transforms). When a user clicks "Book", it overrides the Lenis scroll lock (`lenis.stop()`), blurs the WebGL canvas heavily, and slides in smoothly.

## 4. Branching Interactivity (The SOTM Modals)
*Art Director Note: The cinematic scroll is the spine. The "crazy visuals" are the branches.*
*   **Mechanism:** When a user clicks to view the `<WebGLGallery>` or `<HeritageSandbox>`, we must pause the main narrative.
*   **Implementation:** 
    1. Call `lenis.stop()` to lock the main scroll.
    2. Animate the main `<CameraChoreographer>` out of the way.
    3. Mount the specific interactive WebGL component inside the existing `<CanvasRoot>`.
    4. Provide a brutalist, macro-typographic "CLOSE" button in the DOM layer to destroy the interactive component, restore the camera, and call `lenis.start()`.
