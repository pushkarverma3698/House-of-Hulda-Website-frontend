# House of Hulda: Implementation Phases & Alignment Audit

Based on the complete architectural and art direction research, this is the strict, step-by-step blueprint for executing the $50k "Ascent" platform. 

---

## 1. The Implementation Phases

### Phase 0: The Infrastructure Transplant (The Engine)
*   **Goal:** Establish the bulletproof, 60fps foundation by porting our audited 3D engine components into the repository.
*   **Tasks:**
    *   Transplant `hooks/useScrollRig.ts` (GSAP + Lenis binding).
    *   Transplant `components/canvas/CanvasRoot.tsx` with Drei's `<PerformanceMonitor>`.
    *   Transplant `Effects.tsx` (Bloom, Film Grain).
    *   Setup the `layout.tsx` wireframe: Fixed WebGL canvas behind semantic HTML foreground.
    *   **Mobile Degradation:** Implement the tiering logic to clamp DPR to `1.0` and bypass `EffectComposer` on touch devices to guarantee smoothness.

### Phase 1: Asset Generation & Optimization (The Paint)
*   **Goal:** Upgrade our flat 2D images into WebGL-ready interactive assets, preparing for mobile constraints.
*   **Tasks:**
    *   Generate 16-bit Grayscale Depth Maps for key anchor images via DepthAnything V2.
    *   Generate 5-8s seamless atmospheric loops (Mist, Embers) via Fal.ai/Runware.
    *   Generate Day/Dawn HDRI Skyboxes (2:1 equirectangular).
    *   *Awwwards Upgrade:* Render a 60-frame high-res image sequence of the spinning Kath Kuni 3D model to serve as a zero-compute interactive fallback for lower-end mobile devices.
    *   Compress all heavy textures into `.ktx2` format and sequences to `.webp` to prevent VRAM crashes on mobile Safari.

### Phase 2: The Core Cinematic Scroll (The Spine)
*   **Goal:** Build the primary 8-Act narrative flow that the user scrolls through, implementing advanced camera and physics shaders.
*   **Tasks:**
    *   Build the `<CameraChoreographer>` and `lib/cameraPath.ts` to map `scrollState.progress` to precise Z-axis and X-axis movements.
    *   *Awwwards Upgrade:* Wire "Vertigo" Dolly-Zoom logic into the choreographer, manipulating the Camera's Field of View (FOV) based on scroll depth for dramatic reveals.
    *   Implement the `<DisplacementPlane>` component with a custom GLSL shader that takes an image + depth map to create the 3D parallax effect.
    *   *Awwwards Upgrade:* Inject a **Velocity Uniform** (`scrollState.velocity`) into the fragment shader so textures stretch, tear, and warp dynamically when the user scrolls fast, snapping back elastically when they stop.
    *   Implement `<EnvironmentCrossfader>` to smoothly transition the global lighting from Day to Night based on scroll depth.

### Phase 3: The Interactive Ecosystem (The Branches)
*   **Goal:** Build the "crazy visuals" and SOTM-level micro-interactions that branch off the main scroll spine.
*   **Tasks:**
    *   Build `<WebGLGallery>` using liquid distortion/pixel-sorting GLSL shaders for room photo transitions.
    *   Build `<HeritageSandbox>`, mounting a `.glb` Kath Kuni joint wrapped in `<PresentationControls>` for desktop interaction.
    *   *Awwwards Upgrade:* Implement the progressive fallback `<ImageSequenceCanvas>` for the sandbox, guaranteeing 60fps interactivity on budget phones by scrubbing through the 60-frame `.webp` sequence instead of rendering a heavy `.glb` model.
    *   Build `<MorphingMenuOverlay>`, a full-screen DOM navigation that triggers WebGL video reveals on link hover.

### Phase 4: Sensory Polish & Macro-Typography
*   **Goal:** Finalize the emotional aesthetics and synchronize the DOM layer with the WebGL layer perfectly.
*   **Tasks:**
    *   Implement fluid typography using CSS `clamp()` and tight negative tracking (`-0.02em`) for headings.
    *   *Awwwards Upgrade:* Implement **Layered Z-Depth Stacking**. DOM text doesn't just fade in; it emerges with a `rotationX` tilt, physically rotating and snapping into reading position exactly as the WebGL camera passes through its Z-plane.
    *   Integrate `Howler.js` to cross-fade spatial ambient audio (wind, crackling fire) driven by scroll progress.

### Phase 5: The Instant Booking Drawer (Conversion)
*   **Goal:** The flawless, brutalist conversion utility.
*   **Tasks:**
    *   Build the off-canvas booking drawer with a macro-typographic UI.
    *   Ensure the component is pre-fetched and mounts instantly, overriding the `Lenis` scroll lock when opened.
    *   Connect to the existing Next.js 15 API-first backend.

---

## 2. The Alignment Audit (Does this hit the Vision?)

We must audit these phases against the required user emotions: *Transported, Curious, Safe, and Ready to Book.*

*   **Auditing Phase 0 & 1 (Performance vs. Emotion):** 
    *   *Alignment Check:* A user cannot feel "transported" if their phone gets hot and the frame rate drops. By putting Phase 0 (Mobile Degradation) and Phase 1 (KTX2 compression) first, we guarantee the baseline requirement for immersion: an unbroken 60fps illusion.
*   **Auditing Phase 2 (The Spine vs. "The Hook"):** 
    *   *Alignment Check:* By building the `<DisplacementPlane>` with depth maps instead of generic video files, the user feels physically present in the space (Parallax). As they scroll, the space moves around them, enforcing the feeling of "Awe" and "Exploration".
*   **Auditing Phase 3 (The Ecosystem vs. "Tactility"):** 
    *   *Alignment Check:* This phase explicitly targets the user's curiosity. Instead of passively reading, the `<HeritageSandbox>` and `<WebGLGallery>` reward the user's interaction with physics and fluid mechanics, making the digital heritage feel real and tangible.
*   **Auditing Phase 4 (Sensory Polish vs. "Sanctuary"):** 
    *   *Alignment Check:* Audio is the shortcut to emotion. Tying the Howler.js audio (wind to fire) to the scroll depth creates the subconscious realization that they have moved from the cold wilderness into a warm sanctuary.
*   **Auditing Phase 5 (The Booking vs. "Frictionless"):** 
    *   *Alignment Check:* By pre-fetching the drawer and making it an instant overlay rather than a page navigation, the user's dopamine loop isn't broken by a white loading screen. The transition from falling in love with the property to booking it is instantaneous. 

**Conclusion:** The phased implementation plan perfectly supports the Art Director's vision. We are building the engine first, the visuals second, the interactive branches third, and the conversion utility last. Every line of code serves the emotional arc.
