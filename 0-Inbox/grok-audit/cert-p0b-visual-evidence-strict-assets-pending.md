---
cert_handoff: v1.1
status: pending
cert_class: mechanical-pass-human-aesthetic
risk_class: low
directive_ref: dir-20260724-visual-evidence-strict-assets
builder_id: lattice:iron-soul-dfdu
builder_model: claude
certifier_id: grok
decorrelation: cross
repo: iron-soul-anvil
range: 8254a1b..997d896
pr: https://github.com/Spade0704/iron-soul-anvil/pull/3
pr_branch: claude/p0b-visual-evidence
evidence_ref: >-
  executes-clean VERIFIED (independent orchestrator re-run): pnpm -C packages/cli test = 52 passed + 2 todo (54),
  5 files; existing 13 cli.integration tests intact; count rose 13->54; full monorepo pnpm test green. Vendored
  schema sha256 == pin 8c6eb411faa8d0ff31afe0440dc60554dc5875212049d0e462323f8e763452bd (pin-checked in-suite).
  Prove-run on a real gravewake sprite fixture: MECHANICAL PASS (6/6) / AESTHETIC ATTESTED. Tamper-test red-first
  (real byte-flip -> check-1 FAIL, non-tautological).
auditor_ref: >-
  independent Auditor (Regime B, != builder) PASS — no FALSE-GREEN path; fail-closed holds (all catch blocks ->
  explicit FAIL/N/A/WARN, zero log-and-continue-to-green); tamper-test non-tautological; scope fences held
  (additive one-module + one flag-guarded call site, vendor-verbatim schema, anvil-only diff, fixture-not-real-asset);
  "certified" only in doc-of-ban, never an output/cert-class value.
cert_handoff_doc: anvil/packages/cli/CERT-HANDOFF-p0b-visual-evidence-v0_1.md
delta_force_ref: (iron-soul repo) tasks/delta-force/2026-07-24-p0b-visual-evidence-strict-assets.md
schema_home: EMCC.Library Codex §9 (wiki.codex/git/codex/schemas/visual-evidence.schema.json, PR #71); pin 8c6eb411..52bd
---

# Cert-handoff (status: pending) — P0b Visual-Evidence Standard v0.1 (`anvil test --strict-assets`)

**For the cross-model certifier (Grok).** This is the coordination-plane drop on `iron-soul-anvil` main; the P0b
CODE lives on the fork branch `claude/p0b-visual-evidence` / **PR #3** (human-at-merge). Nothing is merged.

## What to certify
The P0b delta `8254a1b..997d896` (12 files, +1405/-1): a per-asset visual-evidence sidecar checker wired
additively into the existing `--strict-assets` flag. Builder = Claude Lattice; **certifier = Grok (cross-model
decorrelation)**. Independent Auditor (Claude, separate seat) already PASS — this is the SECOND, cross-vendor leg.

## Legs (framework/22 — dual-PASS closes)
- build DONE · executes-clean VERIFIED (see `evidence_ref`) · independent Auditor Regime B PASS (see `auditor_ref`).
- **cross-model cert = THIS request (Grok /cross-check).** On Grok PASS → dual-PASS → human merges PR #3.

## What the build is (for the review)
- Additive: `anvil/packages/cli/src/visual-evidence.ts` (6 check fns + `evaluateSidecar` + two-leg renderer +
  `runVisualEvidence`) + vendored SHA-pinned schema + `__fixtures__/visual-evidence/` prove-pair + 4 test files;
  `index.ts` +9/-1 (one import + one flag-guarded call site; nothing runs when the flag is off).
- 6 checks (council SHIP v0.1): FULL — sha256-on-disk / format+dims+res-class (magic-bytes + PNG IHDR, no
  image-decode dep) / path-binding (exact-basename + allowlist) / provenance + R1 (fresh-gen XOR base) + R2
  (signoff.name non-empty). DEGRADED-labeled — palette declaration-level (prints its own limitation; pixel deferred).
  DEFERRED `test.todo` (metric specified) — palette pixel Lab ΔE (alpha=0 excluded) + vision-likeness.
- Honest by construction: fail-closed taxonomy PASS|FAIL|N/A|WARN|UNCOVERED; exit≠0 iff any FAIL or NOT-ATTESTED;
  two-leg output (`MECHANICAL: PASS (n/n)` + a SEPARATE `AESTHETIC: ATTESTED — <name>`; the human leg NEVER renders
  as `PASS`); `cert_class` `mechanical-pass-human-aesthetic`; the string "certified" never appears as an output value.

## Known scope note (Auditor, non-blocking → v0.2)
UNCOVERED enumerates sidecar-bearing assets only; sidecar-less assets are silent (needs the Library §9 asset
registry, B4/B5). NOT a false-green; exit contract intact. Documented + deferred to v0.2.

**On Grok verdict, re-drop this file `status:done` (or `status:fail`) with the Grok cert appended. Nothing merges
until dual-PASS + human-at-merge.**
