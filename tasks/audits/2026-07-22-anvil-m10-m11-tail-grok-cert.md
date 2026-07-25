---
date: 2026-07-26
slug: 2026-07-22-anvil-m10-m11-tail
target_repo: D:/Projects/IronSoul-Anvil/iron-soul-anvil
range: 6b53a3b1e542a3c52fc9ae00b5017f470ebf5433
certifier: Grok (xAI) — EMCC External Certifier
verdict: PASS
chat: PASS
execute: deferred (CISO gate)
vision: n/a
---

# Grok cert — 2026-07-22-anvil-m10-m11-tail (M10/M11 compile gate + root wiring + acceptances)

## 1. Disclosure

- **Cold read.** Certifier did not author the range. Producer `lattice` / builder
  `lattice:iron-soul-anvil/cli-builder-04`; commit author Claude (Anthropic).
- Handoff selected by `poll_select.py` (oldest local pending `certifier_id: grok`).
- Range is single commit `6b53a3b` on
  `origin/claude/herald-marketing-publish-ru4szs` (not first-parent of current
  `main`; M10+M11 later landed on `main` via squash `8254a1b`). Certification is
  of the **handoff-pinned range**, not of tip of main.
- Pre-gate: `validate_poll_handoff.py` → **PASS**. `evidence_ref` present and
  documents green `pnpm test` / `lint` / `check` plus CLI smoke and negative probe.

## 2. Chat

### Scope (Stage 1)

`git show 6b53a3b --stat` — 14 files, +890/−61:

| Path | Role |
|------|------|
| `anvil/packages/cli/src/index.ts` | `authoringCompileGate` on validate/test/dev (T-M10-011) |
| `anvil/packages/cli/src/cli.integration.test.ts` | 4 new gate tests (positive, test-refusal, dev fail-fast, v1 skip) |
| `anvil/package.json` | Root `pnpm test` adds `@anvil/authoring` + `@anvil/genre-arpg` |
| `anvil/packages/core/src/validate.ts` | MODULE_UNKNOWN hint lists `genre-arpg` |
| `anvil/pnpm-lock.yaml` | uWebSockets.js restored to tarball form (3 sites, pin `442087c0`) |
| `games/gravewake/content/items/tyrant_edge.json` | `critMult` 0.35 → 1.35 |
| Specs / design docs (20, 14, 18, S-*) | Acceptance / breakdown flips T-M10-011..013, T-M11-008/009 |
| `docs/evidence/2026-07-22-anvil-tail-tests.txt` | Executes-clean evidence |

No scope breach: CLI compile integration, root-suite wiring, title content fix for
acceptance gate, audit-warning fixes, docs, evidence.

### Mechanical floor (Stage 2)

| Check | Result |
|-------|--------|
| `validate_poll_handoff.py` / cert-handoff schema | PASS |
| `evidence_ref` (`docs/evidence/2026-07-22-anvil-tail-tests.txt`) | Present, readable, exit 0 for test/lint/check; negative probe exit 1 expected |
| Consumer `scripts/nonbuild_check.py` | Absent — skip |
| Consumer `scripts/doc_drift_check.py` | Absent — skip |
| Consumer `scripts/reconcile_backlog.py` | Absent — skip |
| Tree porcelain before cert write | empty (byte-clean) |

**Independent cold checks (certifier):**

- **Gate is new:** parent tree imported `compileProject` but only used it on
  describe/capabilities paths; `cmdValidate` / `cmdTest` / `cmdDev` had no
  `authoringCompileGate`. At range, all three generic paths call the gate.
- **Positive-probe design is real:** integration test breaks only `game.spec.yaml`
  (core never reads it); without the gate validate would still pass. Matches
  auditor claim; own read of gate + test agrees.
- **v1 boundary:** `version === undefined || version === 1` → skip compile
  (S-AUTHORING §2). Dedicated test uses `legacyRoot`.
- **Root suite:** `anvil/package.json` test filter includes both omitted packages;
  CI inherits with zero workflow edits (doc claim matches package.json delta).
- **critMult basis:** schema `critMult: z.number().min(1)`; Gravewake combat uses
  `base * (isCrit ? stats.critMult : 1)` — multiplier form. `0.35` violates min(1)
  and would *reduce* crit damage; `1.35` is the correct multiplier for a +35%
  bonus. Disposition sound.
- **Lockfile:** three uWebSockets.js sites restored to
  `codeload…/tar.gz/442087c0…` (same pin as git form; matches prior good form
  class). MODULE_UNKNOWN hint adds `genre-arpg` only.

**Evidence summary (Lattice run, 2026-07-21T19:49Z):**

- `pnpm test` exit 0 — authoring 9, genre-arpg 4, cli **13/13** (includes four
  T-M10-011 cases).
- `pnpm lint` exit 0.
- Full `pnpm check` exit 0 including `validate:gravewake` after critMult fix.
- CLI smoke: validate/test hello-card ok; bounded dev serves (exit 124 = timeout
  while up); broken intent → validate exit 1 `INTENT_INVALID`.

### Proposal vs job (Stage 3)

Job: T-M10-011/012/013 + T-M11-008/009 + chunk-B audit warnings (lockfile tarball
restore + MODULE_UNKNOWN hint).

Delivered:

- **T-M10-011:** validate/test/dev gate schema-v2 through `compileProject`; v1 skip.
- **T-M10-012 / T-M11-008:** root test filter includes authoring + genre-arpg.
- **T-M10-013 / T-M11-009:** acceptance rows **[x]**; `pnpm check` green via
  critMult content fix + suite completeness.
- **Warnings:** lockfile tarball restore; hint lists genre-arpg.

No undercoverage against the stated job. M10 and M11 closed as claimed.

### Substance (Stage 4)

- Compile gate is real CLI wiring + fail-combine with core validate, not a stub.
- Four integration tests are structural (temp roots, status codes, path asserts),
  not hollow.
- Docs flip real status rows (breakdown, acceptance matrix, testing/CI narrative).
- Auditor concerns-proceed + W1 doc-attribution fixed on top is consistent with
  cold read; agreement cites own git/schema/combat evidence, not deferral.

**Chat token: PASS**

## 3. Execute

Handoff has no `execute_approved: true` and no CISO body approval for independent rebuild.
Per interim CISO Execute gate: **deferred (CISO gate)**.

Agreement with Lattice `evidence_ref` is not re-run as a full suite in this harness;
Chat relies on committed evidence artifact + cold code/test/doc/git reads above
(gate novelty vs parent, probe design, schema/runtime critMult basis, root filter,
lockfile form).

**Execute token: deferred (CISO gate)**

## 4. Vision

Not a frontend/UI change set (CLI gate + package test wiring + title content + docs).
No comp path. **n/a**.

**Vision token: n/a**

## 5. Verdict

**PASS**

Director closes on dual-PASS (Auditor + Grok). Certifier does not merge.
