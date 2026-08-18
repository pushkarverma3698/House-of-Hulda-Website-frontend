import * as THREE from 'three'

/**
 * A soft round sprite for THREE.PointsMaterial.
 *
 * Without a map, a Points primitive rasterises every point as a hard-edged
 * SQUARE. At the sizes the embers and the star field use, a square reads as a
 * stuck pixel or as compression damage sitting on the film rather than as a
 * light — and the post-processing chain's chromatic aberration then splits
 * those squares apart towards the edges of the screen, which is where the red
 * and green blocks over the frame were coming from.
 *
 * One 64 px texture, built once and shared: both consumers draw thousands of
 * points from it and neither needs its own copy.
 */
let cached: THREE.CanvasTexture | null = null

export function getPointSprite(): THREE.CanvasTexture {
  if (cached) return cached

  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size

  const ctx = canvas.getContext('2d')
  if (ctx) {
    const r = size / 2
    const gradient = ctx.createRadialGradient(r, r, 0, r, r, r)
    // A hot core with a fast falloff — a linear ramp reads as a soft blob, and
    // a star has to keep a point of light at its centre to read as a star.
    gradient.addColorStop(0, 'rgba(255,255,255,1)')
    gradient.addColorStop(0.25, 'rgba(255,255,255,0.72)')
    gradient.addColorStop(0.55, 'rgba(255,255,255,0.16)')
    gradient.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, size, size)
  }

  cached = new THREE.CanvasTexture(canvas)
  return cached
}
