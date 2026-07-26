# G0 file manifest (Surgeon fence)

Binding: `tasks/delta-force/2026-07-26-g0-greybox-pre-build.md` §4.
Any path outside this list in the G0 PR = mechanical revert.

## Engine (@anvil/core)

- `anvil/packages/core/src/kernel/SeededRng.ts` — additive only (stream/fork; seed-0 alias fix)
- `anvil/packages/core/src/kernel/SeededRng.test.ts` — new
- `anvil/packages/core/src/hash/hashString.ts` — new
- `anvil/packages/core/src/hash/hashString.test.ts` — new
- `anvil/packages/core/src/index.ts` — export lines only

## Workspace (one entry)

- `anvil/pnpm-workspace.yaml` — add `../games/iron-soul`
- `anvil/pnpm-lock.yaml` — only as required by that workspace entry
- `anvil/package.json` — add iron-soul to `test` filter only

## Module (games/iron-soul)

- `games/iron-soul/package.json`
- `games/iron-soul/tsconfig.json`
- `games/iron-soul/vitest.config.ts`
- `games/iron-soul/src/sim.ts`
- `games/iron-soul/src/serialize.ts`
- `games/iron-soul/src/hash.ts`
- `games/iron-soul/src/index.ts`
- `games/iron-soul/src/sim.test.ts`
- `games/iron-soul/src/serialize.test.ts`
- `games/iron-soul/src/crossProcessHash.mjs`
- `games/iron-soul/replay/golden.json`
- `games/iron-soul/fixtures/external-vectors.json`
- `games/iron-soul/scripts/regen-golden.mjs`
- `games/iron-soul/README.md`
- `games/iron-soul/public/assets/style/IRON_SOUL_STYLE.md` — pre-existing on main (untouched)

## Evidence / coordination (handoff phase)

- `docs/evidence/g0-transcript.txt`
- `tasks/orchestrator-log.jsonl` — flat directive row only
- `0-Inbox/grok-audit/*` — cert handoff only (not source)

## Forbidden (do not touch)

- `anvil/packages/cli/**`
- `anvil/packages/genre-*/**`
- NavGrid / pathfind
- ReplayRecorder source
- `games/gravewake/**`
- net / render packages
- CI workflows
- tsconfig/eslint (except module-local)
- `--strict-assets` paths
