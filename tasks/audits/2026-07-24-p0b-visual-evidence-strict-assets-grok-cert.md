---
date: 2026-07-26
slug: 2026-07-24-p0b-visual-evidence-strict-assets
target_repo: D:/Projects/IronSoul-Anvil/iron-soul-anvil
range: 8254a1b..997d896
certifier: Grok (xAI) — EMCC External Certifier
verdict: FAILED(validate_cert_handoff: missing phase; missing director_id; unknown cert_class 'mechanical-pass-human-aesthetic')
chat: FAILED(validate_cert_handoff pre-gate)
execute: deferred (pre-gate refuse)
vision: n/a
---

# Grok cert — 2026-07-24-p0b-visual-evidence-strict-assets (P0b visual-evidence)

## 1. Disclosure

- **Cold read.** Certifier did not author the range. Producer `lattice:iron-soul-dfdu` /
  `builder_model: claude`. Handoff selected by `poll_select.py` (oldest local pending
  `certifier_id: grok`).
- Coordination drop: `0-Inbox/grok-audit/cert-p0b-visual-evidence-strict-assets-pending.md`
  on iron-soul-anvil main. Code range claimed on `claude/p0b-visual-evidence` / PR #3.
- **Pre-gate refused.** Full Chat / Execute / Vision of the code range was **not** run.
  Fail-closed per EMCC External Certifier protocol.

## 2. Chat

### Pre-gate (mandatory)

```text
python validate_poll_handoff.py <handoff>
→ validate_cert_handoff.py
```

**Result: FAIL (exit 1)**

| Violation | Detail |
|-----------|--------|
| `phase` | missing (expected `plan` \| `build` \| `final`) |
| `director_id` | missing |
| `cert_class` | unknown `'mechanical-pass-human-aesthetic'` (expected `cross-model-attested` \| `cross-model-certified` \| `parked-awaiting-cross-model` \| `peer-reviewed-same-model`) |

Non-zero validator exit → **REFUSE** further certification. No proposal-vs-job substance
pass, no mechanical floor beyond the schema gate, no Execute rebuild, no Vision.

### Scope note (not certified)

Handoff claims range `8254a1b..997d896` (P0b visual-evidence v0.1 / `anvil test --strict-assets`).
Refs resolve after `git fetch --all` (`997d896` tip of `origin/claude/p0b-visual-evidence`).
**Range content was not audited** because pre-gate failed.

## 3. Execute

**deferred (pre-gate refuse)** — CISO / rebuild not entered. `evidence_ref` narrative was not
independently re-run.

## 4. Vision

**n/a** — not entered (pre-gate refuse). Handoff describes mechanical visual-evidence checks,
not a frontend screenshot-vs-comp gate for this cert tick.

## 5. Verdict

**FAILED(validate_cert_handoff: missing phase; missing director_id; unknown cert_class 'mechanical-pass-human-aesthetic')**

Builder/Director must re-drop a schema-valid handoff (`phase`, `director_id`, allowed
`cert_class` + required fields per `validate_cert_handoff.py` / framework handoff v1.1) before
Grok can run Chat+Execute(+Vision) on `8254a1b..997d896` / PR #3. Certifier does not author
or patch the handoff schema fields beyond status/verdict close on this tick.
