---
date: 2026-07-27
slug: 2026-07-27-cli-symlink-copy
target_repo: Spade0704/iron-soul-anvil
pr: 8
branch: cli/symlink-copy
range: 17fee8f4b73f10636176df49e9d4a46bbaf5a850..b4b7dfb24eb424559050f850e572a60ad01117b4
certifier_id: claude
certifier_seat: d6id8o0h
certifier_model: claude-opus-5
builder_id: grok:anvil-dfdu
builder_model: grok
directive_ref: dir-20260727-anvil-cli-symlink-copy
auditor_ref: tasks/audits/2026-07-27-cli-symlink-copy-auditor.md
verdict: PASS
risk_class: low
---

# Claude External Certifier verdict -- CLI-1, copyDir symlink dereference

**VERDICT: PASS.** Zero blocking defects. Four residuals carried and NAMED. N1's disposition is upheld
with tightened reasoning, and a concrete cheap fix proposed for the atom-2 entry condition.

## Range and scope

    declared base   17fee8f4b73f10636176df49e9d4a46bbaf5a850
    merge-base      17fee8f4b73f10636176df49e9d4a46bbaf5a850     EQUAL -- the only sound check
    coordination rows inside the range                            0

Merge-base **equality** verified, not ancestry. The directive deliberately pinned no literal base and
the builder computed it at handoff time -- the standing relocation working as intended on its first
atom. Eight files in the range: four are CLI-1's fence, four are CI-1 substrate carried by the merge,
exactly as declared.

## The fix

`copyDir` branches on `fs.statSync(s)` -- the TARGET -- instead of `Dirent.isDirectory()`, which
describes the ENTRY. A symlink-to-directory is now recursed into and written as real files rather than
throwing. Dereference is per Director ruling ("a build artifact must be self-contained").

**Regression protection verified by mutation.** I reverted the fix in place (`statSync(TARGET)` ->
`Dirent(ENTRY)`), confirmed the mutant applied by re-grepping the source, and ran the suite:

    1 test failed:  "copies through a real symlink-to-directory (not EISDIR)"
    restored, blob 7b6c1a0127e73e78ed40b4672a8a784b500fbb52, 56 passed clean

The fix IS protected -- by exactly one test.

## The vacuity finding -- confirmed, and it cuts further than reported

The Director flagged that the symlink-to-FILE test does not discriminate the defect, because
`Dirent.isDirectory()` is false for symlink-to-file under both the fixed and broken code. **Confirmed:**
under the mutant it passes. Coverage, not regression protection.

Two things to add:

1. **The symlink-to-DIRECTORY test DOES discriminate** and is the sole test that reds under mutation. So
   the atom is not unprotected -- the protection is narrower than the file count suggests. Four tests
   exist; one carries the guarantee.
2. **That one discriminating test is `it.skipIf(!SYMLINKS_OK)` gated**, where `SYMLINKS_OK =
   canMakeSymlink()`. On any host that cannot create symlinks -- Windows without developer mode or
   elevation -- the ONLY test protecting this fix **skips silently**, and the suite reports green. The
   regression protection is environment-conditional, and nothing in a green run says which environment
   produced it. That is precisely the MOD-8 silent-skip class, in a repo whose CI had never executed at
   all until today. It runs on `ubuntu-latest` where symlinks work, so the protection is real *in CI* --
   but it was dark everywhere until CI started running, and it is still dark on a locked-down dev host.

Not blocking: the test is correct, the skip is honest and visible in a `-v` run. Worth naming because a
`skipIf`-gated sole-discriminator is the weakest possible position for a regression guard.

## F4 retirement on Linux -- VERIFIED INDEPENDENTLY

    successful run on the tip b4b7dfb (id 30287170845), job build-test:
      10. Build hello-empty static        -> success
      11. Build data package (hello-card) -> success
      12. Build Gravewake game module     -> success
      13. Validate + test Gravewake       -> success

    a prior failing run (id 30286033207), same job:
      10. Build hello-empty static        -> FAILURE
      11 / 12 / 13                        -> skipped

The claim reproduces exactly: steps 12 and 13 executed for the first time, and the prior pattern was
step 10 failing with everything after it skipped. **Correctly bounded** -- this retires F4 on Linux
only. Windows is untouched and this verdict does not certify it there. That residual rode three atoms
because nothing in the repo could observe it; the observation now exists.

## My OWN ARENA-1 residuals R1 and R1b are DISCHARGED by this atom's substrate

I recorded in the ARENA-1 verdict that `iron-soul-anvil`'s CI leg was *structurally unavailable* -- a
fork with `total_count=0` workflow runs since creation -- and separately (R1b) that the `anvil/**` path
filter did not cover the `games/**` workspace members, so enabling Actions alone would not close the gap.

Both are now closed, and I verified each rather than assuming:

- **R1:** `total_count` is now **8**. Actions are enabled and the workflow executes.
- **R1b:** the range adds `games/**` to both the `push` and `pull_request` path filters, plus
  `workflow_dispatch`.
- **And the fix is PROVEN, not merely present.** Commit `9dab9d3` touches exactly one file, zero of them
  outside `games/`, and it triggered a CI run. A games-only commit firing the workflow is the
  discriminating proof; `.ci-trigger-proof` is a genuine positive control rather than a decorative one.
  (That run failed at step 10 -- it predates the F4 fix -- which is irrelevant to what it proves: it
  TRIGGERED.)

Recording this because my ARENA-1 verdict says those residuals are open, and a later reader comparing
the two documents should see the discharge rather than infer a contradiction.

## N1 -- copyDir has NO cycle guard. REPRODUCED, and the disposition is UPHELD

I built a realpath-proven cycle (`src/sub/loop -> src`) and ran the REAL compiled module with
`mkdirSync` patched to abort:

    cycle proven by realpath : true
    outcome                  : STILL RECURSING -- aborted by probe after 31 mkdir calls
    dirs created             : 30 (garbage written BEFORE any failure)
    deepest nesting          : 29 levels under dest
    PRE-FIX code, same input : threw EPERM immediately (bounded)

My numbers match the Auditor's exactly. One platform note: pre-fix throws `EPERM` on Windows where the
report says `EISDIR` (Linux). Same class -- bounded, immediate, loud -- conclusion unaffected.

**The Director's characterisation is correct and is the important part:** dereferencing converted a
BOUNDED LOUD failure into an UNBOUNDED one that writes a deep garbage tree first. That is a real
severity increase introduced by the ruling, and pricing it after the fact rather than pretending it was
foreseen is the right way to carry it.

**Disposition UPHELD as non-blocking**, with the reasoning tightened -- because "not reachable in-tree"
is the weaker half of the argument:

- The trigger IS reachable in principle: `index.ts:728` copies from a USER-SUPPLIED game root, and
  symlinks in asset trees are ordinary, not exotic.
- What makes it non-blocking is **absence of an untrusted-input path and absence of CI exposure**. The
  user supplies their own tree, so the only party harmed is the one who created the cycle. And CI copies
  only in-repo trees (`hello-*`, `gravewake`), all verified symlink-free -- so the Director's "a runner
  disk is not infinite" concern has **no exposure today**. The disk risk is developer-local.
- That is a materially different argument from "not reachable", and it is the one that should be on the
  record, because it identifies exactly what would change the answer: the first time CI or any shared
  runner copies a tree it did not author, this becomes blocking immediately.

**Concrete cheap fix for the atom-2 entry condition:** a DEPTH CAP, not a visited-set. A `realpath`
visited-set is O(n) memory and needs bookkeeping across the recursion; a depth parameter with a hard
limit is three lines, needs no state, and converts unbounded-silent into bounded-loud -- which is
exactly the property dereference destroyed. No legitimate asset tree is 50 directories deep. A
visited-set can be added later if genuine deep-tree cases appear; the cap restores the safety property
now. Agreed as a BLOCKING entry condition on the next atom.

## Other residuals -- carried, none certified as covered

- **N2:** `sfx/blip.ogg` does not exist; `hello-empty` declares one required file and drags in 424 to
  obtain zero of it. The correct copy set is EMPTY.
- **N3:** unit correction, 86.6 MB decimal = 82.61 MiB. ~5% error, conclusion unaffected, corrected in
  the record rather than quietly restated.
- **N4:** dereference absorbs out-of-tree contents from a user-supplied root -- the same entry point as
  N1 and the same non-blocking reasoning applies.
- **Six Auditor legs returned UNVERIFIED** and are listed in the handoff rather than omitted. I did not
  re-derive them and this verdict does not cover them.

## Executes-clean, my own run

    pnpm install --frozen-lockfile   rc=0
    pnpm -r run build                rc=0
    pnpm test                        rc=0    324 passed, 0 failed

One instrument note: an isolated `pnpm --filter @anvil/cli run build` returns rc=2 because workspace
dependencies are not built in isolation. That is my invocation, not a defect -- the full `pnpm -r run
build` is rc=0. Recording it so the rc=2 is not mistaken for a finding by a later reader.

## Provenance

Builder `grok:anvil-dfdu`, certifier `claude` / seat `d6id8o0h`, spec author `director:EMCC`,
`spec_author_llm: claude` -- all present, so the R-3a date-gate is satisfied rather than sidestepped,
and the Director validated against EMCC's gate before dropping even though this repo does not run it in
CI. That is the correction from the ARENA-1 scope error applied rather than merely acknowledged.

**Drop authored by the Director, not the builder.** I checked the reasoning rather than accepting it:
the handoff is on main in `0-Inbox/grok-audit/` and is absent from the range diff, so it contributes
nothing to the certified content and cannot make `builder_llm` false for any part of it. Endorsed, same
as the MOD-8 re-pin.

## What this verdict does NOT buy

It certifies the dereference fix, its single discriminating test, and the F4 retirement **on Linux**.
It does not certify Windows behaviour, does not close N1/N2/N4, does not cover the six unverified
Auditor legs, and does not assert that the copy SET is correct -- N2 says it is not.

Certified content is `b4b7dfb`, not PR #8. If the head moves before merge, blob-compare the certified
paths or re-cert.
