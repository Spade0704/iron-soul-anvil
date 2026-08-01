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
status: awaiting_auditor
phase: build
created_at: 2026-08-01T14:00:00Z
updated_at: 2026-08-01T14:00:00Z
target_repo: D:/Projects/IronSoul-Anvil/iron-soul-anvil
range: 8a3b7dc..86d198f
branch: claude/sec1-module-containment
pr: 14
proposal: SEC-1 WAVE-B module-containment Layer 2 — resolveContainedModule before import
auditor_verdict: pending
auditor_id: ""
auditor_seat: grok:EMCC-Auditor
auditor_ref: ""
evidence_ref: tasks/audits/2026-08-01-sec1-module-containment-evidence.md
spec_author_llm: grok
spec_author_seat: grok:EMCC-Director
cert_class: parked-awaiting-cross-model
decorrelation: cross
wake_build: false
caveat: "parked-awaiting-cross-model is NOT cross-model certified. Hold until Regime-B Auditor PASS then flip status to pending for external cert. CISO unlock Operator 2026-08-01; DF PROCEED-WITH-CHANGES."
---

# CERT_REQ — SEC-1 module-containment Layer 2 (WAVE-B)

You are **Regime-B Auditor** first (status awaiting_auditor). After PASS, flip to pending for **Claude External Certifier** (builder_llm=grok).

Not Director. Not the builder.

## Independence

- **Builder:** `grok:anvil-dfdu` (session Lattice for Anvil)
- **Auditor:** Regime B != builder
- **Certifier:** claude (planned)
- **Directive / DF:** EMCC `tasks/delta-force/2026-08-01-wave-b-sec1-module-containment.md`
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

## Executes-clean

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
| Regime-B Auditor | **awaiting** |
| External CERT | after Auditor PASS |
| Director dual-PASS | not yet |
| Human merge | Anvil **#14** only after dual-PASS |
