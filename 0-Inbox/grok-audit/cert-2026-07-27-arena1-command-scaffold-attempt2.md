---
schema: cert-handoff/v1.1
certifier_id: claude
certifier_seat: d6id8o0h
producer_id: pm:IronSoul-Anvil
builder_id: grok:anvil-dfdu
builder_llm: grok
builder_model: grok
certifier_model: claude
director_id: director:EMCC
spec_author_llm: claude
spec_author_seat: pm:IronSoul-Anvil
directive_ref: dir-20260727-anvil-arena-command-scaffold
slug: 2026-07-27-arena1-command-scaffold
attempt: 2
supersedes: 0-Inbox/grok-audit/cert-2026-07-27-arena1-command-scaffold-pending.md
status: done
verdict: PASS
verdict_ref: tasks/audits/2026-07-27-arena1-command-scaffold-claude-cert.md
phase: build
created_at: 2026-07-27T14:25:02Z
updated_at: 2026-07-27T14:25:02Z
target_repo: D:/Projects/IronSoul-Anvil/iron-soul-anvil
repo: iron-soul-anvil
range: a7f8c0eb522090125451950294e3becc33fd026d..4b81ed50d10198107089155ed62301cf7f663adc
pr: https://github.com/Spade0704/iron-soul-anvil/pull/6
pr_branch: arena-1/command-scaffold
proposal: ARENA-1 arena scaffold + command-layer determinism surface - two read-only SeededRng methods (getState, isStateExact), labelled per-sim stream bag, end-of-run canonicity assertion on the production run path, RNG-5 label gate in-module
cert_class: cross-model-certified
decorrelation: cross
risk_class: low
auditor_verdict: PASS
auditor_ref: tasks/audits/2026-07-27-arena1-command-scaffold-auditor.md
evidence_ref: docs/evidence/arena-1-transcript.txt (on branch @4b81ed5, builder-captured, EXIT 0 both legs); Auditor own-run in a detached worktree at 4b81ed5 - install 0, build 24 projects 0, pnpm test 276 passed 0, lint 0, tsc 0, validate/test:examples 0, anvil validate + anvil test ok:true 0, control mutation-tested with three APPLIED mutants; PM pre-gate own-run at 4b81ed5 reproduced anvil/ pnpm test EXIT 0 and games/iron-soul pnpm test EXIT 0 (29 tests / 3 files incl. cross-process hash agreement)
file_manifest_ref: tasks/ARENA-1-FILE-MANIFEST.md (on PR branch @4b81ed5)
amendment_ref: tasks/orchestrator-log.jsonl#rul-20260727-arena1-exactness-not-drawcount (on main @76dfc81ada99ebbfe5b895322c5cf7872d7d8515)
---

# Cert-handoff attempt 2 (status: pending) — ARENA-1 arena scaffold + command determinism surface

**METADATA RE-DROP ONLY. NO REBUILD, NO CODE TOUCHED, NO RE-AUDIT.**
Supersedes `cert-2026-07-27-arena1-command-scaffold-pending.md` (attempt 1). Handoffs are immutable; attempt 1 is left in place as the record and is NOT deleted. Shape follows the P0b precedent (`dir-20260726-p0b-requeue-anvil3`): same builder, same range, same evidence, same auditor verdict, metadata corrected.

## Why attempt 2 exists

Attempt 1 **fails `validate_cert_handoff`**:

```
FAIL  cert-2026-07-27-arena1-command-scaffold-pending.md
  - cross-model-certified with created_at on or after 2026-07-27T13:00:00Z
    requires non-empty spec_author_llm   (R-3a Q3: date-gated mandatory provenance declaration)
  - cross-model-certified with created_at on or after 2026-07-27T13:00:00Z
    requires non-empty spec_author_seat  (R-3a Q3)
EXIT 1
```

Attempt 1's `created_at` is `13:34:29Z`, 34 minutes past the `SPEC_AUTHOR_MANDATORY_CUTOFF` of `2026-07-27T13:00:00Z` that R-3a set and merged at 11:24Z. Both fields were absent, as was `certifier_seat`. This attempt supplies all three and validates clean.

Nothing about the **code** changed or is in question. The range is byte-identical, the Auditor's PASS and the certifier's PASS both stand against the same tip `4b81ed5`. The defect was in the coordination artifact, not the build.

Note on enforcement vs validity: this repo does not itself run `validate_cert_handoff`, so attempt 1 was never mechanically rejected here. That is a fact about **enforcement**. It is not a fact about **validity** — the artifact fails the gate when the gate is run against it, which is what this attempt corrects.

## ★ THE WORK-ORDER WAS AMENDED AND THE AMENDMENT IS NOT ON THE BRANCH ★

`rul-20260727-arena1-exactness-not-drawcount` is on **main @76dfc81** and is **NOT reachable from branch tip `4b81ed5`** — the branch was cut at `a7f8c0e`.

Certifying against the branch's copy of the orchestrator log alone audits this atom against the **defective original** work-order, which demanded a **draw-count** bounds assertion. The amendment replaced that with an **exactness** assertion and widened the core fence from one read-only method to exactly two. A certifier reading only the branch would mark the correct implementation as non-compliant. The ARENA-1 Auditor hit exactly this: its first search of the branch's log returned empty and it recovered only by checking main.

Read all three from **main**:
- `dir-20260727-anvil-arena-command-scaffold` @`a7f8c0e` — original work-order
- `rul-20260727-arena1-exactness-not-drawcount` @`76dfc81` — **the amendment; binding**
- `rul-20260727-arena1-auditor-pass-and-margin-correction` @`506fbb3` — Auditor PASS + margin correction

## Identity / decorrelation

| Leg | Value |
|---|---|
| builder | `grok:anvil-dfdu` (`builder_llm: grok`, `builder_model: grok`) |
| auditor | fresh-context Claude, Regime B, own-run at `4b81ed5` |
| certifier | `claude` / seat `d6id8o0h` |
| spec author | `claude` / seat `pm:IronSoul-Anvil` |

`certifier_model (claude)` vs `builder_model (grok)` → different vendors under R-4 normalization → `cross-model-certified`, `decorrelation: cross`.
`certifier_seat (d6id8o0h)` != `spec_author_seat (pm:IronSoul-Anvil)` → seat-scoped spec-author distinctness holds (R-3a).

## What was certified — four items, landed together

1. **Module scaffold** at the `anvil new --genre none` shape + purpose-built sim under `games/iron-soul`. Not `arpg-starter` — single-avatar direct-control is structurally wrong for multi-unit order-issuing.
2. **`createStreams(rootSeed)`** — per-sim frozen `Readonly<Record<StreamLabel, SeededRng>>` on sim state, never a module-level const. Root module-private, never escapes. Labels `sim · opponent · shop · crit · bow-check · override`, **shipped names adopted, nothing renamed** (`golden.json` is pinned to `sim`/`opponent`).
3. **Core — exactly two read-only methods**: `getState(): number { return this.state >>> 0 }` and `isStateExact(): boolean { return Number.isSafeInteger(this.state) }`. No setter, no restore; both emit no output so the gravewake vector is untouched.
4. **Canonicity-cliff bounds assertion** via `isStateExact()`, one comparison per stream per run, plus the **RNG-5 label gate in the module** importing `STREAM_LABELS` rather than declaring a copy.

## Carried findings — non-blocking, already dispositioned

**F1 (wording, in shipped comments).** `games/iron-soul/src/streams.ts:79` reads "fails safe one draw before first real divergence". That over-generalises from a single seed. Corrected canon: **trips AT OR BEFORE the first loss of canonicity, never after.** Independently reproduced by this seat across 20,000 seeds — `gap = n_diverge - n_unsafe` is 0 or 1, exactly 10000/10000, **never negative**. `seed 1` → gap 1; `createStreams(1).sim` → gap 0. Parity theorem: the increment is odd so sums alternate parity, and above 2^53 only even integers are representable. The comment is **inside the certified range**, so editing it would move the tip and invalidate the PASS — carried to the next atom by Director ruling. **Do not fail this drop on it.**

**F2 (latch scope).** `sim.ts:221-223` — `cliffChecked` latches once per sim **instance**, not per `run()`. Certifier verified empirically that no instance is reused in current code, so it is latent today. Re-test trigger is a **change in call patterns**, not the cliff margin. Carried.

**F4 (pre-existing, both ends of the range).** `pnpm test:gravewake` exits 1 on Windows (doubled drive letter from a `file://` conversion). The Auditor reproduced it at the **base** commit in a clean second worktree rather than assuming it was unrelated — it fails at `a7f8c0e` and `4b81ed5` alike. Not introduced here. Core-level gravewake canary passes; the **game-level** leg is UNVERIFIED.

## Declared UNVERIFIED — stated, not assumed

- **CI / Linux behaviour has never been observed.** Zero workflow runs on `Spade0704/iron-soul-anvil` across all workflows, all time; zero check-runs on `4b81ed5`. Every result is from one Windows host, and given F4 the full `pnpm check` gate cannot complete there at either end of the range. Largest residual.
- game-level gravewake canary (F4)
- whether the scaffold came from an actual `anvil new --genre none` invocation vs authored to match its shape — the acceptance bar is the shape, which is met
- two packages contain no test files, so the 276-test figure does not cover them
- deep-freeze of the stream bag — flagged as a spec reading

## Standing constraint

The core derives FNV over **UTF-16 code units**. All six current labels are ASCII so UTF-8 and UTF-16 coincide — a property of **today's labels**, not of the algorithm. A non-ASCII label would diverge between implementations.

## Out of scope — held deliberately

ReplayTape v2 (ruled: clean break, own atom) · the mulberry32 mask itself (bounded by item 4) · Imagine/assets (P0b gates separately) · any numeric headroom figure (**UNCOMPUTED** pending §13 — do not re-insert one) · `validate_cert_handoff` and every gate.

## For the certifier

`d6id8o0h`: the Director has reopened the close to **PENDING-REMEDY** and is **not assuming** your attempt-1 PASS carries to attempt 2. The reading offered is that it does — a cert covers a SHA, the range is byte-identical, and the correction is purely coordination metadata — but that is a reading of your verdict by others. **Please confirm whether your PASS carries, or re-run.** The atom is not to be re-closed until you say so.
