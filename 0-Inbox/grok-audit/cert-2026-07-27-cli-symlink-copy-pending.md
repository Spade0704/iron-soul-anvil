---
schema: cert-handoff/v1.1
certifier_id: claude
certifier_seat: d6id8o0h
certifier_model: claude
producer_id: lattice
builder_id: grok:anvil-dfdu
builder_llm: grok
builder_model: grok
spec_author_seat: director:EMCC
spec_author_llm: claude
director_id: director:EMCC
directive_ref: dir-20260727-anvil-cli-symlink-copy
slug: 2026-07-27-cli-symlink-copy
attempt: 1
status: done
verdict: PASS
verdict_ref: tasks/audits/2026-07-27-cli-symlink-copy-claude-cert.md
phase: build
created_at: 2026-07-27T17:57:29Z
updated_at: 2026-07-27T17:57:29Z
target_repo: D:/Projects/IronSoul-Anvil/iron-soul-anvil
repo: iron-soul-anvil
range: 17fee8f4b73f10636176df49e9d4a46bbaf5a850..b4b7dfb24eb424559050f850e572a60ad01117b4
pr: https://github.com/Spade0704/iron-soul-anvil/pull/8
pr_branch: cli/symlink-copy
proposal: CLI symlink copy - copyDir branches on stat (the TARGET) instead of Dirent (the ENTRY), so a symlink-to-directory is copied recursively instead of throwing EISDIR. Dereferences per Director ruling.
cert_class: cross-model-certified
decorrelation: cross
risk_class: low
auditor_verdict: PASS
auditor_ref: tasks/audits/2026-07-27-cli-symlink-copy-auditor.md
evidence_ref: CI run 30287135520 (head_sha b4b7dfb24eb424559050f850e572a60ad01117b4, branch cli/symlink-copy) - steps 10/11/12/13 ALL SUCCESS, read from job 90047618548 log lines 504-533 verbatim rather than the conclusion field. Auditor independently rebuilt hello-empty with the CI command in its own worktree and reproduced both cost figures exactly; independently reproduced the Rule 9 mutation (proved applied via git diff AND printing the on-disk block, got RED at copyDir.ts:29, restored to 4/4 green).
file_manifest_ref: tasks/CLI-1-FILE-MANIFEST.md (pre-committed as its own commit, ancestor of the range head, absent from the range)
---

# Cert-handoff (attempt 1, status: pending) - CLI symlink copy

**For the cross-model certifier (Claude Certifier seat `d6id8o0h`).**
Coordination-plane drop on `iron-soul-anvil` **main**. CODE lives on branch `cli/symlink-copy` / **PR #8**
(human-at-merge). Nothing is merged by the builder.

## Identity / decorrelation

| Role | Identity |
|------|----------|
| Builder | `grok:anvil-dfdu` (builder_llm/model **grok**) |
| Auditor | fresh-context Claude, Regime B, Director-spawned, **not the builder** - PASS, 0 blocking |
| Certifier | **claude** / seat `d6id8o0h` - never Grok on this repo (same-vendor launder; R-4's vendor-normalised compare would FAIL it) |
| Spec author | `director:EMCC` / claude |

`builder_id != certifier_id` and `builder_model (grok) != certifier_model (claude)`.

**Drop authored by the Director, not the builder.** The Grok builder seat has no reliable bus. This
file is coordination-plane, sits on `main`, and is **outside the certified range** - verified: it
appears in neither the range diff nor `tasks/orchestrator-log.jsonl`'s. It therefore contributes
nothing to the certified diff and cannot make `builder_llm` false for any part of it. Same reasoning
the certifier independently checked and endorsed on the MOD-8 re-pin.

## Range

Base computed by **merge-base EQUALITY**, not ancestry, per `rul-20260727-range-base-pin-moves-to-the-handoff`:
`git merge-base origin/main b4b7dfb` = `17fee8f`. Ancestry is uninformative in **both**
directions here and neither test substitutes for computing it.
**Zero coordination rows inside the range** - `git diff BASE..TIP -- tasks/orchestrator-log.jsonl` is empty.

## What to certify

`copyDir` previously branched on `Dirent.isDirectory()`. For a symlink-to-directory Dirent reports
isDirectory FALSE while `statSync().isDirectory()` reports TRUE, so it took the `copyFileSync` branch
on a directory and threw EISDIR. The fix branches on the **target** and copies recursively.

**Dereference was ruled, then re-ruled against a measured cost** - see
`rul-20260727-cli1-rerule-scope-not-semantics` and `rul-20260727-cli1-auditor-pass-and-unit-correction`.

## THE RESULT THAT MATTERS: F4 IS RETIRED ON LINUX

Steps 12 and 13 executed for the **first time in the repo's history**. Prior to this atom the anvil
fork had **zero CI runs ever**; after Actions were enabled, all 6 earlier runs had step 10 FAIL and
step 13 SKIPPED. Both runs on `b4b7dfb` show s10 and s13 success.

```
validate ../games/gravewake -> { "ok": true }
test     ../games/gravewake -> { "ok": true, enter_wastes/melee_and_xp/start_town all pass }
```

**F4 is a Windows-only defect. Nothing here exercised a Windows path. The retirement must NOT be read
as global.**

## Named residuals - NOT certified as covered

**N1 - `copyDir` has NO CYCLE GUARD.** Auditor built a realpath-proven cycle and the **real compiled
module** recursed past **31 levels**, creating 29 nested directories, with `mkdirSync` patched to
abort. No visited-set, no realpath check, no depth cap. *Not reachable in-tree* (3 tracked symlinks,
all pointing at a symlink-free tree) but `index.ts:728` copies from a **user-supplied game root**.
**This converts a bounded loud failure into an unbounded one that writes a deep garbage tree first - a
regression in failure quality introduced by dereferencing.** Non-blocking on reachability;
**BLOCKING entry condition on the manifest-driven-copy atom.**

**N2 - `sfx/blip.ogg` DOES NOT EXIST.** `hello-empty` declares exactly `required: - sfx/blip.ogg` and
the linked tree does not contain it - absent under both resolution readings. **So it drags in 424
files / 86.6 MB to obtain ZERO of the one file it declares.** The correct copy set is currently EMPTY.

**N3 - unit correction:** the delta is 86.6 MB **decimal** = **82.61 MiB**. The builder's report and
the first re-ruling both said "86.6 MiB". ~5% off; conclusion unaffected.

**N4 - dereference absorbs OUT-OF-TREE target contents** into the dist from a user-supplied root.
Deliberate per the ruling, named so it is not discovered later.

**Symlink-to-file test does NOT discriminate the defect** - it passes under the mutant too, because
`Dirent.isDirectory()` is false for symlink-to-file as well. **Coverage, not regression protection.**

## Scope note - read before diffing branch against main

CLI-1's **own** diff (`d6bdb1a..b4b7dfb`) is exactly the 4 declared fence files: `copyDir.ts`,
`copyDir.test.ts`, `index.ts` (import only), `CLI-1-FILE-MANIFEST.md`.
The other 4 files in a branch-vs-main diff (`ci.yml`, the hello-empty symlink retarget,
`.ci-trigger-proof`, `CI-1-FILE-MANIFEST.md`) are **CI-1 substrate carried by merge**, required for
step 10 to be reachable. **PR #8 supersedes PR #7**; CI-1 closes on its own proven legs A/B/C and does
NOT get a separate cert it can no longer have a distinct range for. Not a fence violation.

## Unverified by the Auditor, stated not omitted

`fs.cpSync` dereference on **Linux** (its Windows rejection reason WAS verified correct) - Windows
behaviour of 12/13 - full 15-package suite locally (only `packages/cli` run: 6 files, 56 passed, 2
todo, matching CI) - whether the engine resolves `required:` relative to `assets/` or `assets/audio/`
(absent under both) - that the two gravewake symlinks resolve - CI-1 substrate on its own merits.

## Closing

Director closes on DUAL PASS only. Write your verdict to `tasks/audits/` **without a `cert_class`
front-matter key** - the corpus gate globs that directory and a `cert_class` member there reds a
currently-green gate.
