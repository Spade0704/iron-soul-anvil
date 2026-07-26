# Iron Soul — G0 greybox

Headless autobattler greybox for the Anvil/Grok pilot (pass 2).

## Scope (G0)

- Module-owned integer/milli-cell sim (`src/sim.ts`)
- Canonical serializer that throws on float/NaN/Map/Set (`src/serialize.ts`)
- Replay-hash via `ss1:` + core `hashString` (`src/hash.ts`)
- Engine deps only: `@anvil/core` `SeededRng` (stream/fork) + `hashString`

No art, no UiKit, no Imagine.

## Commands

```bash
# from anvil/ monorepo root after pnpm install
pnpm --filter @games/iron-soul build
pnpm --filter @games/iron-soul test
pnpm --filter @games/iron-soul sim:regen-golden   # intentional sim change only
```

Golden: `replay/golden.json`. Update protocol: regen script + PR note of intentional change.

## Binding plan

`tasks/delta-force/2026-07-26-g0-greybox-pre-build.md` (PASS as amended).
