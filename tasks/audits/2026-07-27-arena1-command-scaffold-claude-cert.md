---
date: 2026-07-27
slug: 2026-07-27-arena1-command-scaffold
target_repo: Spade0704/iron-soul-anvil
pr: 6
branch: arena-1/command-scaffold
range: a7f8c0e..4b81ed5
certifier_id: claude
certifier_seat: d6id8o0h
certifier_model: claude-opus-5
builder_id: grok:anvil-dfdu
builder_model: grok
directive_ref: dir-20260727-anvil-arena-command-scaffold (+ rul-20260727-arena1-exactness-not-drawcount)
auditor_ref: tasks/audits/2026-07-27-arena1-command-scaffold-auditor.md
verdict: PASS
risk_class: low
---

# Claude External Certifier verdict -- ARENA-1, arena scaffold + command-layer determinism surface

**VERDICT: PASS.** Cross-model certification of a Grok-built atom. Every result below was produced by
running the committed code in a detached worktree at the range tip on this host. Zero blocking
findings. Four residuals carried and NAMED -- none certified as covered. One of them (R3) was an open
question assigned to me and is now ANSWERED.

Spec read from **main** (`a7f8c0e` directive, `76dfc81` amendment), never from the branch. I confirmed
independently that the amendment is absent from the branch log, so a certifier reading only the branch
would audit against the superseded draw-count work-order.

## Range and surface

    range  a7f8c0e..4b81ed5   declared base == git merge-base(origin/main, tip)   a7f8c0e ancestor: YES

**Core surface fence -- EXACTLY TWO read-only methods, satisfied.** The diff to
`anvil/packages/core/src/kernel/SeededRng.ts` adds `getState(): number` (masked `>>> 0`) and
`isStateExact(): boolean` (`Number.isSafeInteger(this.state)`). No setter, no restore, no other core
surface. The Proxy and per-draw counter are **gone** -- the only remaining mention is a comment in
`streams.ts` recording their absence.

## The amendment's arithmetic -- reproduced, not accepted

    INC = 0x6D2B79F5 = 1831565813, ODD
    2^53 // INC = 4,917,758                       matches
    n*INC     = 9007197429407254 <= 2^53   TRUE
    (n+1)*INC = 9007199260973067 <= 2^53   FALSE
    seed 1: n_unsafe 4,917,759   n_diverge 4,917,760   gap 1

**Both legs of the margin claim are proven rather than sampled.**
*Safety:* every integer <= 2^53 is exactly representable and `isSafeInteger` goes false at the first
value above 2^53-1, so `n_unsafe <= n_diverge` NECESSARILY, for every seed. The check fires **at or
before** the first loss of canonicity, never after.
*Distribution:* over 2000 seeds the gap split is exactly `{0: 1000, 1: 1000}`, never negative -- and it
is a **parity theorem, not a measurement**. `INC` is odd so `seed + n*INC` alternates parity; above 2^53
only even integers are representable; so the first-unsafe value is odd half the time (rounds
immediately, gap 0) and even half the time (survives one more draw, gap 1). No seed count could
surprise this.

`F1` (code comments saying "exactly one draw before") is a wording defect against the general case,
non-blocking, no re-cert -- consistent with the Director's own correction.

## The control is on the PRODUCTION run path -- re-mutated independently

`checkCliffOnce()` is invoked from two production sites: the RESOLVE terminal transition
(`sim.ts:171`) and the end of `run()` (`sim.ts:178`). I forced `assertStreamsWithinCliff` to throw
unconditionally, **verified the mutant applied by content change before running**, and re-ran:

    mutant applied  -> FAILED: 8 tests   6 in sim.test.ts + 2 in streams.test.ts
    restored        -> 29/29 pass, streams.ts blob back to b2a54ed4

The six `sim.test.ts` failures are the load-bearing result: they are production-path tests, not the
control's own tests, so the assertion genuinely runs in the sim rather than only under its own spec.
Minor discrepancy recorded honestly: the Auditor reported 7 total including 6 in `sim.test.ts`; I
measured 8 total including the same 6. The sim-side count matches exactly; the difference is in
`streams.test.ts` and is consistent with a different mutant insertion point. Same conclusion.

## Executes-clean, my own run

    pnpm install --frozen-lockfile   rc=0
    pnpm -r run build                rc=0   (24 projects)
    pnpm test                        rc=0
    ../games/iron-soul               3 files, 29 tests, all pass

Host: Windows. See R1 -- this is the ONLY host any result in this atom comes from.

## Independent verification of two Auditor claims

**Golden identity.** Blob SHAs across `eed1961` / `a7f8c0e` / `4b81ed5`, all identical:

    golden.json                          d2e4d9e
    external-vectors.json                1bf1899
    gravewarden.png                      e0fee05
    gravewarden.png.visual-evidence.json 2be61d8

The core change did not disturb any golden or the gravewake visual-evidence artifacts.

**FNV-1a conformance, and this one is stronger than "recomputed".** The fixture asserts against the
PUBLISHED FNV-1a 32-bit reference vectors, so it is an external reference and not a mirror of the
implementation:

    ''       fixture 811c9dc5   independent 811c9dc5   MATCH
    'a'      fixture e40c292c   independent e40c292c   MATCH
    'foobar' fixture bf9cf968   independent bf9cf968   MATCH

The six stream labels (`sim`, `opponent`, `shop`, `crit`, `bow-check`, `override`) are all ASCII, so the
core's stated UTF-16-code-unit derivation and a UTF-8 recompute coincide numerically. **Latent trap
worth recording:** that equivalence is a property of the current labels, not of the algorithm. A
non-ASCII label would diverge between a UTF-16 and a UTF-8 implementation. Not a defect today; a
constraint on future labels.

## R3 -- ANSWERED. F2 is LATENT, and the carry disposition HOLDS

This was left open for me and I did not assume it. `cliffChecked` latches once per `AutobattlerSim`
instance rather than once per `run()`. The question was whether any instance is actually reused.

    every AutobattlerSim construction site, repo-wide:
      sim.test.ts:17  -> 1 run() call
      sim.test.ts:48  -> 1 run() call
      sim.test.ts:97  -> 0 run() calls
    games/iron-soul/src/index.ts only RE-EXPORTS the class; it does not construct or run it.

**No instance is reused across `run()` calls anywhere in current code.** So runs 2..N do not exist,
"not exploitable today" is TRUE as verified fact rather than as assumption, and carrying F2 to the next
atom is correct. The defect remains real and latent: if any future caller reuses an instance, its
second and later runs are silently unchecked. That is the thing to re-test when run lengths or call
patterns change, not the cliff margin.

## Residuals -- carried and NAMED, none certified as covered

**R1 -- the CI/Linux leg is STRUCTURALLY UNAVAILABLE.** `iron-soul-anvil` is `fork=true` of
`7etsuo/anvil`; total workflow runs across all workflows since repo creation (2026-07-16) is **zero**.
`ci.yml` is `state=active` and repo Actions read `enabled=true`, but the empirical run count is what
settles it. The branch is pushed and touches two files matching the `anvil/**` filter, so a qualifying
push exists and produced nothing. **Every result in this atom, mine and the Auditor's, is from one
Windows host.** Linux behaviour is unobserved and cannot be certified here. A present-but-never-executed
`ci.yml` must not be read as coverage; the workflow itself is unproven and may fail on first execution.

**R1b -- a SECOND CI gap I found, distinct from the fork issue and not closed by fixing it.** The
workflow triggers on `anvil/**` only, but the pnpm workspace at `anvil/pnpm-workspace.yaml` includes
`../games/gravewake` and `../games/iron-soul`. So `pnpm test` in CI *does* cover `games/**`, while a
change touching *only* `games/**` never triggers the workflow at all. ARENA-1 happens to touch both, so
it would trigger -- but a future iron-soul-only change ships with zero CI even after Actions is enabled.
The trigger paths and the workspace membership disagree. Filed, not scoped here.

**R2 -- F4 is pre-existing and fails at BOTH ends of the range.** Not gated on, not treated as covered.

**R3 -- ANSWERED above.** Latent, carry correct, premise verified rather than assumed.

**R4 -- two packages have no test files**, so the suite total does not cover them.

## Provenance

**This verdict closes on cert-handoff ATTEMPT 2** (`cert-2026-07-27-arena1-command-scaffold-attempt2.md`,
main @`07a9882`), a metadata-only re-drop superseding attempt 1. Range byte-identical at
`a7f8c0e..4b81ed5`, same builder, same evidence, same `auditor_verdict`. No rebuild, no re-audit, no
re-run of any code leg -- the certified content is bit-for-bit what this verdict tested.

Builder `grok:anvil-dfdu`, certifier `claude` / seat `d6id8o0h`, spec author seat
**`pm:IronSoul-Anvil`** -- C1 satisfied, decorrelation `cross`. All four seats mutually distinct. Zero
involvement: I neither authored the spec nor wrote any line in the certified range. My prior
contribution was the R1 fork/CI finding and the parity tightening, both certifier-side analysis.

### TWO CORRECTIONS to this verdict as first issued

Both were made in the same way -- a conclusion drawn from a query I narrowed myself -- and both are
corrected here rather than quietly dropped, because a false statement in a cert record becomes
precedent for the next author who reads it.

**Correction 1 -- spec author.** This verdict originally read "spec author `director:EMCC`". That was
wrong. The directive `dir-20260727-anvil-arena-command-scaffold` @`a7f8c0e` DECLARES its own authorship
in fields the Director wrote:

    spec_author_seat     pm:IronSoul-Anvil
    content_drafted_by   pm:IronSoul-Anvil (content theirs; issuance and routing the Director's;
                                            execution the Grok seat's)

I had printed only `from` / `to` / `cc`, seen `from=director:EMCC`, and inferred authorship from the
ISSUER field. Attempt 2's `spec_author_seat: pm:IronSoul-Anvil` copies the directive's own declaration
and is correct; I briefly raised it as a blocker and the Anvil PM refuted it with the full record.
**Structural cause worth carrying:** the amendment `rul-20260727-arena1-exactness-not-drawcount` carries
NO authorship field at all, so `from` is the only signal there -- which is exactly where inferring
authorship from the issuer is most tempting and least safe. When a coordination record does not declare
authorship, go looking; do not infer it from `from`.

**Correction 2 -- scope of the R-3a rules.** This verdict originally read "this repo does not run EMCC's
`validate_cert_handoff.py`, so EMCC's R-3a date-gate and mandatory `spec_author_*` fields do not apply".
That was wrong. `iron-soul-anvil` ships no LOCAL validator -- verified -- but EMCC's validator is run
CROSS-REPO against anvil handoffs, and the R-3a rules therefore DO apply here. I conflated *where the
enforcement code lives* with *whether the rule is in force*.

**Attempt 1's failure is R-3a's first live firing anywhere, and it was a genuine catch.** Attempt 1
declared `created_at: 2026-07-27T13:34:29Z` -- 34 minutes past the `SPEC_AUTHOR_MANDATORY_CUTOFF` that
R-3a set and merged at 11:24Z -- with `spec_author_llm`, `spec_author_seat` and `certifier_seat` all
absent. EMCC's validator exits 1 on both mandatory-field rules; I reproduced this myself. The R-3a
verdict recorded that the mandatory arm was fixture-proven only and awaited live data. **This is that
data: the gate fired correctly, on a real artifact, and caught a real omission.** That stands on its own
merits and is independent of the attribution question above.

## What this verdict does NOT buy

It certifies that the core surface is exactly two read-only methods, that the Proxy is gone, that the
exactness assertion is load-bearing and runs on the production path, that the goldens and FNV
conformance are untouched, and that F2 is latent rather than live. It does NOT cover Linux or CI
behaviour at all (R1/R1b), does not close F4 (R2), does not fix F2 (R3), and does not extend coverage to
the two untested packages (R4).

Certified content is `4b81ed5`, not PR #6. If the head moves before merge, blob-compare the certified
paths or re-cert.
