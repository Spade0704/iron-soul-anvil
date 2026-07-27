---
schema: cert-handoff/v1.1
certifier_id: claude
producer_id: lattice
builder_id: grok:anvil-dfdu
builder_llm: grok
builder_model: grok
certifier_model: claude
director_id: director:EMCC
directive_ref: dir-20260727-anvil-arena-command-scaffold
slug: 2026-07-27-arena1-command-scaffold
attempt: 1
status: pending
phase: build
created_at: 2026-07-27T13:34:29Z
updated_at: 2026-07-27T13:34:29Z
target_repo: D:/Projects/IronSoul-Anvil/iron-soul-anvil
repo: iron-soul-anvil
range: a7f8c0e..4b81ed5
pr: https://github.com/Spade0704/iron-soul-anvil/pull/6
pr_branch: arena-1/command-scaffold
proposal: ARENA-1 arena scaffold + command-layer determinism surface - two read-only SeededRng methods (getState, isStateExact), labelled stream bag, and an end-of-run canonicity assertion on the production run path
cert_class: cross-model-certified
decorrelation: cross
risk_class: low
auditor_verdict: PASS
auditor_ref: tasks/audits/2026-07-27-arena1-command-scaffold-auditor.md
evidence_ref: docs/evidence/arena-1-transcript.txt (on branch @ 4b81ed5, builder-captured); Auditor own-run reproduced independently in a detached worktree at 4b81ed5 - install 0, build 24 projects 0, pnpm test 276 passed 0, lint 0, tsc 0, validate/test:examples 0, anvil validate + anvil test ok:true 0. Control mutation-tested with three applied mutants.
file_manifest_ref: tasks/ARENA-1-FILE-MANIFEST.md (on PR branch @ 4b81ed5)
---

# Cert-handoff (attempt 1, status: pending) - ARENA-1 arena scaffold + command determinism

**For the cross-model certifier (Claude External Certifier seat / peer `d6id8o0h`).**
Coordination-plane drop on `iron-soul-anvil` **main**. CODE lives on branch
`arena-1/command-scaffold` / **PR #6** (human-at-merge). Nothing is merged by the builder.

## READ THIS FIRST - propagation hazard, the Auditor hit it

**The amendment `rul-20260727-arena1-exactness-not-drawcount` is on `main` at `76dfc81` and is NOT on
the branch.** A certifier reading only the branch will audit against the **defective original
work-order**, which required a masked `getState()` AND a draw-count assertion - mutually incompatible
requirements that the amendment REPLACED with an exactness assertion.

The Auditor's first search of the branch log returned EMPTY and it recovered by reading main. You are
being told explicitly so you do not have to.

**Read from `main`, not the branch:** `a7f8c0e` (directive), `76dfc81` (amendment), `506fbb3`
(Auditor PASS + margin correction), `90af034` (CI/fork ruling).

## Identity / decorrelation

| Role | Identity |
|------|----------|
| Builder | `grok:anvil-dfdu` (Anvil DFDU seat, builder_llm/model **grok**) |
| Auditor | fresh-Claude Regime B (Director-spawned; verdict on main @ `506fbb3`, artifact `tasks/audits/2026-07-27-arena1-command-scaffold-auditor.md`) |
| Certifier | **claude** (`certifier_id: claude`) - never Grok/Hermes (same-vendor forbidden for Grok-built atoms) |
| Spec author | `director:EMCC` |
| cert_class | `cross-model-certified` / `decorrelation: cross` |

`builder_id != certifier_id` and `builder_model (grok) != certifier_model (claude)`.
Per C1, the certifier is neither the builder nor the spec author.

## Named residuals - these are NOT to be certified as covered

**R1 - the CI/Linux leg is STRUCTURALLY UNAVAILABLE, not merely unobserved.**
`Spade0704/iron-soul-anvil` is a **fork** of `7etsuo/anvil`; GitHub disables Actions on forks by
default. `ci.yml` is registered `state=active` and Actions permissions read `enabled: true`, but
**total workflow runs across all workflows since repo creation is ZERO**. `ci.yml` is path-filtered
to `anvil/**` and this branch touches two qualifying files, so a qualifying push exists and produced
nothing - this is not CI lagging. PR #6 has **0 check-runs**. Ruling: `rul-20260727-anvil-ci-never-ran-fork`
(main @ `90af034`). A present-but-never-executed workflow must NOT read as coverage. Every result in
this atom is from **one Windows host**.

**R2 - F4, pre-existing, fails at BOTH ends of the range.** `pnpm test:gravewake` exits 1 on Windows
(doubled drive letter from a `file://` conversion). The Auditor reproduced it at the BASE commit in a
second worktree rather than assuming it was unrelated. The game-level gravewake canary could not run
and `pnpm check` cannot complete on Windows at either end. Mitigated by the CORE-level canary passing.
Not this atom's defect; do not gate on it, do not treat it as covered.

**R3 - F2, carried by Director ruling, and the certifier is invited to test the premise.**
`sim.ts` `cliffChecked` latches once per sim INSTANCE, not once per `run()`, while both directive and
amendment say per run. Director disposition: carry to the next atom, on the grounds that it is latent
today (`maxCombatTicks` 200, ~6,000x below the cliff; RESOLVE terminal). **That disposition rests on a
checkable fact: is a sim instance actually reused across `run()` calls anywhere in current code?**
If every `run()` constructs a fresh instance, latent and the carry is right. If instances are reused
anywhere, runs 2..N are silently unchecked TODAY and "not exploitable today" is FALSE. Check the
construction sites; report either way.

**R4 - two packages have no test files at all**, so the 276-pass figure does not cover them.

## Corrected canon - do not re-derive from the ruling text

The check trips **AT OR BEFORE** the first loss of canonicity and can NEVER trip after it. The
earlier "exactly one draw before" wording is WRONG and was corrected at `506fbb3`: the gap is
seed-dependent (0 or 1) and is **0 for the seed the sim actually uses**. The 50/50 split is a parity
theorem, not a measurement - the increment is odd so sums alternate parity, and above 2^53 only even
integers are representable. Safety is proven from exact representability plus monotonicity, not
sampled.

## What is already verified and should not be redone

Golden verified byte-identical by blob SHA at all three commits; FNV-1a recomputed independently over
all six labels with zero collisions; the control mutation-tested with three applied mutants, including
one proving `assertStreamsWithinCliff` fires from the PRODUCTION run path; honest-run timing consistent
with 4.92M real draws.

## Closing

Director closes on DUAL PASS only. Write your verdict to `tasks/audits/` **without a `cert_class`
front-matter key** (the corpus gate globs that directory and a `cert_class` member there reds a
currently-green gate), then flip `status` in this file.
