# House of Hulda: Asset Generation Pipeline

This document outlines the precise methodology, tools, and pipelines we will use to generate the required WebGL assets for the $50k "Ascent" experience. 

## 1. Depth Maps (For 2.5D Parallax)
To create a 3D volumetric fly-through effect from our static JPEGs, we need 16-bit grayscale depth maps.
*   **Source Material:** High-res anchor images (e.g., `arrival-golden-hour.jpg`, `naggar-valley.jpg`).
*   **Tooling:** **Depth-Anything V2** (or MiDaS) via a local Python script or a Replicate API endpoint.
*   **Pipeline:**
    1. Pass the high-res `.jpg` into the depth estimation model.
    2. Output a 16-bit grayscale `.png` (white = near, black = far).
    3. Pair the depth map with the original image inside the Three.js `<canvas>` using a custom displacement GLSL shader.
    4. *Note: 16-bit PNG is required to prevent "stair-stepping" artifacts during the displacement.*

## 2. Seamless Atmospheric Video Loops
Instead of generating full scene videos which are heavy and hard to compress without artifacts, we will generate isolated atmospheric loops (mist, embers, steam) to composite over our scenes using Three.js Additive Blending.
*   **Tooling:** **Fal.ai** (Video generation endpoints) or **Runware**.
*   **Pipeline & Prompts:**
    *   *Mist (Act 1):* "Thick, slow-drifting mountain mist against a pure black background, cinematic, 8 seconds, perfectly seamless loop."
    *   *Embers (Act 4):* "Glowing red and orange fire embers rising slowly against a pure black background, shallow depth of field, 8 seconds, seamless loop."
*   **Post-Processing:** Use `ffmpeg` to compress the output to `.mp4` (h264) or `.webm` (VP9 with alpha channel) ensuring file sizes remain under 2MB per loop.

## 3. Equirectangular HDRI Skyboxes
To handle the Day → Night → Dawn transition globally, we need 360-degree environment maps. We already have the Night skybox, but we need Day and Dawn.
*   **Tooling:** **Fal.ai** / **Runware** (models capable of panorama generation) or **Blockade Labs**.
*   **Pipeline & Prompts:**
    *   *Day:* "360 degree equirectangular panorama, crisp Himalayan morning, clear blue sky, distant snow peaks, 8K resolution, 2:1 aspect ratio."
    *   *Dawn:* "360 degree equirectangular panorama, golden hour sunrise over the Himalayas, warm orange light hitting snow peaks, 8K resolution, 2:1 aspect ratio."
*   **Implementation:** Load these into Drei's `<Environment files="...">` component, and cross-fade their intensities based on the scroll progress `t`.

## 4. PBR Textures (Kath Kuni Heritage Materials)
To ensure the 3D lighting interacts realistically with our heritage sections, we need tileable Physically Based Rendering (PBR) maps for Deodar wood and slate stone.
*   **Tooling:** **Nano Banana MCP** (for the Albedo) and local CLI tools (like `sharp`) or normal-map generators.
*   **Pipeline & Prompts:**
    1. **Albedo (Color):** Use Nano Banana to generate a seamless tileable texture. 
       *Prompt:* "Seamless tileable dark brushed cedar wood texture, ancient Kath Kuni style, ultra detailed, photorealistic flat lighting, 1:1."
    2. **Roughness & Normal:** Derive these maps from the Albedo. We can use a local Python script (using OpenCV) or a tool like *Materialize* to convert the Albedo into a grayscale Roughness map (white = matte, black = glossy) and a purple/blue Normal map for the bumps and ridges.

## 5. 3D Models / Gaussian Splats (Interactive Sandbox)
*   **Tooling:** **Luma AI** or **Polycam** (via Mobile app), converted via Blender.
*   **Pipeline:** Take a short smartphone video orbiting a Kath Kuni joint or lantern. Process through Luma AI to extract a 3D mesh or Gaussian Splat. Clean up in Blender and export as an ultra-compressed `.glb` file (<3MB) with Draco compression.

## 6. Liquid Distortion Maps
*   **Tooling:** **Nano Banana MCP** or Procedural GLSL.
*   **Pipeline:** Generate high-contrast, seamless black-and-white fluid patterns. *Prompt:* "High contrast seamless liquid fluid simulation, grayscale height map, organic waves, 1:1". Alternatively, generate the noise procedurally directly inside the Three.js shader using `glsl-noise` to save bandwidth.
