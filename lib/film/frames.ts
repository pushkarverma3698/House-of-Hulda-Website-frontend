/**
 * WHERE THE FILM LIVES.
 *
 * One definition of every frame URL, shared by the preloader that fetches them
 * and the canvas that draws them. They used to be declared twice, which meant a
 * device could be preloaded with one encoding and then scrubbed against
 * another — every byte the curtain spent would miss.
 *
 * Four encodings of the same 240-frame film exist:
 *
 *   hero-proxy    160x284    1.4 MB   the cold-start floor
 *   hero-mid      320x568    3.7 MB   the step down when the master is missing
 *   hero          720x1280  14.7 MB   the master, phones
 *   hero-desktop  720x1280  25.6 MB   the master, pristine encode
 *
 * `hero` and `hero-desktop` are the SAME 720x1280 pixels; `hero` is a smaller
 * re-encode of the pristine originals. Measured across frames 1, 40, 90, 150,
 * 200 and 240, the two differ by a mean 42.7 dB PSNR — transparent for
 * photographic content — for 43% of the bytes. That difference is not worth
 * 11 MB of a phone's preload budget, and it is emphatically not where the
 * softness comes from: what makes the film look bad is which TIER reaches the
 * screen, not how the master was quantised. Desktop keeps the pristine encode
 * because it draws the frame in the aperture at a 1.21x upscale and has the
 * bandwidth to spare.
 *
 * 720x1280 is the ceiling the repository can offer. The film is drawn into a
 * 1170x2532 backing store on a dpr-3 phone, so even the master is a 1.6x
 * upscale; closing that last step needs a re-master from the 4K source, not a
 * scheduling change. The 7.3x upscale of the proxy tier, on the other hand, is
 * entirely a scheduling problem — see lib/film/preload.ts.
 */

export const TOTAL_HERO_FRAMES = 240

const pad = (index: number) => String(index).padStart(3, '0')

/**
 * Resolved once, not per call.
 *
 * The URL builders used to re-run matchMedia on every frame request, which is
 * both a layout read in the fetch path and a correctness hazard: the preloader
 * and the canvas each asked separately, and a disagreement between the two
 * answers would have the curtain fill the HTTP cache with one encoding while
 * the scrub asked for the other.
 */
let coarsePointer: boolean | null = null
export const isCoarsePointer = (): boolean => {
  if (typeof window === 'undefined') return false
  if (coarsePointer === null) {
    coarsePointer =
      window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768
  }
  return coarsePointer
}

export const proxyFrameUrl = (index: number) => `/frames/hero-proxy/frame_${pad(index)}.webp`
export const midFrameUrl = (index: number) => `/frames/hero-mid/frame_${pad(index)}.webp`
export const hiresFrameUrl = (index: number) =>
  isCoarsePointer()
    ? `/frames/hero/frame_${pad(index)}.jpg`
    : `/frames/hero-desktop/frame_${pad(index)}.jpg`

/** Bytes the whole master sequence costs on the wire, used to project how long
 *  the curtain still has to hold. Measured from the encoded directories, not
 *  guessed: 14.7 MB / 240 and 25.6 MB / 240. */
export const AVG_MASTER_FRAME_BYTES = () => (isCoarsePointer() ? 64_000 : 112_000)

/** Decoded size of one master frame: 720 * 1280 * 4. Every memory budget in the
 *  pipeline is really a frame count, and this is the conversion. */
export const MASTER_FRAME_DECODED_BYTES = 720 * 1280 * 4
