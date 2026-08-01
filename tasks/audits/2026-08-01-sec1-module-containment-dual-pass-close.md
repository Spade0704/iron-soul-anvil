# DUAL-PASS CLOSE — SEC-1 module-containment Layer 2 (Anvil PR #14)

- **Close id:** `close-20260801-sec1-dual-pass`
- **Wave:** WAVE-B
- **Director:** `grok:EMCC-Director`
- **Verdict:** **DUAL_PASS**
- **Status:** `dual_pass_closed_pending_human_merge`
- **Date:** 2026-08-01

## Chain

| Leg | Seat | Result | Ref |
|-----|------|--------|-----|
| Build | `grok:anvil-dfdu` (declared) | product `86d198f` | PR #14 |
| Auditor | `grok:EMCC-Auditor` | **AUDITOR_PASS** | `*-auditor.md` |
| Certifier | `claude` | **CERT_PASS** blocking=0 | `*-lattice-certifier.md` |
| Director | this seat | **DUAL_PASS** | this file |

## Product

- `resolveContainedModule` + `ModuleContainmentError` before `import()` on relative module ids
- realpath + refuse `../` / absolute / drive; junction probe RED
- tests: loadModules.containment.test.ts; floors 62 pass | 2 todo; tsc OK; CI green
- MODULE_TRUST_POSTURE Layer 2 implemented

## Floors accepted

| Floor | Result |
|-------|--------|
| Auditor suite | 62 passed | 2 todo; tsc OK |
| Certifier suite | same (isolated worktree after workspace build) |
| Certifier falsifier | naive resolve -> containment tests RED |
| Pre-gate handoff | PASS (Anvil cwd) |
| CI PR #14 | build-test + examples SUCCESS |
| Director re-smoke | 62 passed | 2 todo (packages/cli) |

## Carries (non-blocking)

| ID | Note |
|----|------|
| C1 | Session note: product typed in Director room vs handoff Lattice seat — same vendor (grok); CF3 holds |
| C2 | Posture uses symbols not file:line — acceptable |
| C3 | Unknown bare module ids silently dropped (pre-existing; out of SEC-1) |
| C4 | cert_class flipped parked -> cross-model-certified on this close |

## Human next

1. Squash-merge **Spade0704/iron-soul-anvil#14**
2. Flip WAVE-B DONE on EMCC program board + SEC-1 todo
3. **Next wave:** WAVE-E (author loops after B closed)

## STATUS

```text
STATUS|SEC-1|DUAL_PASS
atom=SEC-1
pr=14
product=86d198f
close_id=close-20260801-sec1-dual-pass
wave=WAVE-B
next=human-merge-anvil-#14|WAVE-E
```
