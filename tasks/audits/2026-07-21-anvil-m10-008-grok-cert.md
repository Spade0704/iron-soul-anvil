---
date: 2026-07-26
slug: 2026-07-21-anvil-m10-008
target_repo: D:/Projects/IronSoul-Anvil/iron-soul-anvil
range: 21728414b35ca4ede288388045ccf772b9ce5551
certifier: Grok (xAI) — EMCC External Certifier
verdict: PASS
chat: PASS
execute: deferred (CISO gate)
vision: n/a
---

# Grok cert — 2026-07-21-anvil-m10-008 (Anvil T-M10-008 CLI migrate/describe/capabilities)

## 1. Disclosure

- **Cold read.** Certifier did not author the range. Producer `lattice` / builder
  `lattice:iron-soul-anvil/cli-builder-01`; commit author Claude (Anthropic).
- Handoff selected by `poll_select.py` (oldest local pending `certifier_id: grok`).
- Range is single commit `2172841` on
  `origin/claude/herald-marketing-publish-ru4szs` (not first-parent of current
  `main`; CLI surface later landed on `main` via squash `8254a1b` M10+M11).
  Certification is of the **handoff-pinned range**, not of tip of main.
- Pre-gate: `validate_poll_handoff.py` → **PASS**.

## 2. Chat

### Scope (Stage 1)

`git diff --stat 2172841^..2172841` — 9 files, +484/−18:

| Path | Role |
|------|------|
| `anvil/packages/cli/src/index.ts` | Wire `migrate` / `describe` / `capabilities` |
| `anvil/packages/cli/src/cli.integration.test.ts` | 6 new integration tests + helpers |
| `anvil/packages/cli/package.json` | `@anvil/authoring` workspace dep |
| `anvil/pnpm-lock.yaml` | Additive +47 (cli→authoring + importer sections) |
| `anvil/docs/design/specs/S-CLI.md` | Command table + verification note |
| `anvil/docs/design/specs/S-AUTHORING.md` | Status table |
| `anvil/docs/design/20_FULL_TASK_BREAKDOWN.md` | T-M10-008 → **[x]** |
| `anvil/docs/design/18_TESTING_AND_CI.md` | Count note |
| `docs/evidence/2026-07-21-t-m10-008-tests.txt` | Executes-clean evidence |

No scope breach: CLI package + design docs + evidence only. No unrelated app/UI paths.

### Mechanical floor (Stage 2)

| Check | Result |
|-------|--------|
| `validate_poll_handoff.py` / cert-handoff schema | PASS |
| `evidence_ref` (`docs/evidence/2026-07-21-t-m10-008-tests.txt`) | Present, readable, documents post-change suite |
| Consumer `scripts/nonbuild_check.py` | Absent — skip |
| Consumer `scripts/doc_drift_check.py` | Absent — skip |
| Consumer `scripts/reconcile_backlog.py` | Absent — skip |
| Consumer `scripts/eval_runner.py` | Absent — skip |
| Tree porcelain before cert write | empty (byte-clean) |

**Evidence summary (Lattice run, 2026-07-21):**

- Baseline (pre): CLI 3 failed deliberate integration markers.
- Post: packages schema/core/genres green; CLI **2 failed | 7 passed (9)** — migrate surface flipped green; remaining failures are deliberate T-M10-009 schema-v2 scaffold + T-M11-007 ARPG scaffold (out of range).
- Six new T-M10-008 tests all pass (no-op, IO_ERROR, describe hash/determinism, MIGRATION_REQUIRED, capabilities descriptors, human preview non-write).
- Smoke: `migrate` preview / `--write`, `describe --json`, `capabilities --json` on hello-card fixture.
- Lint exit 0.

**Lockfile:** `anvil/pnpm-lock.yaml` +47 / −0 only (additive workspace links). No proxy-rewrite / git+ssh regression in this delta.

### Proposal vs job (Stage 3)

Job: wire CLI `migrate`, `describe`, `capabilities` with JSON over T-M10-005/006 library (S-CLI + T-M10-008).

Delivered:

- `cmdMigrate` → `migrateProject(root, { write })`; preview default (`written: false`); `--write` applies; `--json` or human text.
- `cmdDescribe` → `compileProject`; JSON payload with manifest, intent, sourceHash, counts, capabilities, content, warnings; human short form without `--json`.
- `cmdCapabilities` → compiled IR capability descriptors; JSON or human list.
- Help text + switch cases registered.
- Integration coverage for happy path, no-op, missing game.yaml, v1 describe rejection (`MIGRATION_REQUIRED`), capabilities shape, non-mutating human preview.
- Spec/task docs updated; T-M10-008 marked complete.

No undercoverage against the stated job. Out-of-scope scaffolds correctly left failing.

### Substance (Stage 4)

- Thin wrappers only: imports `compileProject` / `migrateProject` from `@anvil/authoring`; no parallel migration/compiler logic in the CLI.
- Tests assert JSON shape, error codes, determinism (repeated `sourceHash`), and filesystem non-mutation on preview — not bare exit-0.
- Docs are real status updates (not stubs).
- Auditor PASS (info ×3 cosmetic/placement) independently consistent with this cold read; agreement is from own evidence, not deferral to auditor.

**Chat token: PASS**

## 3. Execute

Handoff has no `execute_approved: true` and no CISO body approval for independent rebuild.
Per interim CISO Execute gate: **deferred (CISO gate)**.

Agreement with Lattice `evidence_ref` is therefore not re-run in this harness; Chat relies on committed evidence artifact + cold code/test/doc read.

**Execute token: deferred (CISO gate)**

## 4. Vision

Not a frontend/UI change set (CLI + docs). No comp path. **n/a**.

**Vision token: n/a**

## 5. Verdict

**PASS**

Director closes on dual-PASS (Auditor + Grok). Certifier does not merge.
