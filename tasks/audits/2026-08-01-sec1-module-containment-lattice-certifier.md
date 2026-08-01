# CERT VERDICT - SEC-1 module-containment Layer 2 (Anvil PR #14)

- **Verdict:** CERT_PASS (blocking=0; carries C1-C4 non-blocking, C1 is a governance flag)
- **Loop:** LOOP-DEFINITION-wave-b-sec1-certifier (WAVE-B, SEC-1 only)
- **Seat checklist:** EMCC `tasks/checklists/wave-b-sec1-certifier.md`
- **Certifier:** claude:EMCC-ExternalCertifier (certifier_id: claude, certifier_model: claude)
- **Builder (declared):** grok:anvil-dfdu (builder_llm/builder_model: grok) - CF3 decorrelation holds
- **Auditor:** grok:EMCC-Auditor, AUDITOR_PASS
- **Handoff:** `0-Inbox/grok-audit/2026-08-01-sec1-module-containment.md`, attempt 1
- **Certified range:** 8a3b7dc..8d292be (product `86d198f`; tip pushed)
- **Date:** 2026-08-01

## Arm

- Read certifier loop FLOOR CF1-CF10. One atom this tick (CF1).
- **CF3 vendor decorrelation:** declared builder is grok, certifier is claude. Holds. See C1 for a
  provenance caveat that does not change the vendor conclusion.
- **Zero involvement:** I did not build, audit, or advise SEC-1. First contact with the product
  diff was this cert. On earlier ticks I reported SEC-1 as CERT_BLOCKED (no handoff on any plane,
  Anvil not on disk) without opening product.

## Pre-gate

```
cd <anvil> && python <EMCC>/scripts/validate_cert_handoff.py 0-Inbox/grok-audit/2026-08-01-sec1-module-containment.md
PASS
exit 0
```

`status: pending` + `auditor_verdict: PASS` + `auditor_id` + `auditor_ref` all present. Evidence
and auditor artifacts are git-visible inside the certified range. Tip `8d292be` **is pushed**
(`origin/claude/sec1-module-containment` = `8d292be`) - the first atom in this session where the
auditor evidence is visible on the PR at cert time.

## Product pins (identical at product `86d198f` and tip `8d292be`)

| Path | sha256 |
|---|---|
| anvil/packages/cli/src/loadModules.ts | 38f8e4e976adae12... |
| anvil/packages/cli/src/loadModules.containment.test.ts | 1992fb3c9b391a5d... |
| games/iron-soul/docs/MODULE_TRUST_POSTURE.md | 2e837ad87b60df60... |

Changed paths in range: exactly the three declared product files plus handoff/audit/evidence docs
and the orchestrator log. Scope bounds respected - no Aegis product, no game content, no CRW.

## Floors RUN by certifier (isolated detached worktree; live tree never mutated)

| Floor | Command | Result | Exit |
|---|---|---|---|
| Declared | `cd anvil/packages/cli && pnpm test` | **62 passed \| 2 todo** (7 files) | 0 |
| Declared | `cd anvil/packages/cli && pnpm run build` | tsc clean | 0 |

Reproduces the builder/Auditor claim ("62 passed | 2 todo; tsc OK") exactly.

**Instrument correction, recorded.** My first floor run in the fresh worktree gave
`13 failed` and `BUILD_EXIT=2` with `TS2307: Cannot find module '@anvil/genre-fps2'`. That was my
harness, not the product: a detached worktree has no built sibling workspace packages, and the
failing CLI tests spawn `dist/index.js`, which the failed build had not produced. I did **not**
report it. Ran `pnpm install` from the real workspace root (`anvil/`, not the repo root) then
`pnpm -r build`, after which both floors are green as above. A negative from an unverified
instrument is not a finding.

## Success criteria re-verified (driven directly against the built guard)

Probe harness imports `resolveContainedModule` from the compiled `dist/` and exercises it against
a real temp root with a real out-of-root directory.

| # | Criterion | Probes | Result |
|---|---|---|---|
| 1 | `../` / absolute / drive ids refuse with `ModuleContainmentError` | `../evil.js`; `../../evil.js`; `./mods/../../evil.js`; `/etc/passwd`; `C:\Windows\x.js`; `\\server\share\x.js`; NUL byte; empty id | all throw `ModuleContainmentError` - 8/8 |
| 2 | realpath + relative-under-root, **not string prefix** | junction from `<root>/link` to an outside dir, then `./link/evil.js` | throws `ModuleContainmentError` |
| 3 | in-root `./` still loads | `./mods/ok.js` (exists); `./mods/notyet.js` (absent, geometry-only path) | both resolve under root, no throw |
| 4 | falsifier: disable guard -> escape greens again | see below | confirmed |
| 5 | MODULE_TRUST_POSTURE Layer 2 accurate | doc diff read | accurate, see C2 |
| 6 | dual-PASS + human merge | AUDITOR_PASS in; this CERT_PASS is the cross-model leg; Director closes; human merges #14 | my leg done |

Criterion 2 is the one worth calling out: the junction probe is what separates a real `realpath`
containment check from a string-prefix check that a symlink walks straight through. It throws.
The atom's own test file also covers symlink cases (3 references), so this property is locked by
the suite and not only by my probe.

## Falsifier (world mutation, isolated worktree, restored)

Replaced the entire `resolveContainedModule` body with the naive pre-atom resolve
(`return path.resolve(root, id)`), rebuilt, re-ran. Mutated line printed back before the run.

```
pnpm test
Test Files  1 failed | 6 passed (7)
     Tests  4 failed | 58 passed | 2 todo (64)     exit 1
FAIL src/loadModules.containment.test.ts > rejects ../ escape with ModuleContainmentError
FAIL src/loadModules.containment.test.ts > rejects absolute and drive-like ids
```

Only the containment file fails - the tests are targeted, not blast-radius.

**PREM-1 (reproduce-first) confirmed on the same mutated build:** re-running my probe under the
naive resolve, every escape that should be refused returns cleanly -

```
*** MISMATCH *** | ../ escape                  throw=none
*** MISMATCH *** | nested ../../               throw=none
*** MISMATCH *** | ./mods/../../ traversal     throw=none
*** MISMATCH *** | absolute posix              throw=none
*** MISMATCH *** | drive absolute              throw=none
```

So the RED security property is real and this atom is what closes it - demonstrated, not read off
the evidence file.

Guard restored, probe file deleted, worktree removed and `git worktree prune` run. Anvil live tree
verified clean at `8d292be` with no modified tracked files.

## Carries (non-blocking)

**C1 - product provenance vs declared builder seat (governance flag, not a vendor problem).**
EMCC `tasks/sessions.md` records: *"SEC-1 product was built in Director session after CISO+DF;
correct pattern is separate Lattice seat under P-AUTH (Operator also sent to Lattice for
ownership)."* The handoff declares `builder_id: grok:anvil-dfdu`. Both are grok-vendor, so **CF3
decorrelation is unaffected and my cross-model leg is valid**. What is worth the Director's
attention is the role-separation question: Director-authored product code sitting behind a
handoff that names a Lattice seat. I could not settle authorship from git - every commit in this
portfolio carries the Operator's identity as author and committer, and the branch prefix is not
evidence either (A2-MOD-8 was a grok-built atom on a `claude/` branch). So I am flagging the
discrepancy between the session note and the declared seat, not asserting which is true.

**C2 - crit5 asks for a `file:line` pointer; the doc gives file + symbol names.** MODULE_TRUST_
POSTURE now names `ModuleContainmentError`, `resolveContainedModule(root, id)`, the wiring point,
and the test file. No line numbers. I consider symbols *better* than line numbers here - lines
drift on every edit, symbol names do not - but recording the deviation since the criterion was
written as file:line. No action needed unless the Director wants the literal form.

**C3 - unknown module ids are silently dropped.** In `loadModulesForGame`, an id that is neither
`./`/`../`-prefixed nor one of the seven known `genre-*` names falls through every branch and is
ignored with no error. This is **not** a containment hole - such an id never reaches `import()`,
which I verified by reading the full function - and it predates this atom. But a mistyped module
id fails silently rather than loudly, which is the same species as the silent-skip findings from
Wave A. Out of SEC-1 scope; worth an assurance slot.

**C4 - `cert_class` correctly still `parked-awaiting-cross-model`** with a caveat naming the CISO
unlock and DF PROCEED-WITH-CHANGES. On close it moves to `cross-model-certified` with
`status: done` + this verdict - the shape W2-MOD-6 now requires and which I verified passes.

## Disposition

- **CP1** CERT_PASS, blocking=0, carries above are non-blocking.
- **CP2** Did not merge. Did not Director dual-PASS close. Signalling Director.
- **CP3** Handoff cert fields left to seat protocol / Director pack.

## Explicit refuses

- Did not build product, act as Regime-B Auditor, merge, or dual-PASS close (CF5/CF6).
- Did not report my first floor run as a product failure - diagnosed it as a missing workspace
  build in my own worktree and fixed the harness.
- Did not report my first probe run either: a heredoc mangled the backslash escapes and the script
  failed to parse. Rewrote it so the escapes landed literally.
- Did not claim the guard is realpath-based on the strength of the code reading alone - built a
  junction and walked it.
- Did not resolve C1 by guessing: git authorship cannot discriminate vendor in this portfolio and
  the branch prefix has been misleading before, so I flagged rather than concluded.
- Did not leave the worktree behind when `git worktree remove` failed on `node_modules` - forced
  the delete and pruned.
