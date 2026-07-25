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
  of the **handoff-pinned range**, not of tip of main. Gate commit tip of series
  also has `e04262c` (Auditor CONCERNS-proceed + W1 doc fix + this handoff drop);
  handoff `range` pins the feat commit only.
- Pre-gate: `validate_poll_handoff.py` + `validate_cert_handoff.py` → **PASS**.
- `evidence_ref` present and readable at
  `docs/evidence/2026-07-22-anvil-tail-tests.txt` (pnpm test / lint / check exit 0,
  CLI smoke, gate negative probe, gravewake validate after critMult).

## 2. Chat

### Scope (Stage 1)

`git diff --name-only c23bbea..6b53a3b` — 14 files, +890/−61:

| Path | Role |
|------|------|
| `anvil/packages/cli/src/index.ts` | `authoringCompileGate` on validate/test/dev (T-M10-011) |
| `anvil/packages/cli/src/cli.integration.test.ts` | 4 new T-M10-011 integration tests |
| `anvil/package.json` | root `pnpm test` adds `@anvil/authoring` + `@anvil/genre-arpg` |
| `anvil/packages/core/src/validate.ts` | MODULE_UNKNOWN hint lists `genre-arpg` |
| `anvil/pnpm-lock.yaml` | uWebSockets.js tarball restore (3 sites) |
| `games/gravewake/content/items/tyrant_edge.json` | `critMult` 0.35→1.35 |
| Specs / design (20, 14, 18, S-AUTHORING, S-ARPG, S-CLI, S-TEST) | acceptance / status flips |
| `docs/evidence/2026-07-22-anvil-tail-tests.txt` | executes-clean evidence |

Scope matches proposal (T-M10-011/012/013 + T-M11-008/009 + chunk-B audit warnings).
No unrelated product churn.

### Mechanical floor (Stage 2)

| Check | Result |
|-------|--------|
| `validate_poll_handoff.py` / cert-handoff schema | PASS |
| `evidence_ref` | Present, readable, documents full suite + gate probe |
| Consumer `scripts/nonbuild_check.py` | Absent — skip |
| Consumer `scripts/doc_drift_check.py` | Absent — skip |
| Consumer `scripts/reconcile_backlog.py` | Absent — skip |
| Tree porcelain before cert write | empty (byte-clean) |

**Independent cold checks (certifier):**

- **Gate is new:** parent `c23bbea` `cmdValidate`/`cmdTest`/`cmdDev` call
  `validateProject` / `runTests` only; `compileProject` used only on
  describe/capabilities paths. `6b53a3b` adds `authoringCompileGate` merging
  compile errors into validate and failing test/dev fast on compile errors.
  Schema-v1 / missing-manifest skip matches S-AUTHORING §2 boundary.
- **Positive probe logic is real:** integration test breaks `game.spec.yaml` only;
  core never reads intent, so without the gate validate would still pass.
- **Root filter:** `package.json` test script includes both `@anvil/authoring` and
  `@anvil/genre-arpg` (T-M10-012 / T-M11-008). Confirmed FILTER_OK on working tree
  that carries the same wiring via squash.
- **Acceptances:** breakdown rows T-M10-011/012/013 and T-M11-008/009 are **[x]**
  at range; T-M11-009 notes gravewake critMult disposition.
- **critMult basis:** schema `contentSchemas.ts` has `critMult: z.number().min(1)`;
  runtime uses `base * critMult` with `Math.max(1, …)` clamps
  (`stats.ts`, `itemization.ts`, Gravewake combat). `0.35` was bonus-fraction form
  and fails min(1); `1.35` is multiplier-form. Sibling items / defaults use ≥1.
- **Lockfile:** uWebSockets.js at pin `442087c0` is tarball form at all 3 sites;
  byte-matches `2172841` resolution shape (Auditor/prior W1 reverse of git+ssh rewrite).
- **Hint:** MODULE_UNKNOWN allowed list includes `genre-arpg`.

**Certifier-run porcelain (main WT equivalent wiring; CISO defers full rebuild):**

```text
pnpm --filter @anvil/cli test
  Test Files  1 passed (1)
  Tests  13 passed (13)
  incl. T-M10-011 validate compile gate / test refuse / dev fail-fast / v1 skip

pnpm --filter @anvil/authoring --filter @anvil/genre-arpg test
  authoring 9/9; genre-arpg 4/4

node packages/cli/dist/index.js validate examples/hello-card --json → {"ok": true}
```

**Evidence summary (Lattice, 2026-07-21 on branch):**

- Root `pnpm test` / `lint` / `check` all exit 0.
- CLI smoke validate/test green; bounded `dev` serves (timeout 124 = still up).
- Broken-intent validate exit 1 with `INTENT_INVALID` on `game.spec.yaml`.
- Gravewake validate exit 0 after critMult fix.

### Proposal vs job (Stage 3)

Job: close M10+M11 tail — compile gate on generic paths, root-suite wiring,
milestone acceptances, gravewake critMult disposition, lockfile+hint fixes.

Delivered:

- **T-M10-011:** real CLI compile gate + 4 integration tests (positive + negatives + v1 skip).
- **T-M10-012 / T-M11-008:** root test filter includes authoring + genre-arpg.
- **T-M10-013 / T-M11-009:** docs/acceptance flips; `pnpm check` green in evidence
  after critMult fix.
- **Chunk-B warnings:** lockfile tarball restore + MODULE_UNKNOWN hint.

No undercoverage against the stated job.

### Substance (Stage 4)

- Compile gate is production wiring in `index.ts`, not a stub or docs-only claim.
- Tests encode the found-state probe (intent-only break) — gate necessity is demonstrated.
- Docs are real status/count updates across breakdown + specs.
- Auditor CONCERNS-proceed (W1 doc-18 attribution fixed on `e04262c`) is independently
  consistent with this cold read; agreement cites own git + vitest porcelain, not
  deferral to Auditor.

**Chat token: PASS**

## 3. Execute

Handoff has no `execute_approved: true` and no CISO body approval for independent rebuild.
Per interim CISO Execute gate: **deferred (CISO gate)**.

Targeted Chat-floor re-runs above (CLI 13/13 including all four T-M10-011 cases,
authoring 9, genre-arpg 4, hello-card validate) agree with Lattice `evidence_ref`
on the gate and suite wiring. Full monorepo `pnpm check` not re-executed in this harness.

**Execute token: deferred (CISO gate)**

## 4. Vision

Not a frontend/UI change set (CLI gate + package filter + content scalar + docs).
No comp path. **n/a**.

**Vision token: n/a**

## 5. Verdict

**PASS**

Director closes on dual-PASS (Auditor + Grok). Certifier does not merge.
