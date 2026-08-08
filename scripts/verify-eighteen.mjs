#!/usr/bin/env node
/**
 * EIGHTEEN — Phase 1 verification harness.
 *
 * The grading rubric for `docs/phases/EIGHTEEN-PHASE-1-FOUNDATION-AND-TRUTH.md`.
 * Written by the reviewer, not the implementer: an executor never grades itself.
 *
 * Usage:  node scripts/verify-eighteen.mjs
 * Exit 0 = every check passed. Exit 1 = at least one failed.
 *
 * Static checks run first (fast); the typecheck and production build run last
 * because they are the slow ones and there is no point building a repo that
 * already failed the contract.
 */

import { readFileSync, existsSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const results = []

const read = (p) => (existsSync(join(ROOT, p)) ? readFileSync(join(ROOT, p), 'utf8') : null)
const check = (name, fn) => {
  try {
    const detail = fn()
    results.push({ name, ok: true, detail: detail || '' })
  } catch (err) {
    results.push({ name, ok: false, detail: err.message })
  }
}
const assert = (cond, msg) => {
  if (!cond) throw new Error(msg)
}

// ── 1. Declared dependencies ────────────────────────────────────────────────
check('maath is a declared dependency', () => {
  const pkg = JSON.parse(read('package.json'))
  const deps = { ...pkg.dependencies, ...pkg.devDependencies }
  assert(deps.maath, 'maath is imported by components/canvas/Director.tsx but not in package.json')
  return `maath@${deps.maath}`
})

// ── 2. One clock ────────────────────────────────────────────────────────────
check('the mock sunState() is gone', () => {
  const hits = execSync(
    `grep -rn "sunState" lib components app 2>/dev/null || true`,
    { cwd: ROOT, encoding: 'utf8' }
  ).trim()
  assert(!hits, `mock sun still referenced:\n${hits}`)
  return 'no references'
})

check('sun.ts uses a piecewise time curve, not a linear span', () => {
  const src = read('lib/astro/sun.ts')
  assert(src, 'lib/astro/sun.ts is missing')
  assert(!/SPAN_MS/.test(src), 'SPAN_MS (the linear mapping) is still present')
  assert(
    /timeAt|TIME_CURVE|SEGMENTS|getDateAtT/.test(src),
    'no piecewise time curve found (expected timeAt / TIME_CURVE / SEGMENTS / getDateAtT)'
  )
  assert(
    /0\.33/.test(src) && /0\.66/.test(src) && /130/.test(src) && /115/.test(src) && /620/.test(src),
    'the curve does not carry the three declared segments (130 / 115 / 620 min at t 0.33 / 0.66)'
  )
  assert(
    !/new Date\(2025, 9, 12/.test(src),
    'BASE_DATE is still hardcoded to Oct 12 2025; it must be today at 15:40 local'
  )
  return 'piecewise curve present, base date dynamic'
})

// ── 3. One act table ────────────────────────────────────────────────────────
const ACT_IDS = ['L-01', 'L-02', 'L-03', 'L-04', 'L-05', 'L-06', 'L-07', 'L-08', 'L-09']

check('night.ts exports a single ACTS table with all 9 acts', () => {
  const src = read('lib/store/night.ts')
  assert(src, 'lib/store/night.ts is missing')
  assert(/export const ACTS/.test(src), 'no `export const ACTS` found')
  const missing = ACT_IDS.filter((id) => !src.includes(`'${id}'`) && !src.includes(`"${id}"`))
  assert(missing.length === 0, `ACTS is missing: ${missing.join(', ')}`)
  return 'all 9 acts declared'
})

check('actFor() derives from ACTS rather than hardcoding thresholds', () => {
  const src = read('lib/store/night.ts')
  const actForBody = src.slice(src.indexOf('actFor'))
  assert(
    !/t < 0\.\d+\) return/.test(actForBody),
    'actFor() still contains hardcoded `if (t < 0.xx) return` thresholds — it must read ACTS'
  )
  return 'derived from ACTS'
})

check('page.tsx renders all 9 acts and holds no second act list', () => {
  const src = read('app/page.tsx')
  assert(src, 'app/page.tsx is missing')
  const missing = ACT_IDS.filter((id) => !src.includes(id))
  assert(missing.length === 0, `page.tsx has no section for: ${missing.join(', ')}`)

  const sections = (src.match(/<section/g) || []).length
  assert(sections === 9, `expected 9 <section> elements, found ${sections}`)

  // The contract is not "nine sections exist" — it is that the DOM derives its act
  // boundaries, ids and clocks from ACTS. Hardcoded "L-0N · HH:MM" strings are the
  // exact mechanism by which the DOM and actFor(t) drifted apart in the first place.
  assert(/from '@\/lib\/store\/night'/.test(src), 'page.tsx does not import from lib/store/night')
  assert(/\bACTS\b/.test(src), 'page.tsx does not reference ACTS — its sections are a second act list')
  const hardcoded = src.match(/L-0\d\s*·\s*\d{2}:\d{2}/g) || []
  assert(
    hardcoded.length === 0,
    `${hardcoded.length} hardcoded act/clock labels in page.tsx (${hardcoded.slice(0, 3).join(', ')}…) — ` +
      `these must be rendered from ACTS, not typed in`
  )
  return `${sections} acts, all labels derived from ACTS`
})

// ── 4. Location truth ───────────────────────────────────────────────────────
check('site-config carries the confirmed Rumsu pin', () => {
  const src = read('lib/site-config.ts')
  assert(src, 'lib/site-config.ts is missing')
  assert(/32\.1198/.test(src), 'latitude is not 32.1198 (Rumsu, confirmed by the founder)')
  assert(/77\.1731/.test(src), 'longitude is not 77.1731 (Rumsu, confirmed by the founder)')
  assert(!/32\.1215824/.test(src), 'the stale Naggar GBP latitude is still present')
  return '32.1198, 77.1731'
})

// ── 5. Zero-render HUD ──────────────────────────────────────────────────────
check('TimeRail does not drive React state from the scroll', () => {
  const src = read('components/film/TimeRail.tsx')
  assert(src, 'components/film/TimeRail.tsx is missing')
  assert(
    !/useState/.test(src),
    'TimeRail still uses useState — it must write to the DOM via refs inside one rAF'
  )
  return 'ref-based'
})

// ── 6. It compiles and it builds ────────────────────────────────────────────
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
console.log('\nEIGHTEEN · Phase 1 verification\n' + '─'.repeat(60))
for (const r of results) {
  if (!r.ok) failed++
  const mark = r.ok ? 'PASS' : 'FAIL'
  console.log(`${mark}  ${r.name}`)
  if (r.detail) console.log(`      ${r.detail.split('\n').join('\n      ')}`)
}
console.log('─'.repeat(60))
console.log(`${results.length - failed}/${results.length} passed\n`)
process.exit(failed > 0 ? 1 : 0)
