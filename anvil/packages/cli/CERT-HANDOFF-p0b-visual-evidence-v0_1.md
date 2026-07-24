# Cert-Handoff — P0b Visual-Evidence Standard v0.1 (`--strict-assets`)

**cert-handoff schema:** v1.1
**directive_ref:** `dir-20260724-visual-evidence-strict-assets` (Director/EMCC)
**council authority (standard):** `EMCC/tasks/council/2026-07-24-visual-evidence-standard.md` (SHIP v0.1)
**pre-build gate (approach):** `/delta-force` PASS — transcript `Iron Soul:tasks/delta-force/2026-07-24-p0b-visual-evidence-strict-assets.md`
**repo:** iron-soul-anvil (monorepo) · **branch:** `claude/p0b-visual-evidence` (off origin/main `8254a1b`) · isolated worktree, anvil-only diff
**builder_id:** `lattice:iron-soul-dfdu` · **builder_model:** `claude` *(operator reroute — spec line 5; the stale `builder:grok` in the spec's gate block is superseded)*
**director_id:** `vsaig3uw` (EMCC Director)
**certifier:** cross-model — **PENDING** (Grok /cross-check; Hermes currently down → Director routes a manual clean-peer /cross-check if still down at handoff, honestly labeled, Grok slot deferred-not-faked)
**decorrelation:** cross (builder = Claude Lattice; independent Auditor = Claude, separate seat; cross-model cert = different vendor)
**cert_class:** `mechanical-pass-human-aesthetic` *(NEVER "certified" for visuals)*

## Legs (framework/22: build → executes-clean → independent Auditor → cross-model cert → dual-PASS)
- **build:** DONE. New pure module `packages/cli/src/visual-evidence.ts` (6 check fns + evaluateSidecar + two-leg renderer + runVisualEvidence) + vendored SHA-pinned schema + `__fixtures__/visual-evidence/` prove-pair + 4 test files. `index.ts` = +9/-1 (one import + one flag-guarded call site at the existing `--strict-assets` branch; nothing runs when the flag is off).
- **executes-clean:** VERIFIED (independent re-run by the orchestrator, not narrated). `pnpm -C packages/cli test` = **52 passed + 2 todo (54)**, 5 files; existing 13 `cli.integration` tests intact; count rose 13→54. Full monorepo `pnpm test` completed, changed package green, no failures. evidence_ref = captured vitest output (this session).
- **independent Auditor (Regime B, ≠ builder):** **PASS** — no FALSE-GREEN path found; fail-closed holds (all 7 catch blocks audited → explicit FAIL/N/A/WARN, zero log-and-continue-to-green); pin recomputed == `8c6eb411faa8d0ff31afe0440dc60554dc5875212049d0e462323f8e763452bd`; tamper test non-tautological (real byte-flip → check-1 FAIL); scope fences held (additive, vendor-verbatim, anvil-only, fixture-not-real-asset); "certified" only in doc-of-ban (comment/schema-desc/test-assert), never an output/cert-class value.
- **cross-model cert:** PENDING (Director's leg).

## Schema (shared, zero-divergence)
Canonical home = **Library Codex §9** (`EMCC.Library:wiki.codex/git/codex/schemas/visual-evidence.schema.json`, PR #71, human-at-merge). Content pin sha256 `8c6eb411…52bd`. Anvil VENDORS it verbatim (`packages/cli/src/schemas/visual-evidence.schema.json`, pin-checked in-suite) and authors NO schema-of-record. Library builds the §9 ingest validator (`validate_visual_evidence.py`) against the same artifact — two validators, one schema.

## Ship matrix (v0.1)
- **FULL MECHANICAL:** #1 sha256 (raw bytes) · #2 magic-bytes + PNG IHDR dims + res-class (no image-decode dep) · #3 path-binding (exact-basename/word-boundary + allowlist escape) · #5 provenance + R1 (fresh-gen XOR base) + R2 (signoff.name non-empty).
- **DEGRADED-LABELED:** #4 palette = declared-palette well-formed + string-subset of the named style-bible palette (prints its own "v0.1: declaration-level only; pixel verification deferred" limitation; no pixel decode; unresolved style_bible_ref = WARN).
- **DEFERRED (test.todo, metric specified):** #4-pixel = per-pixel nearest-declared Lab ΔE (alpha=0 excluded, never naive RGB Euclidean) · #6-likeness vision = provenance-flag + attestation-presence only in v0.1.

## Output contract
Verdict taxonomy `PASS|FAIL|N/A(reason)|WARN|UNCOVERED`; **exit ≠ 0 IFF any FAIL or NOT-ATTESTED**; machine-readable JSON summary alongside human lines. **Two-leg report, always:** `MECHANICAL: PASS (n/n)` + a SEPARATE `AESTHETIC: ATTESTED — <name>, <date>` (or `NOT ATTESTED` = fail); the human leg NEVER renders as `PASS`.

## Prove-run (real fixture sidecar)
`gravewarden.png` (byte-identical copy of `games/gravewake/assets/actors/gravewarden.png`, sha `9715a94a…f314`) → `MECHANICAL: PASS (6/6)` · `AESTHETIC: ATTESTED — JP, 2026-07-24`.

## Known scope note (Auditor, non-blocking → v0.2)
UNCOVERED "printed, never silent" is PARTIAL in v0.1: `runVisualEvidence` enumerates `*.visual-evidence.json` sidecars only, so a **sidecar-less asset is silent** and the exported `uncovered()` helper is dead in the runtime path. This does NOT violate the exit contract (v0.1 exits 0 on UNCOVERED by design) and is NOT a false-green (anything with a sidecar that should fail, fails). True sidecar-less enumeration needs an asset registry the sidecar-driven checker lacks at this layer → **deferred to v0.2** (documented, not silently dropped).

## Close
DRAFT — human-at-merge. Closes on **dual-PASS** (independent Auditor PASS ✓ + cross-model cert PENDING). "certified" never appears in any output string.
