# House of Hulda: WebGL Asset Requirements & Audit

To achieve the "$50k cinematic feel" using a WebGL engine (React Three Fiber), dropping standard 2D flat images onto the screen is insufficient. We must bridge the gap between static photography and full video by using 3D shaders, depth maps, and optimized loops.

## 1. What We HAVE (The Foundation)
We possess a robust inventory of high-quality static assets in the repository:
- **`public/images/`**: High-resolution JPEGs (`arrival-golden-hour.jpg`, `deodar_suite_interior.jpg`, `himachali_culinary_hearth.jpg`, etc.)
- **`public/shots/`**: Storyboard anchors (`shot_1_mist/start.jpg`, `shot_2_canopy/start.jpg`, etc.)
- **`skybox_himalayan_night.jpg`**: A great starting asset for the Act 5 Night Sky environment.

## 2. What We NEED (The WebGL Enhancements)

To execute the 8-Act Ascent natively in the browser without massive MP4 bandwidth costs, we must generate the following supplementary WebGL assets:

### A. Depth Maps (Critical for 2D Parallax / 2.5D Displacement)
We need grayscale depth maps for our primary anchor images. This allows the WebGL shader to displace the image geometry, creating a volumetric "fly-through" effect as the user scrolls.
*   **Required for:** 
    *   `arrival-golden-hour.jpg` (Act 1)
    *   `deodar_suite_interior.jpg` (Act 3)
    *   `naggar-valley.jpg` (Act 6)

### B. Seamless Video Loops (Atmospherics & Particle Systems)
We need lightweight, isolated 5-8 second seamless loops with black/transparent backgrounds to overlay onto the 3D scene using Additive Blending.
*   **Required for:**
    *   **Act 1:** Drifting mist/fog (black background).
    *   **Act 3:** Rising steam (for the outdoor tub / balcony).
    *   **Act 4:** Rising embers/sparks (for the Culinary Hearth).

### C. Equirectangular HDRI Skyboxes (Environment Lighting)
We need 360-degree HDRIs to map to a Three.js `<Environment>` or `<Sphere>` so the ambient lighting of the entire 3D environment transitions seamlessly.
*   **Required for:**
    *   **Act 1 (Day):** A crisp, misty morning Himalayan skybox (2:1 equirectangular).
    *   **Act 6 (Dawn):** A golden hour / sunrise Himalayan skybox (2:1 equirectangular).
    *   *(We already have the Night skybox).*

### D. PBR Textures (Tactile Heritage)
To make the Kath Kuni architecture feel real, lighting (Bloom, Point lights) must react to the texture grain. We need tileable maps.
*   **Required for:**
    *   **Kath Kuni Wood:** Albedo, Roughness, and Normal maps.
    *   **Slate Stone:** Albedo, Roughness, and Normal maps.

### E. 3D Models / Gaussian Splats (The Interactive Sandbox)
For the "Interactive Heritage Explorer", we need an actual 3D object for the user to spin and interact with.
*   **Required for:** 
    *   A `.glb` or `.gltf` 3D model of a Kath Kuni architectural joint or a traditional lantern.

### F. Liquid Distortion Maps (Shader Transitions)
To achieve the "crazy" liquid transitions in the WebGL Galleries and Morphing Menu, we need high-contrast noise maps.
*   **Required for:**
    *   Grayscale Perlin/Simplex noise maps used to drive the pixel-sorting and water-ripple GLSL shaders.
