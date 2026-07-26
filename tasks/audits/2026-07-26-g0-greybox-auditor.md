---
date: 2026-07-26
slug: g0-greybox-b1-b3
range: 4a0884b..c813feb
auditor: fresh-context Claude (Regime B, Director-spawned)
verdict: PASS
---

# AUDITOR VERDICT (Regime B, fresh-context Claude) — Anvil G0 PR #5, range 4a0884b..c813feb

verdict: PASS

## Own-run evidence
Own detached worktree, HEAD c813feb5265b86bfc80c94bb212a7f45e8654271, clean tree. `pnpm install --frozen-lockfile` from anvil/, `pnpm build` exit 0, `pnpm test` exit 0. Counts: core 114 passed (17 files), iron-soul 15 passed (2 files), cli 52 passed + 2 todo, plus schema 17, authoring 9, genre-topdown2d 17, genre-fps2 7, genre-shmup 6, genre-net 6, genre-card 4, genre-vn 4, genre-arpg 4, net-colyseus 3. Reproduces the builder transcript exactly, package by package. Node v24.14.0, Windows.

## Reference vectors — ALL THREE LEGS MATCH
Computed outside builder code; builder fixtures verified AGAINST auditor values.
- (a) mulberry32 seed-42 first 8: 0.6011037519201636, 0.44829055899754167, 0.8524657934904099, 0.6697340414393693, 0.17481389874592423, 0.5265925421845168, 0.2732279943302274, 0.6247446539346129 — identical to fixture and shipped build. Seed 0 post-scramble initial state 0x3cd6e3f3 -> 0.14499588962644339, 0.908694715006277, ...; seed 1 -> 0.6270739405881613, 0.002735721180215478, ... — DIFFERENT sequences; aliasing fix real; holds cross-process (seed 0 ss1:cbdd9010 vs seed 1 ss1:767980a9).
- (b) FNV-1a 32-bit: ""=811c9dc5, "a"=e40c292c, "abc"=1a47e90b, "foobar"=bf9cf968, "the quick brown fox"=338f85c2 — shipped hashString matches all five incl. the two unfixtured.
- (c) 100-tick sim: independently recomputed ss1:be646bd7 = committed golden via auditor-reimplemented serializer + FNV-1a; stable across two in-process runs and two separate node invocations; regen protocol idempotent (byte-identical rewrite).

## Plan conformance
mulberry32 kept, no PCG32 PASS. Seed-0/1 aliasing fixed with gravewake seed-42 canary PASS (see R6). stream() pure/call-order-independent + fork() advancing parent exactly one step, no child() PASS (both contracts probed directly). B3 inverted correctly: core ships only hashString; serializer module-owned, throws on floats PASS. All 10 planned tests present, 2 partial (R3, R4). Golden update protocol respected PASS.

## Scope fence
Materially clean; ONE benign violation — docs/evidence/capture-g0-transcript.sh in diff, absent from tasks/G0-FILE-MANIFEST.md. Zero forbidden-path hits (packages/cli/, genre-*, NavGrid, ReplayRecorder, games/gravewake/, .github/, eslint). anvil/package.json exactly the one-line test-filter addition; pnpm-lock exactly the one workspace importer block; pnpm-workspace one line. Role separation clean: no cert/verdict file in range; builder did not self-certify.

## Findings (all non-blocking)
- R1 MEDIUM — capture-g0-transcript.sh outside the manifest; add the manifest line.
- R2 MEDIUM — manifest NOT pre-committed (same commit as the code it fences). G1 process fix: manifest commit precedes build commit.
- R3 MEDIUM — golden is 100 steps vs planned 10k ticks; sim RESOLVEs at TICK 36 so hashes byte-identical; no long-run determinism coverage.
- R4 MEDIUM — child-seed collision test is a weak proxy. Property independently verified HOLDING: 0 collisions over 100,000 labels; max |pearson r| 0.073 over 200 adjacent pairs at n=2000.
- R5 MEDIUM — splitmix32 exported as permanent public surface unauthorized by plan, AND misnamed (it is MurmurHash3 fmix32 + gamma add; canonical splitmix32(0x9e3779b9)=3653269916, this returns 0x3cd6e3f3). Unexport or rename mixSeed32.
- R6 MEDIUM — aliasing fix special-cases seed 0 only. Sequential seeds 1..10000 yield 9869 distinct FIRST draws (131 collisions; e.g. seeds 98 and 9739 collide at 0.5004222255665809). stream() path clean 10000/10000. BOUNDED: diverges at draw 2; determinism unaffected. Document stream(label) for sub-seeds; scramble-all + version-bump -> G1 Council.
- R7 LOW — seed-0 output change undisclosed (no CHANGELOG); nothing in-tree breaks (Kernel.ts:107 seed ?? 1).
- R8 LOW — capture script hardcodes the worktree path; use git rev-parse --show-toplevel.
- R9 LOW — transcript header git_head 4a0884b captured pre-commit from dirty worktree; not fabrication (all counts match auditor clean run at c813feb); judged on auditor run.
- R10 LOW — fork() unconsumed in shipped greybox; sim.ts:87 comment inaccurate.
- R11 LOW — canonicalize fails OPEN on Date-like objects (-> {}); reject non-plain prototypes.
- R12 LOW — sim.ts:146 dead branch; collapse to this.winner = null.
- R13 LOW — FNV-1a implemented twice in core; unify or assert equality in a test.

## Residuals carried
1. NO CI EVIDENCE — zero check-runs both SHAs, no runs repo-wide; Linux determinism leg UNPROVEN (auditor check = Windows/node 24 only). Not on the builder (manifest forbade CI edits); largest open gap; G1-entry.
2. fixedDt / Kernel integration absent; accumulator-drift concern returns at G1.
3. random() never int32-masks state (exact-integer-equivalent ~4.9M draws); add explicit | 0 at freeze.
4. R6 scramble-all + R3 long-run golden -> G1.
