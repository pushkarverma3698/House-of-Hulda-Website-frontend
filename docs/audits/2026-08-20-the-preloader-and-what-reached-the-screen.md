# The preloader spent four seconds and the film was still a blur

Performance audit + implementation, 20 Aug 2026.
Branch `claude/ulda-preloader-frame-quality-o7yquj`.

Follows on from [the altitude-and-sky audit](./2026-08-18-altitude-and-sky.md),
which fixed *where* the film was drawn. This one is about *which* of the four
encodings of it a visitor was actually looking at, and about the loading screen
that was supposed to make sure it was the good one.

## The complaint

> the preloader needs to download all the frames, the high quality frames,
> which we are not getting. The website scroll quality is very bad.

Both halves of that are correct, and they are the same fault.

## What was on screen

Four encodings of the 240-frame film exist:

| tier | resolution | on the wire | upscale to a 1170x2532 phone canvas |
|---|---|---|---|
| `hero-proxy` | 160x284 | 1.4 MB | **7.3x** |
| `hero-mid` | 320x568 | 3.7 MB | 3.7x |
| `hero` | 720x1280 | 14.7 MB | 1.6x |
| `hero-desktop` | 720x1280 | 25.6 MB | 1.6x |

Instrumented with a per-tick tier counter and driven at a realistic reading
speed, this is what a visitor was looking at:

| profile | scroll | master tier on screen |
|---|---|---|
| phone, 4G | 1,400 px/sec | **10.5%** |
| phone, 4G | 600 px/sec | **36.4%** |
| phone, 4G | 300 px/sec | 99.6% |
| desktop | 1,400 px/sec | **20.5%** |
| desktop | 600 px/sec | **56.1%** |
| phone, 4x CPU throttle | 600 px/sec | **2.9%** |

The rest was the 160x284 proxy, blown up 7.3x. `scripts/capture-film.mjs`
photographs it: the film opens sharp for about sixty frames and then dissolves
for the remaining three quarters of its length.

**The masters were never the problem.** `hero` and `hero-desktop` are the same
720x1280 pixels at two quantisations, and they differ by a mean 42.7 dB PSNR
across frames 1, 40, 90, 150, 200 and 240 — transparent for photographic
content. Re-encoding anything would have moved nothing. What was wrong was that
the sharp tier almost never reached the screen.

## Why

**The curtain lifted on a timer, not on the film.** It fetched 40 frames and
called `setTimeout(complete, 4000)`. On a 4G profile the timer is what fired: 42
frames of 240 cached, 3.1 MB of a 14.7 MB film, and the other 198 frames left to
be fetched *during* the scroll — where a miss falls through to the proxy.

**The frames it did pay for were not decoded.** Warming the HTTP cache leaves
the whole 5–70 ms decode on the scroll's critical path. The four seconds bought
bytes and no readiness.

**Three background tasks were competing for one decode pipeline.** The tiers
share it, and two of the three consumers were serving the tier that only exists
to cover the failures of the third:

- the 240-frame proxy sweep ran during the first scroll — 185 decodes against
  the master tier's 75 on one phone pass, and 101 against 14 on a throttled one;
- the render loop asked for a proxy frame on *every* frame change, ~240 a pass,
  whether or not the master tier had anything to show;
- the mid tier was fetched and decoded on every frame change too, and reached
  the screen for 0.0% of them.

**Two bugs in the ladder.** A request for the frame under the playhead ran on
every render tick, outside — and contradicting — the `stride === 1` guard written
to prevent exactly it, so the stride was computed and then ignored. And the
near-search radius was `max(2, stride/2)`, i.e. 2: a sharp frame three indices
behind the playhead was rejected in favour of a 7.3x upscale, trading a 50 ms lag
nobody can see for softness everybody can.

## And one thing that was not about the film at all

Verifying the above turned up an uncaught exception that **unmounts the entire
page part-way down a desktop scroll** — WebGL scene, film canvas, every overlay.
It is on `main`, it predates this work, and it is the worst scroll-quality bug
on the site, so it is fixed here.

`<Bloom>` in `components/canvas/PostProcessing.tsx` is built by
`@react-three/postprocessing`'s `wrapEffect`, which memoises the effect's
constructor arguments on `JSON.stringify(props)`. Under React 19 `ref` is an
ordinary member of props. So the moment that ref holds a live `BloomEffect` — an
object in the THREE graph, where `parent` and `children` point at each other —
the next render of that component throws `Converting circular structure to
JSON`, React unwinds the tree, and the page is blank for the rest of the descent.

It only bit desktop because the whole postprocessing stack is skipped on a coarse
pointer, and only part-way down because it needs a re-render after the ref has
been populated. `JSON.stringify` omits functions rather than following them, so
the fix is a `useCallback` callback ref: the memo key stays stable and
serialisable, and the effect is still reachable for the per-frame threshold
update.

The measurements below were taken with this fixed on **both** sides, so the
frame-delivery numbers are not confounded by a page that stopped rendering.

## What shipped

### 1. The curtain downloads the film (`lib/film/preload.ts`, new)

All 240 master frames, in scroll order, at concurrency 8, with the progress bar
showing the film's real progress rather than a timer's. The lift decision is a
measurement, not a constant: once the opening run is cached, the curtain lifts as
soon as *the remaining bytes at the measured throughput* will land faster than
the fastest plausible traversal of the film. On a fast link that is 1.7 s with
the rest streaming behind the viewer; on a slow one it holds; at 8 s it gives up
and lets the ladder degrade rather than trapping anyone behind a black screen.

The opening 32 frames are also **decoded** into the same cache the canvas draws
from, so the first beat costs nothing at all.

`scripts/verify-curtain.mjs` checks the contract on six links:

```
ok   wifi / 5G      100 Mbps  curtain  1726 ms  cached  75/240  wire  6.1 MB  -> streaming-ahead
ok   fast 4G         25 Mbps  curtain  2245 ms  cached  40/240  wire  3.4 MB  -> streaming-ahead
ok   slow 4G          8 Mbps  curtain  9039 ms  cached  93/240  wire  7.1 MB  -> ceiling
ok   slow 3G        1.2 Mbps  curtain 10897 ms  cached  13/240  wire  1.1 MB  -> ceiling
ok   Save-Data       25 Mbps  curtain  2006 ms  cached  32/240  wire  2.8 MB  -> save-data
ok   warm reload     25 Mbps  curtain  1584 ms  cached 153/240  wire  0.0 MB  -> streaming-ahead
```

Save-Data never starts the bulk download. A warm reload touches the network for
nothing at all.

### 2. The background sweeps got out of the film's way

The 240-frame proxy sweep moved into the curtain, where it is free: the curtain
is network-bound on 14.7 MB of masters while the decode pipeline sits idle, and
1.4 MB is 9% on top of a download the visitor is already waiting through. Past
the curtain it yields whenever the playhead is moving.

The render loop's per-frame-change proxy request now fires only when the master
tier has nothing within the near-search *and* the floor has nothing within three
frames. The mid tier is asked for on the same condition. Measured on a phone
pass, decodes went from 75 master / 171 floor to **154 master / 6 floor**.

### 3. The ladder trusts a sharp frame that is slightly late

The near-search radius is derived from a time rather than a count: at the current
frame velocity, how many indices fit inside 120 ms — about two frames of a 60 Hz
refresh, well inside what reads as a film fractionally behind the thumb. It
collapses back to 2 as the playhead slows, so a deliberate stop still lands on
the exact frame. And the request that was defeating the stride is now gated on
the guard it was written for.

### 4. The stride is derived from the whole round trip

`BitmapCache` timed `createImageBitmap` alone and divided it into the
concurrency. That is Little's law with the wrong latency: it reported a pipeline
that could sustain a 72 frames/sec scroll while the tier was landing 21 a second,
a 3.4x overestimate, because the fetch, the blob read and the wait for a free
decoder thread all fell outside the window being timed. A stride derived from an
overestimate is 1, so the read-ahead asked for every consecutive frame and left
gaps no near-search could cover. It now times request-to-resident.

A feedback controller was tried here first — widen the stride when the master
tier's share sags — and it is unstable in exactly the case it exists for: a wide
stride stops asking for the frame under the playhead, so the hit rate falls
further and the loop runs to its ceiling. Measured, it sat at a 1% hit rate on a
scroll that a fixed stride of 1 served at 97%. The note in `ScrollCanvas.tsx`
records this so it is not tried again.

### 5. Memory scaled to the device

The master window was 56 MB on a phone — 16 frames, narrower than the read-ahead
it had to hold, so frames were decoded, evicted and decoded again inside one
pass. It is now `clamp(deviceMemory * 8, 24, 64)` frames: 84 MB on a 2 GB phone,
113 MB on a 4 GB one (and on iOS Safari, which does not implement
`deviceMemory`), 225 MB on an 8 GB desktop.

## The result

Same instrumentation, same harness, same machine:

| profile | scroll | master tier before | after |
|---|---|---|---|
| phone, 4G | 1,400 px/sec | 10.5% | **100%** |
| phone, 4G | 600 px/sec | 36.4% | **100%** |
| phone, 4G | 300 px/sec | 99.6% | **100%** |
| desktop | 1,400 px/sec | 20.5% | **100%** |
| desktop | 600 px/sec | 56.1% | **100%** |
| phone, 4x CPU throttle | 600 px/sec | 2.9% | **25 – 50%** |

Photographed mid-scroll at device resolution, the tier at each of six beats goes
from two sharp and four soft to **six sharp**, on both profiles. Mean focus — the
variance of a Laplacian, which an upscaled proxy cannot fake — rises from 2.6 to
4.6 on the phone and 10.6 to 13.3 on desktop.

```
             beat 1   2     3     4     5     6      mean
phone  before  h:7.4 p:1.5 p:1.7 p:1.4 h:1.5 p:1.9    2.6
phone  after   h:7.4 h:3.1 h:5.1 h:4.3 h:2.5 h:5.5    4.6
desk   before  h:14.2 p:10.0 p:7.0 p:12.7 h:14.4 p:5.1  10.6
desk   after   h:19.2 h:9.6 h:10.9 h:16.2 h:13.5 h:10.3 13.3
```

**What this cost.** During a hard 1,400 px/sec flick, delivery — the share of
demanded frames that reach the screen — falls: 91.8% to 79.7% on desktop, 71.4%
to 66.1% on the phone. That is the trade the ladder is built on, taken
deliberately: the frames not delivered are ones the stride skipped so the ones
that *are* delivered could be the master rather than a 7.3x upscale. At the
speeds people actually read at, delivery went the other way — 93.6% to 99.6% on
the phone at 600 px/sec, 72.6% to 93.5% on desktop.

**What this does not fix.** The masters are 720x1280 and a dpr-3 phone asks for
1170 px across, so even a perfect scroll is a 1.6x upscale. Closing that last
step needs a re-master from the 3840x2160 source (`docs/VISION-EIGHTEEN.md`), not
a scheduling change. And on a device slow enough to decode fewer than ~10 frames
a second the film is decode-bound whatever the schedule; it degrades to the
proxy, which is what the proxy is for.

## Reproducing

```bash
npm run build && npm start

# What tier reached the screen, across profiles and scroll speeds.
./scripts/measure-scrub-grid.sh mine

# The curtain's contract on six link conditions.
node scripts/verify-curtain.mjs

# What the film looks like mid-scroll, at device resolution.
node scripts/capture-film.mjs --out shots/after
```

`?debug=perf` shows the same numbers live on a real phone: the share of the
scroll served at full resolution, what the curtain cached and why it lifted, and
the stride and radius the ladder settled on.
