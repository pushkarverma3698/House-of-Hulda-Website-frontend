# Nano Banana Generation Prompts: House of Hulda Diorama

> **Purpose:** These exact prompts generate the 4 photorealistic PNG layers needed to replace the SVG placeholder code in `MountainParallax.js`.

---

## Layer 1: Background Mountains (z-0)

**Constraint:** Wide-aspect ratio image (16:9). No transparent background needed. Save as `parallax-bg.jpg`.

**Prompt:**
> Breathtaking hyper-realistic landscape photography of the towering snow-capped Himalayas in the Manali/Kullu Valley. Dramatic, moody sky with volumetric warm afternoon sunlight breaking through heavy clouds and hitting the jagged peaks. Deep, atmospheric perspective, 8k resolution, cinematic lighting, photorealistic.

---

## Layer 2: The House (z-5)

**Constraint:** House MUST be on a solid white or black background for masking. Save as `parallax-house.png` (transparent).

**Prompt:**
> An isolated, high-end, multi-story traditional mountain homestay cabin built with ancient wood and stone (Kath Kuni architecture). The cabin has a slanted slate roof and warm, glowing, inviting windows. It is resting on a small, soft grassy hill. Hyper-realistic architectural photography, highly detailed wood grain, moody evening lighting. The entire background of the image MUST be a pure, solid, flat white color with no skies or background mountains whatsoever.

---

## Layer 3: Foreground Deodar Pines (z-20)

**Constraint:** Solid white background for keying. Center must be empty. Save as `parallax-fg-trees.png` (transparent).

**Prompt:**
> High contrast, pitch-dense silhouettes of towering Himalayan Deodar pine tree branches and needles framing the extreme left and right edges of the frame. The center of the image should be completely empty. The background MUST be pure, flat, solid white. Extremely dark green/black pine silhouettes, heavily detailed branches, photorealistic depth of field, 8k.

---

## Layer 4: Interactive Mist Overlay (Optional)

**Constraint:** On solid black background. Use `mix-blend-mode: screen` to key out black. Save as `parallax-mist.png`.

**Prompt:**
> Thick, rolling, atmospheric volumetric mountain fog, isolated against a solid black background. Smooth gradients, photorealistic smoke and mist effects, high contrast mapping, 8k.

---

## Post-Processing Pipeline

1. **Layer 1 (Mountains):** No processing needed. Save as JPG.
2. **Layer 2 (House):** Remove white background → transparent PNG (Photoshop / remove.bg)
3. **Layer 3 (Trees):** Remove white background → transparent PNG
4. **Layer 4 (Mist):** Keep black background. CSS `mix-blend-mode: screen` handles it.

## File Destinations
```
public/mountains/parallax-bg.jpg        ← Layer 1
public/mountains/parallax-house.png     ← Layer 2
public/mountains/parallax-fg-trees.png  ← Layer 3
public/mountains/parallax-mist.png      ← Layer 4
```

---

*Last updated: 2026-04-09*
