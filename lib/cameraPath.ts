import { Vector3 } from 'three';

export interface CameraFrame {
  position: Vector3;
  lookAt: Vector3;
  fov: number;
}

function easeInOutCubic(x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

/**
 * Camera path as a pure deterministic function of normalized scroll t ∈ [0, 1].
 * Choreographed for the 8-Act Ascent narrative from Day valley to Night celestial vault to Dawn.
 */
export function cameraPath(
  t: number,
  outPos: Vector3,
  outLook: Vector3
): number {
  const clamped = Math.min(1, Math.max(0, t));

  if (clamped < 0.22) {
    // ACT 1: The Arrival & Glacial Springs (Valley Dolly-In)
    // Camera moves forward from z=8 down to z=4, slightly elevating
    const s = clamped / 0.22;
    const e = easeInOutCubic(s);
    outPos.set(0, 1.2 + 0.3 * e, 8 - 4 * e);
    outLook.set(0, 1.0, 0);
    return 42 - 6 * e; // Dolly-zoom FOV from 42 to 36
  } else if (clamped < 0.44) {
    // ACT 2: Kath-Kuni Heritage & Orchard Turns (120° Orbital Reveal)
    const s = (clamped - 0.22) / 0.22;
    const theta = easeInOutCubic(s) * ((Math.PI * 2) / 3);
    outPos.set(4 * Math.sin(theta), 1.5, 4 * Math.cos(theta));
    outLook.set(0, 1.0, 0);
    return 36;
  } else if (clamped < 0.66) {
    // ACT 3: The Loft & The Culinary Hearth (Z-Axis Push & Crane)
    const s = (clamped - 0.44) / 0.22;
    const e = easeInOutCubic(s);
    const theta = (Math.PI * 2) / 3;
    outPos.set(
      4 * Math.sin(theta) * (1 - e),
      1.5 + 4.5 * e,
      4 * Math.cos(theta) + 3 * e
    );
    outLook.set(0, 1.0 + 1.5 * e, 0);
    return 36 + 8 * e; // Expands FOV to 44 as hearth warmth opens
  } else if (clamped < 0.88) {
    // ACT 4: The 18 Celestial Gods & The Deep Space Core (Tilt Up to Celestial Vault)
    const s = (clamped - 0.66) / 0.22;
    const e = easeInOutCubic(s);
    outPos.set(0, 6 - 2 * e, 7 - 3 * e);
    // Tilts lookAt up towards the sky
    outLook.set(0, 2.5 + 8 * e, -10 * e);
    return 44 - 16 * e; // 200mm telescope optic compression: narrows FOV to 28
  } else {
    // ACT 5: Dawn & The Invitation (First Light Settle)
    const s = (clamped - 0.88) / 0.12;
    const e = easeInOutCubic(s);
    outPos.set(0, 4 - 2.5 * e, 4 + 4 * e);
    outLook.set(0, 1.2, 0);
    return 28 + 14 * e; // Pulls back to natural 42 FOV
  }
}
