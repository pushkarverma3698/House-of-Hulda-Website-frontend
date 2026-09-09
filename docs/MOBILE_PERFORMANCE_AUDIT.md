# Deep Audit: Mobile Performance & Smoothness

To guarantee a "smooth to very smooth" experience (locked 60fps) on mobile devices (iOS/Android), we must acknowledge that mobile browsers have strict limitations regarding GPU power, VRAM, and touch-scrolling behavior. 

Here is the deep audit of our proposed architecture against mobile constraints, and the strict rules we must enforce to achieve $50k mobile smoothness.

## 1. The Scrolling Engine (Lenis + GSAP)
**The Risk:** Virtual scrolling libraries (like Lenis) can sometimes feel "janky" or unresponsive on touch devices because they hijack the native iOS/Android momentum scrolling.
**The Solution:** 
*   We will configure Lenis with `smoothTouch: false`. This means on mobile, the browser handles the scrolling *natively* (giving the user that perfect, expected touch momentum). 
*   Lenis will act purely as a passive listener on mobile, instantly feeding the native scroll position (`window.scrollY`) to GSAP and our WebGL camera without interfering with the touch mechanics.
*   **Verdict:** This guarantees perfectly smooth, native-feeling scroll on mobile, while still driving the 3D camera.

## 2. WebGL Post-Processing (The GPU Killer)
**The Risk:** The `EffectComposer` (Bloom, Film Grain, Chromatic Aberration) requires rendering the scene to multiple off-screen buffers (FBOs). Mobile GPUs have low "fill rates," meaning pushing millions of pixels through multiple shader passes will instantly drop the frame rate to 15-20fps and drain the battery.
**The Solution (Progressive Enhancement):**
*   We will implement a **GPU Tiering System** (using `detect-gpu` or simple user-agent/screen-width checks).
*   **On Desktop:** Full `EffectComposer` (Bloom, Aberration, Grain).
*   **On Mobile:** We *bypass* the `EffectComposer` entirely. Instead, we bake the "film grain" directly into the static images beforehand, and use a much simpler, highly-optimized single-pass GLSL shader for the parallax effect. 
*   **Verdict:** By disabling multi-pass post-processing on mobile, we save massive GPU cycles, locking the frame rate at 60fps.

## 3. Pixel Density & Thermal Throttling
**The Risk:** Modern iPhones have extremely high pixel densities (Retina displays with DPR 3). If Three.js tries to render a 3D scene at full resolution on an iPhone screen, it calculates 9x as many pixels as a standard screen. The phone will rapidly overheat and thermally throttle (forcing the screen down to 30Hz or lower).
**The Solution:**
*   Our `CanvasRoot.tsx` already uses Drei's `<PerformanceMonitor>`.
*   We will add a strict clamp for mobile: **Max DPR on mobile is clamped to 1.5** (or even `1.0` if the framerate drops). The human eye barely notices the difference in motion on a small screen, but the GPU renders 75% fewer pixels.
*   **Verdict:** Prevents device overheating and guarantees sustained smooth framerates.

## 4. VRAM (Video Memory) Crashes
**The Risk:** Mobile Safari strictly limits WebGL memory (often crashing if VRAM exceeds 250MB-350MB). Loading multiple 8K HDRI Skyboxes and uncompressed 4K PNG depth maps will crash the iPhone browser instantly.
**The Solution:**
*   **Texture Compression:** We will convert all heavy textures (especially depth maps and skyboxes) to the `.ktx2` / Basis Universal format. The GPU can read KTX2 directly without decompressing it into VRAM.
*   **Asset Swapping:** We will load 1K or 2K HDRIs for mobile, and reserve the 4K/8K HDRIs strictly for desktop.
*   **Verdict:** Completely eliminates "aw snap" memory crashes on mobile Safari.

## 5. DOM Reflows over WebGL
**The Risk:** Animating CSS properties like `top`, `margin`, or `height` over a WebGL canvas causes the browser to constantly recalculate the layout (Reflow), causing heavy stutter.
**The Solution:**
*   The 3D Canvas will be `position: fixed` with `pointer-events: none` (except for specific interactive areas). 
*   All DOM animations (like text fading in) will be hardware-accelerated using GSAP (`transform: translate3d` and `opacity` only).
*   **Verdict:** Ensures the DOM layer never blocks the WebGL render thread.

---

### Conclusion of Audit
The architecture from `3d-website-factory` *is capable* of mobile smoothness, **but only if we strictly implement the mobile degradations above.** If we blindly copy the desktop visual effects to mobile, it will fail. 

By implementing Mobile Native Scroll, disabling Post-Processing for touch devices, clamping DPR to 1.5, and compressing textures to `.ktx2`, we will absolutely achieve a flawless 60fps mobile experience.
