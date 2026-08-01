---
schema: cert-handoff/v1.1
certifier_id: claude
producer_id: grok:anvil-dfdu
builder_id: grok:anvil-dfdu
builder_llm: grok
builder_model: grok
certifier_model: claude
director_id: grok:EMCC-Director
directive_ref: tasks/orchestrator-log.jsonl#dir-20260801-wave-b-sec1
slug: 2026-08-01-sec1-module-containment
attempt: 1
status: pending
phase: build
created_at: 2026-08-01T14:00:00Z
updated_at: 2026-08-01T18:00:00Z
target_repo: D:/Projects/IronSoul-Anvil/iron-soul-anvil
range: 8a3b7dc..86d198f
branch: claude/sec1-module-containment
pr: 14
proposal: SEC-1 WAVE-B module-containment Layer 2 - resolveContainedModule before import
auditor_verdict: PASS
auditor_id: grok:EMCC-Auditor
auditor_seat: grok:EMCC-Auditor
auditor_ref: tasks/audits/2026-08-01-sec1-module-containment-auditor.md
evidence_ref: tasks/audits/2026-08-01-sec1-module-containment-evidence.md
spec_author_llm: grok
spec_author_seat: grok:EMCC-Director
cert_class: parked-awaiting-cross-model
decorrelation: cross
wake_build: false
caveat: "parked-awaiting-cross-model is NOT cross-model certified. Regime-B AUDITOR_PASS. External cert Claude (builder_llm=grok). CISO unlock Operator 2026-08-01; DF PROCEED-WITH-CHANGES. Note: directive_assignment currently lives on EMCC log — may need Anvil log mirror for validate_cert_handoff cwd=Anvil (B-DIR-01)."
---

# CERT_REQ - SEC-1 module-containment Layer 2 (WAVE-B)

You are **Claude External Certifier**. Claimable: `status: pending` + `auditor_verdict: PASS`.

Not Director. Not the Grok builder (`grok:anvil-dfdu`). Not Grok Auditor.

## Independence

- **Builder:** `grok:anvil-dfdu`
- **Auditor:** `grok:EMCC-Auditor` — **AUDITOR_PASS** at `auditor_ref`
- **Certifier:** Claude (`builder_llm=grok`)
- **Directive / DF:** EMCC `tasks/delta-force/2026-08-01-wave-b-sec1-module-containment.md`; directive id `dir-20260801-wave-b-sec1` (EMCC log; Anvil mirror may be required for local validate)
- **Loop:** EMCC `Biz.Automation/LOOP-DEFINITION-wave-b-sec1.md`

## Success criteria

1. `../` (and absolute/drive) module ids refuse with ModuleContainmentError
2. realpath + relative-under-root containment
3. In-root `./` load still allowed when file under root
4. Falsifier/PREM-1: naive resolve escapes; guard throws
5. MODULE_TRUST_POSTURE Layer 2 status accurate
6. dual-PASS + human merge (Judges + human)

## Product

- `anvil/packages/cli/src/loadModules.ts`
- `anvil/packages/cli/src/loadModules.containment.test.ts`
- `games/iron-soul/docs/MODULE_TRUST_POSTURE.md`

## Executes-clean (builder + Auditor)

```
cd anvil/packages/cli && pnpm test && pnpm run build
# 62 passed | 2 todo; tsc OK
```

## Gate status

| Leg | Status |
|-----|--------|
| CISO unlock | Operator 2026-08-01 |
| Delta Force | PROCEED-WITH-CHANGES |
| Build | DONE product `86d198f` |
| Regime-B Auditor | **AUDITOR_PASS** |
| External CERT | **pending this handoff** |
| Director dual-PASS | not yet |
| Human merge | **Anvil #14 only** after dual-PASS |

## Range (C1)

Product `86d198f` ancestor of tip; re-resolve if docs tip advances (`e4e844b` handoff commit).
