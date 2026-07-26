---
schema: cert-handoff/v1.1
certifier_id: claude
producer_id: lattice
builder_id: grok:anvil-dfdu
builder_llm: grok
builder_model: grok
certifier_model: claude
director_id: director:EMCC
directive_ref: dir-20260726-anvil-g0-workorder
slug: 2026-07-26-g0-greybox
attempt: 1
status: done
verdict: PASS
verdict_ref: tasks/audits/2026-07-26-g0-greybox-claude-cert.md
phase: build
created_at: 2026-07-26T11:15:00Z
updated_at: 2026-07-26T12:52:00Z
target_repo: D:/Projects/IronSoul-Anvil/iron-soul-anvil
repo: iron-soul-anvil
range: 4a0884b..c813feb
pr: https://github.com/Spade0704/iron-soul-anvil/pull/5
pr_branch: g0/greybox-b1-b3
proposal: G0 greybox pilot pass 2 - @anvil/core B1 stream/fork SeededRng + B3 hashString + games/iron-soul headless autobattler with replay-hash (ss1)
cert_class: cross-model-certified
decorrelation: cross
risk_class: low
auditor_verdict: PASS
auditor_ref: tasks/audits/2026-07-26-g0-greybox-auditor.md
evidence_ref: docs/evidence/g0-transcript.txt (builder captured git-bash tee of pnpm build && pnpm test, BUILD EXIT 0 TEST EXIT 0 on branch g0/greybox-b1-b3 @ c813feb); auditor own-run at tasks/audits/2026-07-26-g0-greybox-auditor.md reproduces package-by-package on detached worktree HEAD c813feb (core 114, iron-soul 15, cli 52+2todo; all three independent vector legs match)
delta_force_ref: (parent monorepo IronSoul-Anvil) tasks/delta-force/2026-07-26-g0-greybox-pre-build.md
file_manifest_ref: tasks/G0-FILE-MANIFEST.md (on PR branch @ c813feb)
---

# Cert-handoff (attempt 1, status: pending) - Anvil G0 greybox (B1 + B3 + headless sim)

**For the cross-model certifier (Claude External Certifier seat / peer d6id8o0h).**
Coordination-plane drop on `iron-soul-anvil` **main**. CODE lives on branch `g0/greybox-b1-b3` / **PR #5** (human-at-merge). Nothing is merged by the builder.

## Identity / decorrelation

| Role | Identity |
|------|----------|
| Builder | `grok:anvil-dfdu` (Anvil DFDU seat, builder_llm/model **grok**) |
| Auditor | fresh-Claude Regime B (Director-spawned; verdict on main @ b657947) |
| Certifier | **claude** (`certifier_id: claude`) - **never** Grok/Hermes (same-vendor forbidden for Grok-built atoms) |
| Director | `director:EMCC` |
| cert_class | `cross-model-certified` / `decorrelation: cross` |

`builder_id != certifier_id` and `builder_model (grok) != certifier_model (claude)`.

## What to certify

Range **`4a0884b..c813feb`** (25 files, +1085/-4 on the code commit):

1. **B1** `@anvil/core` `SeededRng` - keep mulberry32; fix seed 0/1 aliasing; additive `stream(name)` (pure) + `fork()` (advances parent); gravewake seed-42 canary.
2. **B3** core `hashString` (FNV-1a only); module-owned canonical serializer + `ss1:` hashSimState under `games/iron-soul`.
3. **Module greybox** headless PREP/COMBAT/RESOLVE autobattler, `replay/golden.json`, cross-process hash worker, external-vector fixtures.
4. **Evidence** real re-runnable transcript (not narration).

Binding plan: `tasks/delta-force/2026-07-26-g0-greybox-pre-build.md` (PASS as amended). Surgeon fence: `tasks/G0-FILE-MANIFEST.md`.

## Legs (framework/22 dual-PASS)

| Leg | Status |
|-----|--------|
| Build | DONE @ c813feb / PR #5 |
| executes-clean | Builder transcript + **Auditor own-run PASS** (see auditor_ref) |
| Independent Auditor (Regime B) | **PASS** - `tasks/audits/2026-07-26-g0-greybox-auditor.md` |
| Cross-model cert | **THIS request** (Claude certifier) |
| Close | Director dual-PASS -> human merges PR #5 |

## Auditor summary (do not re-author; cold-read the file)

- Own-run: detached worktree c813feb; `pnpm build` 0; `pnpm test` 0; counts match builder transcript.
- **All three independent vector legs matched** (mulberry32 seed-42; FNV-1a five strings; 100-tick sim `ss1:be646bd7`).
- Plan conformance PASS (mulberry32 kept; stream/fork contracts; B3 inverted correctly).
- 13 non-blocking findings (R1-R13); residuals include no CI/Linux leg (manifest forbade CI edits).

## Required disclosure - findings R2 and R9 (verbatim from auditor)

> - R2 MEDIUM - manifest NOT pre-committed (same commit as the code it fences). G1 process fix: manifest commit precedes build commit.

> - R9 LOW - transcript header git_head 4a0884b captured pre-commit from dirty worktree; not fabrication (all counts match auditor clean run at c813feb); judged on auditor run.

Certifier must treat these as disclosed residual process debt (non-blocking per Auditor), not as concealed defects.

## Other non-blocking findings (index only; full text in auditor_ref)

R1 capture script outside manifest; R3 golden 100 steps vs planned 10k; R4 weak collision proxy (independently holding); R5 splitmix32 export/name; R6 seed-0 special-case / sequential-seed first-draw collisions; R7 seed-0 CHANGELOG; R8 hardcoded worktree path; R10 fork unused in sim; R11 Date-like canonicalize; R12 dead branch; R13 dual FNV impl.

## How to re-run (certifier Execute / Chat)

```bash
git fetch origin
git worktree add /tmp/g0-cert origin/g0/greybox-b1-b3   # or checkout c813feb
cd .../anvil
pnpm install --frozen-lockfile
pnpm build
pnpm test
# vectors: games/iron-soul/fixtures/external-vectors.json + replay/golden.json
```

Evidence path on PR branch: `docs/evidence/g0-transcript.txt`.
Re-run capture helper: `docs/evidence/capture-g0-transcript.sh` (path hardcoded; R8).

## Hard rules for this certifier

- Do **not** author/patch product source.
- Verdict to `tasks/audits/<slug>-claude-cert.md` (or seat convention) + flip this handoff `status: done`.
- Never merge PR #5 (human-at-merge).
- Same-vendor Grok cert of this Grok build is **forbidden**.
