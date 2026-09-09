# House of Hulda: Component Audit & Premium Quality Mechanisms

To execute the Art Director's vision, we must build a highly specific set of modular React and WebGL components. This document audits the required components and the underlying technical mechanisms that elevate the build to a premium, "$50k quality" standard.

## 1. Required Component Architecture

### A. The Core Engine (Infrastructure)
*   **`<SmoothScrollRig>`**: A headless component that binds Lenis to GSAP and writes to a global `scrollState` object. It completely bypasses React state to avoid re-renders during high-frequency scrolling.
*   **`<CanvasRoot>`**: The fixed full-screen WebGL portal. Contains the `<PerformanceMonitor>` for dynamic resolution scaling.
*   **`<CameraChoreographer>`**: A pure mathematical component that reads `scrollState.progress` and updates the Three.js camera position and lookAt vectors using `useFrame`.
*   **`<PostProcessingPipeline>`**: The `EffectComposer` wrapper containing Bloom, Film Grain, and Chromatic Aberration passes.
*   **`<AudioEngine>`**: A headless component utilizing `Howler.js` to cross-fade ambient soundscapes (wind, embers, birds) based on scroll depth.

### B. 3D Scene Components (The Visuals & Interactive Ecosystem)
*   **`<DisplacementPlane>`**: The workhorse component for our images. It takes two props: `imageSrc` and `depthMapSrc`. It uses a custom GLSL shader to displace the image vertices, creating a 3D parallax fly-through effect from static 2D assets.
*   **`<AtmosphericParticles>`**: An `InstancedMesh` component for rendering thousands of drifting particles (mist in Act 1, embers in Act 4) in a single draw call.
*   **`<EnvironmentCrossfader>`**: Blends multiple equirectangular HDRIs (Day, Night, Dawn) smoothly as the camera moves between Acts.
*   **`<WebGLGallery>`**: A custom drag-enabled slider. When active, it swaps out standard CSS transitions for a custom GLSL shader that uses Liquid Distortion maps to tear/ripple between room photos.
*   **`<HeritageSandbox>`**: A focused interactive component mounting a `.glb` model (Kath Kuni joint) wrapped in `<PresentationControls>`, allowing the user to grab, spin, and inspect the object under dynamic lighting.

### C. DOM Components (The Interface)
*   **`<MorphingMenuOverlay>`**: A full-screen `<nav>` overlay. When menu links are hovered, it sends an event to the background `<CanvasRoot>` to instantly render a distortion shader blending into a video preview of that section.
*   **`<MagneticButton>`**: A framer-motion powered button that subtly pulls toward the user's cursor when hovering, providing a tactile, premium feel.
*   **`<ZDepthText>`**: Typography that doesn't just scroll up the page, but scales and fades based on the actual Z-depth of the WebGL camera, making the text feel embedded in the 3D space.
*   **`<InstantBookingDrawer>`**: An off-canvas overlay that slides in instantly. It pre-loads the booking logic so there is zero network latency when the user decides to convert.

---

## 2. Mechanisms of Premium Quality (The "Secret Sauce")

How do we ensure the site actually *feels* like a $50k experience? It comes down to these strict engineering principles:

### A. Frame-Rate Independent Damping
We never use hard-coded `lerp(pos, target, 0.1)`. On a 120Hz display (iPhone Pro, MacBook Pro), this math runs twice as fast, ruining the pacing of the animations. 
**The Mechanism:** All camera and object damping uses time-scaled exponential decay: 
`const k = 1 - Math.exp(-stiffness * delta)`
This guarantees the motion looks identical and cinematic on *every* device, regardless of refresh rate.

### B. Additive Blending for Lighting Effects
When rendering mist, steam, or embers, we do not use standard alpha transparency, which can look muddy and cause sorting issues in 3D space.
**The Mechanism:** We use `THREE.AdditiveBlending`. The pixels of the mist/embers mathematically add their light values to the background. This is how Hollywood VFX composites fire and fog, making it look incredibly realistic and glowing.

### C. Zero Layout Thrashing (DOM Animations)
Standard websites animate CSS properties like `margin-top` or `height`. This forces the browser CPU to recalculate the entire page layout every frame, destroying frame rates.
**The Mechanism:** We strictly enforce that the DOM layer *only* animates `transform` (translate3d, scale) and `opacity`. These properties are handled entirely by the GPU, leaving the CPU free to calculate our complex 3D math.

### D. The Preloader "Veil"
A premium site never shows popping assets or unstyled flashes.
**The Mechanism:** The entire site remains hidden behind a sleek, solid-color veil (e.g., deep pine green). We use Drei's `<Preload all>` and React `<Suspense>`. Only when the massive WebGL payload (HDRIs, Depth Maps) is 100% loaded into the GPU memory does the veil smoothly fade out, revealing the fully formed world.
