# Iron Soul Arena — ARENA-1 module

Commanded arena autobattler greybox: multi-unit order-issuing sim on Anvil.
Scaffold shape: **`anvil new --genre none`** + purpose-built module (not arpg-starter).

## Scope

| Layer | Status |
|-------|--------|
| G0 greybox | headless PREP/COMBAT/RESOLVE, `ss1:` hash, golden `ss1:be646bd7` |
| ARENA-1 | `createStreams` on sim state, frozen labels, `getState()`, draw-count cliff assert, RNG-5 gate |

### Determinism surface (ARENA-1)

- **`createStreams(rootSeed)`** — frozen `Readonly<Record<StreamLabel, SeededRng>>` stored **on sim state**. Root is module-private and never escapes.
- **Frozen labels** (do not rename — golden is pinned to `sim`/`opponent`):
  `sim` · `opponent` · `shop` · `crit` · `bow-check` · `override`
- **Core** (only addition): `SeededRng.getState(): number` → `this.state >>> 0`. No setter/restore.
- **Bounds** — one comparison per run: no stream may exceed the mulberry32 canonicity cliff (`4_917_758` draws). Headroom is **UNCOMPUTED** (pending balance §13).
- **RNG-5** — freeze-set gate in **this module**, importing `STREAM_LABELS` (never a local copy).

Out of this atom: ReplayTape v2, mulberry32 mask, Imagine/assets.

## Commands

```bash
# from anvil/ monorepo root after pnpm install
pnpm --filter @games/iron-soul build
pnpm --filter @games/iron-soul test
pnpm --filter @games/iron-soul sim:regen-golden   # intentional sim change only
```

Golden: `replay/golden.json`. **Any change is an automatic fail** unless intentional + regen protocol.

## Engine deps

`@anvil/core` only: `SeededRng` (stream/fork/`getState`) + `hashString`.

## Binding

- Directive: `dir-20260727-anvil-arena-command-scaffold`
- Design: `anvil-arena-autobattler-design.md` v0.2 (§6.1.1 RNG-1..5, §12.4)
- Board: ARENA-1 (before G1-entry queue; does not reopen G0)
