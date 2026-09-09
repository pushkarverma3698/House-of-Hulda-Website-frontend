# House of Hulda: Art Direction & Vision
**Theme: "The Ascent: A Himalayan Reverie"**

## The Core Philosophy
A $50,000 digital experience doesn't sell rooms; it sells the *feeling* of being there. We are discarding the traditional grid-based hotel layout. Instead, the website acts as a cinematic short film that the user controls with their scroll wheel. The experience maps a full stay into a single scroll-driven narrative cycle from Day, to Night, to Dawn.

## Visual Language & Sensory Vibe
- **Color Palette:** Deep pine greens, charcoal greys, warm amber (firelight/wood), and crisp snow whites. Evoking the cold mountain breeze outside, and the warm, wooden sanctuary inside.
- **Typographic Grid (Fluid & Rigorous):** We do not use static font sizes. We use CSS `clamp()` for fluid typography. Display headings (e.g., Ogg or PP Editorial New) must use tight negative tracking (`letter-spacing: -0.02em`) for a high-fashion editorial feel. Sub-labels (e.g., Suisse Int'l or Inter) use ultra-wide tracking uppercase (`tracking-widest`).
- **Sound Design (The Missing Sense):** A $50k experience engages audio. We will implement spatial ambient audio (wind through Deodar pines, distant fire crackling) tied to the scroll depth via Howler.js. As you scroll into Act 4 (The Hearth), the fire audio subtly fades in.
- **Pacing & Motion:** Slow, intentional, breathable. Easing curves are custom Bezier (e.g., `cubic-bezier(0.76, 0, 0.24, 1)`).

## The 8-Act Cinematic Journey (The Ascent)

### Act 1: The Arrival (The Hook)
*   **Visual:** A full-screen, high-res loop/parallax of the morning mist over the Manali mountains.
*   **Interaction:** Custom cursor with subtle parallax depth mapping on the mountains.
*   **Copy:** "Above the Clouds. Beyond Time."
*   **Action:** A minimal prompt: "Begin the Ascent". No clunky "Book Now" buttons yet.

### Act 2: The Heritage (Tactile Storytelling)
*   **Visual:** Background fades to deep forest green. High-end, editorial-style imagery of Kath Kuni architecture slide in.
*   **Interaction:** Images lift off the page with soft drop shadows as you scroll.

### Act 3: The Sanctuary (The Rooms - Z-Axis Reveal)
*   **Visual:** *Art Director Note: Standard horizontal scrolling is cliché.* Instead, the rooms are revealed via Z-axis depth in the WebGL canvas. The camera physically pushes *through* the mist, and the room images materialize from the fog one by one, floating in 3D space.
*   **Atmosphere:** Warm, amber lighting casting actual WebGL Bloom onto the typography.

### Act 4: The Hearth (Taste & Culture)
*   **Visual:** Transition to evening. Deep, warm tones. A looping micro-video (cinemagraph) of steam rising from tea or embers from the fire.

### Act 5: The Night Sky (Immersion)
*   **Visual:** The screen goes midnight blue. A starry night sky over the Himalayas.
*   **Interaction:** The user's cursor creates a subtle soft glow effect revealing the silhouette of the homestay.

### Act 6: The Dawn (The Emotional Peak)
*   **Visual:** A bright, crisp, sun-drenched image of the valley. A sudden breath of fresh air. The visual climax.

### Act 7: The Journey (Location)
*   **Visual:** A stylized, minimal, animated line-map tracing the route to Naggar (no generic Google Maps embeds).

### Act 8: The Invitation (Booking)
*   **Visual:** The journey culminates in a beautiful, obstruction-free, integrated booking interface.
*   **Experience:** "Your room in the clouds awaits." API-first instantaneous booking drawer.

---

## Beyond the Film: The Interactive Ecosystem (The SOTM Standard)

*Art Director Note: A $50k Awwwards 'Site of the Month' is never just a passive scroll-film. The cinematic scroll is merely the **spine** of the experience. Branching off that spine, we must implement rich, highly interactive WebGL UI components:*

1.  **The Interactive Heritage Explorer (Object Sandbox):**
    *   Instead of just reading about Kath Kuni architecture, users interact with a real-time, spinning 3D point-cloud or highly detailed 3D scan of the wood/stone joinery. The user controls the rotation and lighting with their mouse.
2.  **WebGL Image Galleries (Distortion Transitions):**
    *   When a user clicks on "View Room", we don't open a generic light-box. The DOM seamlessly transitions into a WebGL texture gallery. Dragging horizontally applies a liquid/water distortion effect or a pixel-sorting transition between the room photographs.
3.  **The Morphing Full-Screen Menu:**
    *   The global navigation isn't a drop-down. It’s a full-screen, hardware-accelerated overlay. Hovering over menu items (e.g., "The Sanctuary", "The Hearth") triggers a WebGL shader in the background that distorts and crossfades looping preview videos associated with that link.
4.  **Macro-Typographic Utility (The Booking Flow):**
    *   The actual booking and date-picking interface must be brutalist, ultra-clean, and lightning-fast. It contrasts the moody 3D world with massive, crisp typography and instantaneous optimistic UI state updates.
5.  **Hover Physics & Cursor Magnetism:**
    *   Every interactive element (buttons, image borders) reacts to the custom cursor. Buttons physically warp and snap to the cursor's gravity field before clicking.

*This ecosystem of 'crazy' interactive components, layered on top of the cinematic scroll, is what wins international design awards.*
