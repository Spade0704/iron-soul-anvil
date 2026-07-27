---
date: 2026-07-27
slug: cli-symlink-copy
range: 17fee8f4b73f10636176df49e9d4a46bbaf5a850..b4b7dfb24eb424559050f850e572a60ad01117b4
auditor: fresh-context Claude (Regime B, Director-spawned, not the builder)
verdict: PASS
blocking_findings: 0
non_blocking_findings: 4
---

# AUDITOR VERDICT (Regime B, fresh-context Claude) - CLI-1 symlink copy, PR #8

verdict: **PASS**, 0 blocking, 4 non-blocking. Range base is the COMPUTED merge-base.

## F4 IS RETIRED ON LINUX - and this says NOTHING about Windows

Run `30287135520`, head_sha `b4b7dfb` (the exact tip), job `build-test` 90047618548, log lines
504-533, read verbatim rather than from the conclusion field:

```
node packages/cli/dist/index.js validate ../games/gravewake
node packages/cli/dist/index.js test ../games/gravewake
{ "ok": true }
{ "ok": true, "results": [ {"id":"enter_wastes","pass":true,"ticks":280},
                           {"id":"melee_and_xp","pass":true,"ticks":1000},
                           {"id":"start_town","pass":true,"ticks":0} ] }
```

No doubled drive letter, no `file://` conversion error, runner paths `/home/runner/...`.

**"Never ran before" was verified across the fork's ENTIRE history, not a sample** - only 8 runs exist;
in all 6 prior runs step 10 FAILED and step 13 was SKIPPED. Both runs on `b4b7dfb` show s10 and s13
success.

**F4 is a Windows-only defect. Nothing in this atom exercised a Windows path. The retirement must not
be read as global.**

## The cost - independently derived, and it STRENGTHENS the re-ruling

Built `hello-empty` with the CI command in an own worktree:

| | |
|---|---|
| `anvil/assets/audio` | 86,627,757 B / 424 files (music 64,086,739/25; sfx 22,427,719/396) |
| `hello-empty` dist | 86,844,501 B / 432 files |
| ratio vs 216,095 | **401.9x** |
| symlinks left in dist | **ZERO** - fully dereferenced |

Both headline figures match the builder EXACTLY, derived independently.

**THE FINDING: `sfx/blip.ogg` DOES NOT EXIST.** `manifest.yaml` declares exactly
`required: - sfx/blip.ogg` and `content/audio.json` names one cue - and
`anvil/assets/audio/sfx/` contains `combat/ foley/ inventory/ metal/ misc/ ui/ wood/ world/` and no
`blip.ogg`. Absent under BOTH resolution readings.

So hello-empty drags in 424 files / 86.6 MB and obtains **ZERO** of the one file it declares. It needs
**FEWER** than the Director assumed, not more. **The correct copy set for hello-empty is currently
EMPTY.** The manifest comment *"blip may be missing - greybox / missing list"* shows this is an
intentional greybox condition, not a break.

## Non-blocking findings

**N1 - `copyDir` has NO CYCLE GUARD. Unbounded recursion, PROVEN.** Built `src/loop -> src`, proved a
genuine cycle (`realpathSync(link) === realpathSync(src)`), ran the REAL compiled `dist/copyDir.js`
with `fs.mkdirSync` patched to abort at 30 levels: **still recursing at 31 levels, having physically
created 29 nested directories.** No visited-set, no realpath check, no depth cap.
*Reachability: NOT reachable in-tree* - exactly 3 tracked symlinks, all pointing at a symlink-free
tree. *Exposure:* `index.ts:728` copies from a **user-supplied game root**.
**Character: this change converts a bounded loud failure (EISDIR/EPERM, immediate) into an unbounded
one that writes a deep garbage tree first. A real regression in failure quality, introduced by
dereferencing.**

**N2 -** `anvil/assets/audio/sfx/blip.ogg` absent (above). Feeds the follow-on atom's scope.

**N3 - UNIT ERROR:** the delta is 86.6 **MB decimal** = **82.61 MiB**. The builder's report and
`rul-20260727-cli1-rerule-scope-not-semantics` both say "86.6 MiB". Off ~5%; magnitude and conclusion
unaffected.

**N4 -** dereference now absorbs **out-of-tree** target contents into the dist from a user-supplied
root. The flip side of self-contained: the artifact takes on whatever the link points at.

## Legs verified

**Rule 9** - reproduced independently: mutated `st.isDirectory()` -> `ent.isDirectory()`, proved
applied by `git diff` AND printing the on-disk block, got RED
(`EPERM ... copyfile '...assets\audio'`), restored to 4/4 green. Only 1 of 4 tests reds under the
mutant.
**Rule 9b** - REAL fixture: `fs.symlinkSync(real, ..., "dir")` with in-test `lstat().isSymbolicLink()`
and `stat().isDirectory()` assertions. No mocked Dirent anywhere. Skip visibility falsified by forcing
`SYMLINKS_OK=false`. **And they were NOT skipped on CI** - log line 429 shows `copyDir.test.ts (4
tests)` with no skip annotation, versus a sibling line reading `(34 tests | 2 skipped)`, which proves
the annotation would have appeared.
**Symlink-to-file** - handled, but the test **does not discriminate the defect**: it passes under the
mutant too, because `Dirent.isDirectory()` is false for symlink-to-file as well. Coverage, not
regression protection.
**Dangling symlink** - CLEAR ERROR, not silent: throws `ENOENT` at the `statSync`. Minor: raw ENOENT
with no hint the cause is a dangling link.
**Range integrity** - `merge-base = 17fee8f4...`, equality basis. Ancestry confirmed uninformative in
both directions exactly as warned. `git diff MB..tip -- tasks/orchestrator-log.jsonl` is **EMPTY**;
24 lines at merge-base, 24 at tip. **Zero coordination rows inside the certified range.**
**Scope** - CLI-1's own diff is exactly the 4 declared fence files; the other 4 are CI-1 substrate
carried by merge.

## UNVERIFIED (stated, not omitted)

`fs.cpSync` dereference behaviour **on Linux** (the builder's Windows rejection reason was verified
correct) - Windows behaviour of steps 12/13 - full 15-package suite locally (only `packages/cli` run:
6 files, 56 passed, 2 todo, matching CI) - whether the engine resolves `required:` relative to
`assets/` or `assets/audio/` (the file is absent under both, so the finding holds either way) - that
the two gravewake symlinks actually resolve - CI-1's substrate on its own merits.

## Auditor instrument errors, self-caught

Wrote a first probe into `/tmp`, which maps to a Windows temp path, so a relative import resolved
outside the package and threw `ERR_MODULE_NOT_FOUND`. Re-pointed at an absolute `file://` URL to the
REAL compiled module and printed a load confirmation before use - **every leg-A probe ran against the
real compiled `copyDir`, never a reimplementation**, which matters because reimplementing it would
have been the exact Rule 9b trap. A second probe crashed on cp1252 encoding a vitest checkmark;
re-run ASCII-safe, no conclusion depended on it.
