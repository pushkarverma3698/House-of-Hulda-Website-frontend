import { Vector3 } from 'three';

function easeInOutCubic(x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

/**
 * Camera path as a pure deterministic function of normalized scroll t ∈ [0, 1].
 * Calibrated for a 16:9 full-bleed cinematic frame distance.
 */
export function cameraPath(
  t: number,
  outPos: Vector3,
  outLook: Vector3
): number {
  const clamped = Math.min(1, Math.max(0, t));

  if (clamped < 0.28) {
    // ACT 1 & 2: The Arrival & Valley Drive
    // Smooth cinematic dolly-in from z=11 down to z=7.5 with subtle elevation rise
    const s = clamped / 0.28;
    const e = easeInOutCubic(s);
    outPos.set(0, 0.2 + 0.4 * e, 11 - 3.5 * e);
    outLook.set(0, 0.2, 0);
    return 44 - 6 * e; // Dolly-zoom FOV from 44 to 38
  } else if (clamped < 0.48) {
    // ACT 2 to 3: The Kath-Kuni Transition & Orchard Reveal
    // Slight pan and gentle sweep
    const s = (clamped - 0.28) / 0.20;
    const e = easeInOutCubic(s);
    outPos.set(1.5 * Math.sin(e * Math.PI * 0.5), 0.6 + 0.3 * e, 7.5 - 1.0 * e);
    outLook.set(0, 0.3, -1);
    return 38;
  } else if (clamped < 0.72) {
    // ACT 3 & 4: The Sanctuary Loft & Culinary Hearth
    // Camera pushes in toward the sanctuary and elevates slightly
    const s = (clamped - 0.48) / 0.24;
    const e = easeInOutCubic(s);
    outPos.set(1.5 * (1 - e), 0.9 + 0.8 * e, 6.5 - 1.5 * e);
    outLook.set(0, 0.5 + 0.5 * e, -2);
    return 38 + 4 * e;
  } else if (clamped < 0.88) {
    // ACT 5: The 18 Celestial Gods & Night Vault
    // Camera pulls back and cranes up toward the stars
    const s = (clamped - 0.72) / 0.16;
    const e = easeInOutCubic(s);
    outPos.set(0, 1.7 + 2.5 * e, 5.0 + 3.0 * e);
    outLook.set(0, 1.0 + 4.0 * e, -10 * e);
    return 42 - 12 * e; // Telephoto compression for stargazing
  } else {
    // ACT 6: The Dawn Climax & The Invitation
    // Settles forward to reveal the panoramic Naggar valley at first light
    const s = (clamped - 0.88) / 0.12;
    const e = easeInOutCubic(s);
    outPos.set(0, 4.2 - 3.2 * e, 8.0 - 1.5 * e);
    outLook.set(0, 0.3, -1);
    return 30 + 12 * e;
  }
}
