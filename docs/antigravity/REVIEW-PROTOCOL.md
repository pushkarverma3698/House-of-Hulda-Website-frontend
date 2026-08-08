# Antigravity ⇄ Claude — Working Protocol

Antigravity implements. Claude reviews, manually tests, and fixes what it finds. The executor never
grades itself.

## Division

| | Antigravity | Claude |
|---|---|---|
| Writes implementation code | ✅ | only to fix review findings |
| Writes the grading harness | ❌ | ✅ (`scripts/verify-eighteen.mjs`) |
| Decides architecture, contracts, act table, shaders, copy | ❌ | ✅ |
| Runs the harness | ✅ (must, before reporting) | ✅ (re-runs; never trusts the report) |
| Manual browser testing | ❌ | ✅ |
| Declares a phase done | ❌ | ✅ |

## Loop

1. **Claude** commits a baseline and writes the phase prompt + the grader.
2. **Antigravity** implements on a branch until `node scripts/verify-eighteen.mjs` exits 0, then
   reports the raw harness output.
3. **Claude** reviews: `git diff` read in full, harness re-run, then manual browser testing against
   the phase's success criteria.
4. **Claude fixes findings directly** when they are small and the blast radius is visible — a wrong
   constant, a missed edge case, a contract violation. Findings that need re-architecting go back to
   Antigravity with a new prompt.
5. **Claude** writes the Verification results section of the phase doc. Only then does the next
   phase start.

## Rules

- **Never accept Antigravity's summary as evidence.** Re-run the harness. Read the diff.
- **A green harness is necessary, not sufficient.** It catches contract violations, not ugliness,
  jank, or a shot that reads wrong. That is what the manual pass is for.
- **Prompts are self-contained.** Antigravity starts cold every time — no conversation history, no
  knowledge of the vision. Restate the contract in every prompt.
- **Scope is stated as a whitelist and a blacklist.** "In scope: these files. Forbidden: everything
  else." Unscoped edits are a review failure even if they are improvements.
- **One phase per branch.** `eighteen/phase-N-<slug>`. Never on `main`.

## Prerequisites for each dispatch

- Antigravity.app running with `~/Projects/house-of-hulda` open as a workspace (`agentapi
  new-conversation` needs a server-side `project_id`; this is a one-time manual step per project).
- Working tree clean — otherwise `git diff` mixes Antigravity's work with pre-existing changes and
  the review is worthless.
- Dispatch via `~/Projects/scripts/ai-tools/agy` (`agy new`, `agy send`, `agy status`, `agy steps`),
  or paste the prompt into the Antigravity GUI.

## Manual test pass (Claude, every phase)

Against `npm run dev` on :3000, using browser automation:

- Scroll in 5% steps; assert the visible act label equals `actFor(t)` and the HUD clock is monotonic.
- Sample the canvas centre pixel between steps to confirm frames actually advance.
- Re-run at 375×812 and 1920×1080; confirm no shot loses its subject.
- Toggle `prefers-reduced-motion`; confirm the full story renders with zero canvases.
- Check the console for errors and the network panel for failed or oversized assets.
