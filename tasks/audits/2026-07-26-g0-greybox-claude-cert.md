---
status: done
verdict: PASS
cert_class: cross-model-certified
certifier_id: claude
certifier_model: claude-fable-5
decorrelation: cross
date: 2026-07-26
slug: 2026-07-26-g0-greybox
handoff: 0-Inbox/grok-audit/cert-2026-07-26-g0-greybox-pending.md
range: 4a0884b..c813feb
pr: https://github.com/Spade0704/iron-soul-anvil/pull/5
risk_class: low
---

# Claude External Certifier verdict - Anvil G0 greybox (B1 + B3 + headless sim)

verdict: PASS

Cross-model certification of the Grok-built atom on range 4a0884b..c813feb
(PR #5, branch g0/greybox-b1-b3). builder_model grok != certifier_model claude;
certifier had zero involvement in the range (single commit c813feb, builder seat).

## Pre-gate

- scripts/validate_cert_handoff.py on the handoff: PASS, exit 0.
- Handoff fields conform to cert-handoff/v1.1; directive_ref
  dir-20260726-anvil-g0-workorder resolves; auditor_verdict PASS present
  (tasks/audits/2026-07-26-g0-greybox-auditor.md, main @ b657947).

## Floor own-run (EXECUTED, captured - not narrated)

Own detached git worktree at c813feb (certifier-created, isolated from the
builder and auditor checkouts). From anvil/:

- pnpm install --frozen-lockfile: exit 0 (pnpm 9.15.9, node v24.14.0, Windows).
- pnpm build: exit 0 (all workspace packages incl. games/iron-soul).
- pnpm test: exit 0. Counts match the handoff and auditor claims exactly:
  core 114 passed (17 files), iron-soul 15 passed (2 files),
  cli 52 passed + 2 todo, schema 17, authoring 9, genre-topdown2d 17,
  genre-fps2 7, genre-shmup 6, genre-net 6, genre-card 4, genre-vn 4,
  genre-arpg 4, net-colyseus 3.
- Full captured transcript retained in the certifier session scratchpad
  (g0-claude-cert-transcript.txt, 260 lines).

## Independent vector legs (certifier-authored implementations, not builder code)

All three match:

1. Cross-process sim hash: node src/crossProcessHash.mjs 42 100 in the
   certifier worktree -> ss1:be646bd7 == replay/golden.json ==
   fixtures/external-vectors.json.
2. mulberry32 seed-42 first 5 draws via an inline certifier-written
   implementation -> 0.6011037519201636, 0.44829055899754167,
   0.8524657934904099, 0.6697340414393693, 0.17481389874592423 == fixture.
3. FNV-1a 32-bit via an inline certifier-written implementation ->
   "" = 811c9dc5, "a" = e40c292c, "foobar" = bf9cf968 == fixture and
   shipped hashString.

## Cold diff read (25 files, +1085/-4)

- B1 SeededRng: mulberry32 kept; seed-0 aliasing fixed via dedicated scramble;
  stream(name) pure from rootSeed (call-order independent); fork() derives the
  child from current state then advances the parent one step. Additive only.
- B3 hashString: FNV-1a only in core; canonical serializer module-owned under
  games/iron-soul; fail-closed on NaN / non-finite / -0 / non-integer /
  undefined / Map / Set; sorted keys.
- Sim: integer milli-cell, id-order iteration, PREP/COMBAT/RESOLVE,
  deterministic; snapshot excludes engine dt.
- Workspace touches minimal and as declared (package.json one test-filter
  line, pnpm-workspace one line, lockfile one importer block).
- No forbidden-path hits; no cert/verdict files in the range; builder did not
  self-certify. Nothing concealed relative to the auditor's findings.

## Disclosed residuals (accepted as non-blocking, per Auditor R1-R13)

- R2 MEDIUM: manifest not pre-committed (same commit as fenced code) - G1
  process fix stands.
- R9 LOW: builder transcript header git_head 4a0884b captured pre-commit from
  a dirty worktree - not fabrication; certifier own-run at clean c813feb
  reproduces all counts, so the verdict rests on executed runs, not the
  builder transcript header.
- Remaining R1, R3-R8, R10-R13 and the no-CI/Linux-leg residual are carried
  to G1 as documented in the auditor file; none block this cert.

## Rules held

- Certifier authored no product source, merged nothing (PR #5 stays
  human-at-merge), edited no gates or validator.
- Same-vendor rule satisfied: Grok build, Claude cert.

DUAL PASS complete (Auditor PASS + this cross-model cert PASS). Close is the
Director's; merge is the human's.
