#!/usr/bin/env node
/**
 * PROVENANCE — Phase 0 verification harness ("The Honest Cut").
 *
 * The grading rubric for `docs/THESIS-PROVENANCE.md`.
 * Written by the reviewer, not the implementer: an executor never grades itself.
 *
 * Usage:  node scripts/verify-honesty.mjs
 * Exit 0 = every check passed. Exit 1 = at least one failed.
 *
 * This harness does not check whether the site is beautiful. It checks whether it is
 * capable of lying. Static checks run first; the typecheck and build run last.
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { join, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const results = []

const read = (p) => (existsSync(join(ROOT, p)) ? readFileSync(join(ROOT, p), 'utf8') : null)
const check = (name, fn) => {
  try {
    results.push({ name, ok: true, detail: fn() || '' })
  } catch (err) {
    results.push({ name, ok: false, detail: err.message })
  }
}
const assert = (cond, msg) => {
  if (!cond) throw new Error(msg)
}

/** Every .ts/.tsx under app/, components/, content/, lib/. */
function sourceFiles() {
  const out = []
  const walk = (dir) => {
    if (!existsSync(dir)) return
    for (const name of readdirSync(dir)) {
      const full = join(dir, name)
      if (statSync(full).isDirectory()) walk(full)
      else if (/\.tsx?$/.test(name)) out.push(full)
    }
  }
  for (const d of ['app', 'components', 'content', 'lib']) walk(join(ROOT, d))
  return out
}

// ── 1. The asset registry exists and has teeth ──────────────────────────────
check('content/provenance.ts declares the asset registry', () => {
  const src = read('content/provenance.ts')
  assert(src, 'content/provenance.ts is missing — no asset registry means no provenance')
  assert(/export const ASSET_PROVENANCE/.test(src), 'no `export const ASSET_PROVENANCE` found')
  for (const field of ['path', 'origin', 'source', 'capturedAt', 'verifiedBy']) {
    assert(src.includes(field), `AssetProvenance is missing the \`${field}\` field`)
  }
  assert(
    /'camera'|"camera"/.test(src) && /'computed'|"computed"/.test(src) && /'decorative'|"decorative"/.test(src),
    'origin must be one of camera | computed | decorative — all three must appear'
  )
  return 'registry present'
})

check('every image path referenced in code has a provenance entry', () => {
  const prov = read('content/provenance.ts')
  assert(prov, 'content/provenance.ts is missing')
  const missing = []
  for (const file of sourceFiles()) {
    if (file.endsWith('provenance.ts')) continue
    const src = readFileSync(file, 'utf8')
    for (const m of src.matchAll(/['"`](\/(?:frames|images|video)\/[^'"`$]+)['"`]/g)) {
      if (!prov.includes(m[1])) missing.push(`${relative(ROOT, file)} → ${m[1]}`)
    }
  }
  assert(
    missing.length === 0,
    `${missing.length} asset reference(s) with no provenance entry:\n  ${missing.slice(0, 8).join('\n  ')}`
  )
  return 'all referenced assets registered'
})

check('no camera-origin asset is unverified', () => {
  const prov = read('content/provenance.ts')
  // An entry that claims to come from a camera must name who verified it.
  const entries = prov.split(/\{/).slice(1)
  const bad = entries
    .filter((e) => /origin:\s*'camera'/.test(e) && /verifiedBy:\s*null/.test(e))
    .map((e) => (e.match(/path:\s*'([^']+)'/) || [])[1] || '?')
  assert(
    bad.length === 0,
    `${bad.length} camera asset(s) with verifiedBy: null — they must not be registered as camera:\n  ${bad.slice(0, 6).join('\n  ')}`
  )
  return 'no unverified camera assets'
})

// ── 2. The claims ledger ────────────────────────────────────────────────────
check('content/claims.ts declares the claims ledger', () => {
  const src = read('content/claims.ts')
  assert(src, 'content/claims.ts is missing — no ledger means unverifiable copy can ship')
  assert(/export const CLAIMS/.test(src), 'no `export const CLAIMS` found')
  for (const field of ['id', 'text', 'status', 'evidence']) {
    assert(src.includes(field), `Claim is missing the \`${field}\` field`)
  }
  return 'ledger present'
})

check('no claim is marked verified without evidence', () => {
  const src = read('content/claims.ts')
  const entries = src.split(/\{/).slice(1)
  const bad = entries
    .filter((e) => /status:\s*'verified'/.test(e) && /evidence:\s*null/.test(e))
    .map((e) => (e.match(/id:\s*'([^']+)'/) || [])[1] || '?')
  assert(bad.length === 0, `verified with no evidence: ${bad.join(', ')}`)
  return 'every verified claim cites evidence'
})

// ── 3. The specific fabrications are gone from rendered copy ────────────────
const FABRICATIONS = [
  [/500 years/i, '"500 years" — contradicts the 200-year claim elsewhere; neither is confirmed'],
  [/five centuries/i, '"five centuries" — same unconfirmed age claim'],
  [/bortle/i, '"Bortle Class 1" — unsupported dark-sky superlative'],
  [/200\s?mm.{0,20}refractor|refractor/i, '"200mm refractor" — unconfirmed owned equipment'],
  [/without a filter/i, '"pure enough to drink without a filter" — untested health claim'],
  [/no mortar|no iron nails/i, '"No mortar / No iron nails" — contradicted by the master footage'],
]

check('fabricated factual claims no longer appear as literals in app/ or components/', () => {
  const hits = []
  for (const file of sourceFiles()) {
    const rel = relative(ROOT, file)
    if (!rel.startsWith('app') && !rel.startsWith('components')) continue
    const src = readFileSync(file, 'utf8')
    for (const [re, why] of FABRICATIONS) {
      const m = src.match(re)
      if (m) hits.push(`${rel}: ${why}`)
    }
  }
  assert(hits.length === 0, `${hits.length} fabricated claim(s) still rendered:\n  ${hits.join('\n  ')}`)
  return 'no fabricated literals'
})

// ── 4. The DOM derives its acts from ACTS ───────────────────────────────────
check('page.tsx derives act labels and clocks from ACTS', () => {
  const src = read('app/page.tsx')
  assert(src, 'app/page.tsx is missing')
  assert(/\bACTS\b/.test(src), 'page.tsx does not reference ACTS — its sections are a second act list')
  const hardcoded = src.match(/L-0\d\s*·\s*\d{2}:\d{2}/g) || []
  assert(
    hardcoded.length === 0,
    `${hardcoded.length} hardcoded act/clock label(s) (${hardcoded.slice(0, 3).join(', ')}…) — render them from ACTS`
  )
  return 'derived from ACTS'
})

check('section heights are proportional to the ACTS spans', () => {
  const src = read('app/page.tsx')
  // Fixed per-section heights cannot express unequal act spans; the height must come
  // from each act's (tEnd - tStart). Literal h-[NNNvh] on a story section is the bug.
  const literal = src.match(/<section[^>]*\bh-\[\d+vh\]/g) || []
  assert(
    literal.length === 0,
    `${literal.length} section(s) with a literal viewport height — height must derive from (tEnd - tStart)`
  )
  return 'heights derived'
})

// ── 5. The sky does not claim to be a catalogue while being random ──────────
check('StarField does not describe random points as a star catalogue', () => {
  const src = read('components/canvas/StarField.tsx')
  assert(src, 'components/canvas/StarField.tsx is missing')
  const isRandom = /Math\.random\(\)/.test(src)
  const claimsCatalogue = /catalog/i.test(src)
  assert(
    !(isRandom && claimsCatalogue),
    'StarField generates points with Math.random() while describing itself as a star catalogue — ' +
      'either load a real catalogue or drop the claim and register it as decorative'
  )
  return isRandom ? 'random, honestly labelled' : 'catalogue-driven'
})

// ── 6. The loader reports real progress ─────────────────────────────────────
check('the preloader cannot report progress above 100%', () => {
  const src = read('components/film/Preloader.tsx')
  assert(src, 'components/film/Preloader.tsx is missing')
  assert(
    /Math\.min\(\s*100/.test(src) || /Math\.min\(\s*1\s*,/.test(src),
    'preloader progress is not clamped — it renders values above 100% (observed: 112%)'
  )
  assert(
    !/12 OCT|SUNSET 18:04|ASTRO DARK 19:41/.test(src),
    'preloader prints a hardcoded October date while the clock runs on today — derive it from lib/astro/sun.ts'
  )
  return 'clamped and date-derived'
})

// ── 7. Repo hygiene ─────────────────────────────────────────────────────────
check('no scratch scripts left in the repo root', () => {
  const junk = ['capture.js', 'check_logs.js', 'debug_screenshot.js', 'test_ui.js', 'test_editorial.js']
  const present = junk.filter((f) => existsSync(join(ROOT, f)))
  assert(present.length === 0, `scratch files still committed: ${present.join(', ')}`)
  return 'root clean'
})

check('exactly one lockfile', () => {
  const locks = ['package-lock.json', 'pnpm-lock.yaml', 'yarn.lock'].filter((f) =>
    existsSync(join(ROOT, f))
  )
  assert(locks.length === 1, `${locks.length} lockfiles present (${locks.join(', ')}) — installs are non-deterministic`)
  return locks[0]
})

// ── 8. It compiles and it builds ────────────────────────────────────────────
check('npx tsc --noEmit is clean', () => {
  execSync('npx tsc --noEmit', { cwd: ROOT, stdio: 'pipe' })
  return 'no type errors'
})

check('npm run build succeeds', () => {
  execSync('npm run build', { cwd: ROOT, stdio: 'pipe', timeout: 400_000 })
  return 'production build green'
})

// ── Report ──────────────────────────────────────────────────────────────────
let failed = 0
console.log('\nPROVENANCE · Phase 0 verification\n' + '─'.repeat(64))
for (const r of results) {
  if (!r.ok) failed++
  console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}`)
  if (r.detail) console.log(`      ${r.detail.split('\n').join('\n      ')}`)
}
console.log('─'.repeat(64))
console.log(`${results.length - failed}/${results.length} passed\n`)
process.exit(failed > 0 ? 1 : 0)
