---
date: 2026-07-26
slug: 2026-07-24-p0b-visual-evidence-strict-assets
target_repo: D:/Projects/IronSoul-Anvil/iron-soul-anvil
range: 8254a1b..997d896
certifier: Grok (xAI) — EMCC External Certifier
verdict: PASS
chat: PASS
execute: deferred (CISO gate)
vision: n/a
risk_class: low
---

# Grok cert — 2026-07-24-p0b-visual-evidence-strict-assets (P0b visual-evidence) attempt 2

## 1. Disclosure

- **Cold read.** Certifier did not author the range. Producer `lattice` / `builder_id: lattice:iron-soul-dfdu` /
  `builder_model: claude`. Handoff selected by `poll_select.py` (local pending `certifier_id: grok`).
- Coordination drop (attempt 2): `0-Inbox/grok-audit/cert-p0b-visual-evidence-strict-assets-attempt2-pending.md`
  on iron-soul-anvil `main`. Code range on `claude/p0b-visual-evidence` / **PR #3**
  (`https://github.com/Spade0704/iron-soul-anvil/pull/3`). Worktree
  `D:/Projects/IronSoul-Anvil/p0b-visual-evidence` at `997d896`.
- **Attempt 1** refused at pre-gate (`FAILED(validate_cert_handoff: missing phase; missing director_id;
  unknown cert_class 'mechanical-pass-human-aesthetic')`). Attempt 2 is a metadata re-drop of the
  same range/evidence (directive `dir-20260726-p0b-requeue-anvil3`); this tick certifies the code
  range after a clean schema gate.
- Certifier ≠ producer. Independent Auditor (Regime B) already PASS per handoff `auditor_ref`.

## 2. Chat

### Pre-gate (mandatory)

```text
python validate_poll_handoff.py <attempt2-handoff>
→ validate_cert_handoff.py
→ PASS
```

Handoff carries legal v1.1 fields: `phase: build`, `director_id: director:EMCC`,
`cert_class: cross-model-certified`, `directive_ref`, `builder_id`, `evidence_ref` narrative.

### Scope / range

| Check | Result |
|-------|--------|
| Range `8254a1b..997d896` resolves | Yes — single tip commit `997d896` (ancestor of range base) |
| Diff size | 12 files, +1405/-1 |
| Scope fence | **anvil-only** (`anvil/packages/cli/**` only; no non-anvil paths) |
| Wiring | `index.ts`: import + flag-guarded `runVisualEvidence(root)` under `--strict-assets` only |
| Additive | New `visual-evidence.ts` + 4 tests + fixtures + vendored schema; no silent default path |

### Mechanical / substance (cold read of `997d896`)

1. **Fail-closed taxonomy** — `PASS|FAIL|N/A|WARN|UNCOVERED`; asset-missing / unreadable → explicit
   FAIL (not throw-to-green). Unparseable sidecar → FAIL lines + `ok = false`. Catch blocks on
   walk/read either continue skip (sources/allowlist optional) or FAIL (sidecar parse).
2. **Six mechanical checks** — sha256 raw bytes; magic+PNG IHDR dims+res-class; path-binding +
   allowlist; palette declaration-level (degraded-labeled); provenance R1 (fresh-gen XOR base);
   attestation presence R2 (non-empty name). `evaluateSidecar` sets `ok = !anyFail && aesthetic.attested`.
3. **Two-leg render** — `MECHANICAL: PASS|FAIL (n/n)` vs `AESTHETIC: ATTESTED|NOT ATTESTED`; aesthetic
   never contains `PASS`. Checker `CERT_CLASS = "mechanical-pass-human-aesthetic"` is **output**
   vocabulary (not EMCC handoff cert_class). Tests assert no `"certified"` in rendered report blob.
4. **Tamper proof-of-life** — byte-flip → check-1 FAIL with expected/actual/offending; drives
   `mechanicalPass=false` / `ok=false`. Untampered companion asserts two-leg lines.
5. **Schema pin** — vendored `schemas/visual-evidence.schema.json` sha256
   `8c6eb411faa8d0ff31afe0440dc60554dc5875212049d0e462323f8e763452bd` (recomputed on worktree bytes
   by certifier; matches pin test + handoff).
6. **Prove fixture** — real `gravewarden.png` + sidecar under `__fixtures__/visual-evidence/`;
   prove test expects `MECHANICAL: PASS (6/6)` + `AESTHETIC: ATTESTED — JP, 2026-07-24`.
7. **Known non-blocking scope** (documented) — `uncovered()` helper exists but `runVisualEvidence`
   enumerates sidecars only; sidecar-less assets silent in v0.1 → v0.2 registry. Exit contract for
   covered assets intact; not a false-green on checked sidecars.

### Proposal-vs-job

Handoff proposal matches the shipped delta: per-asset visual-evidence sidecar checker wired
additively into `anvil test --strict-assets`. Docs/tests/fixtures align with Delta Force / council
SHIP v0.1 matrix (FULL / DEGRADED-labeled / DEFERRED todos).

### evidence_ref

Phase `build` evidence is a structured narrative (orchestrator re-run: 52 passed + 2 todo, pin,
prove, tamper). Field present and coherent with tree layout; independent rebuild not entered
(see Execute). No contradiction found on static audit.

**Chat: PASS**

## 3. Execute

**deferred (CISO gate)** — handoff has no `execute_approved: true` and no explicit CISO rebuild
approval in body. Cross-vendor execution isolation still gated per
`references/ciso-execute-gate.md`. Certifier did **not** run `pnpm -C packages/cli test` as a formal
Execute leg. Floor does not require Execute agreement while deferred.

## 4. Vision

**n/a** — target is a CLI mechanical checker + fixture prove-pair, not a product UI subject to
screenshot-vs-committed-comp fidelity scoring. Aesthetic leg is human sign-off presence, not
Vision-gate pixel/comp scoring.

## 5. Verdict

**PASS**

Chat mechanical floor clean; scope fences held; fail-closed and two-leg contracts observed on cold
read; schema pin recomputed match. Execute deferred (CISO). Vision n/a.

Director closes on **DUAL PASS** (independent Auditor PASS + this Grok PASS). Human merges PR #3.
Certifier does not merge.
