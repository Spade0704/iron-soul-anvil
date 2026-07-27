---
date: 2026-07-27
slug: arena1-command-scaffold
range: a7f8c0e..4b81ed5
auditor: fresh-context Claude (Regime B, Director-spawned)
verdict: PASS
blocking_findings: 0
---

# AUDITOR VERDICT (Regime B, fresh-context Claude) - ARENA-1 PR #6, range a7f8c0e..4b81ed5

verdict: PASS, zero blocking findings.

Audited in a detached worktree at tip `4b81ed5`, confirmed by `ls-remote`. The Auditor derived
its own numbers, mutation-tested the control, ran every suite itself, and reported four instrument
behaviours of its own unprompted. Relayed verbatim by the Director from
`rul-20260727-arena1-auditor-pass-and-margin-correction` (main @ 506fbb3).

## Propagation hazard - READ BEFORE CERTIFYING

**The amendment `rul-20260727-arena1-exactness-not-drawcount` is on `main` at `76dfc81` and is NOT
on the branch.** The Auditor's first search of the *branch's* orchestrator log returned EMPTY. It
did not conclude the amendment did not exist and did not proceed against the unamended spec - it
checked main's log and read it there.

A certifier reading only the branch will audit against the **defective original work-order**, which
required a draw-count assertion that the amendment REPLACED. The certifier must be told explicitly
rather than left to repeat the Auditor's recovery.

## Corrected canon wording (the Director's own claim, corrected)

`rul-20260727-arena1-exactness-not-drawcount` states the check "trips EXACTLY ONE DRAW BEFORE the
first real divergence". **That is true for seed 1 and false for the seed the sim actually uses.**

Derived independently with exact BigInt arithmetic and a 200,000-seed sweep, taking no figure from
the build or the Director's brief; the Director then reproduced it analytically.

- gap = `n_diverge - n_unsafe` is 0 or 1, never negative. Over 200,002 seeds: gap 1: 99,738 | gap 0: 100,264.
- seed 1: n_unsafe 4,917,759, n_diverge 4,917,760 -> gap 1. This is the case the ruling generalised from.
- `createStreams(1).sim`, initialState 190,883,030: n_unsafe AND n_diverge are BOTH 4,917,759 -> **gap 0**.
  The check trips on the SAME draw as divergence, not one before.

Why: the increment `0x6D2B79F5` is ODD, so consecutive accumulator sums alternate parity. Above
2^53 doubles step by 2, so odd integers are unrepresentable. If the first sum to reach 2^53 is EVEN
it is stored exactly and divergence comes one draw later; if ODD it rounds immediately and
divergence is simultaneous.

**The safety property is unchanged and is STRONGER than the ruling claimed, because it is PROVEN
rather than measured:** every integer of magnitude <= 2^53 is exactly representable in IEEE-754, and
`Number.isSafeInteger` goes false at the first value > 2^53-1, so `n_unsafe <= n_diverge` for every
seed NECESSARILY. The accumulator is strictly monotonic and the unsafe condition is absorbing, so a
single end-of-run check per stream cannot pass over a run whose output has already diverged.

**Corrected wording: the check trips AT OR BEFORE the first loss of canonicity and can NEVER trip
after it.** Do not say "exactly one draw before". The 200k sweep is corroboration of a proof, not
the basis for it.

## What the Auditor proved rather than accepted

- **Mutation-tested the control**, three independent mutants, each verified to have APPLIED by
  grepping for a marker before running: `isStateExact` forced true -> iron-soul and core both exit 1;
  assertion loop emptied -> exit 1; assertion forced to throw unconditionally -> 7 failures including
  6 in `sim.test.ts`. **That third one is the important one**: it proves `assertStreamsWithinCliff`
  is genuinely invoked FROM THE PRODUCTION RUN PATH, not merely called by its own test.
- **Honest-run timing:** 4.92M real draws at ~7 ns/draw, observed 37 ms module / 32 ms core under
  mutation. A shortcut would read ~0 ms; the withdrawn Proxy build ~11x more.
- **Golden verified by blob SHA**, not by absence from the diff:
  `d2e4d9e0425777b9fe8a5315b5c6f973640d542f` byte-identical at `eed1961`, `a7f8c0e` AND `4b81ed5`.
- **FNV-1a recomputed independently** over all six labels; all six literals match, zero collisions,
  no pair XORs to the three forbidden deltas.
- **Suites run by the Auditor:** install 0, build across 24 projects 0, `pnpm test` 276 passed 0,
  lint 0, tsc 0, validate/test:examples 0, `anvil validate` + `anvil test` on the module both ok:true 0.

## Findings - none blocking

**F2 (carry into the next atom).** `sim.ts` `cliffChecked` latches **once per sim INSTANCE, not once
per `run()`**. Both the directive and the amendment say one comparison per stream PER RUN. A sim
driven by repeated `run()` calls that never reach RESOLVE is checked only after the FIRST call, when
state is still small. Not exploitable today - `maxCombatTicks` defaults to 200, roughly 6,000x below
the cliff, and RESOLVE is terminal - but it is a SILENT WEAKENING of the control if run lengths ever
grow.

**F1 (wording, no code change, no re-cert).** In-code comments state the cliff timing as
unconditional fact - the same over-generalisation corrected above.

**F4 (pre-existing, NOT this atom's).** `pnpm test:gravewake` exits 1 on Windows with a doubled drive
letter from a `file://` URL conversion. The Auditor **did not assume it was unrelated** - it checked
out the BASE commit in a second worktree, built clean, and reproduced the identical failure, so it
fails at BOTH ends of the range. Consequence: the game-level gravewake canary could not run, and
`pnpm check` cannot complete on Windows at either end. Mitigated by the CORE-level canary passing.

**F3, F5, F6, F7 (informational).** A canary test narrower than its comment claims; the module's
`anvil validate`/`test` not wired into any repo script; a transcript header one commit behind the tip
which the Auditor CHECKED and found to be correct capture-then-commit ordering rather than staleness;
and two `.gitkeep` paths absent from the builder's self-imposed file manifest, both legitimate.

## Six items marked UNVERIFIED rather than assumed

1. **CI/Linux behaviour NOT OBSERVED** - every result is from one Windows host, and given F4 the full
   gate cannot complete there. *(See the handoff: this is now known to be structurally unavailable,
   not merely unobserved - `rul-20260727-anvil-ci-never-ran-fork`.)*
2. The game-level gravewake canary.
3. Whether the scaffold was produced by the actual `anvil new --genre none` command rather than
   authored to match its shape. The acceptance bar is the shape, which is met.
4. Two packages have no test files at all, so the 276 figure does not cover them.
5. Builder identity and cert-lane eligibility - not tree-verifiable; belongs to the Director's
   dual-PASS close.
6. Deep-freeze of the stream bag - flagged as a reading of the spec rather than buried.

## The Auditor's own instrument failures, self-reported

Its first base-comparison run was a FALSE NEGATIVE it caught: base exited 2 with a TypeScript
module-resolution error, not the path bug - had it recorded "base also fails" it would have been
**right by accident for the wrong reason**. It read the output, saw the failure mode did not match,
built first, re-ran, and got the identical path error.

It also used a broken `; echo (exit $?)` idiom after a pipeline in two greps, reporting the tail's
status rather than grep's, and flagged that those annotations are meaningless while noting no
conclusion rested on them.

Fifth and sixth instances of the day's instrument-failure class, both caught by the seat itself.
