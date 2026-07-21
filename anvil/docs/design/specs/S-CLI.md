# Spec: CLI (`@anvil/cli`)

**Milestones:** M1–M11

**Agent-computer interface:** [`../05_AGENT_COMPUTER_INTERFACE.md`](../05_AGENT_COMPUTER_INTERFACE.md)

## 1. Authority

`pnpm anvil --help` is the authoritative command inventory for the current
build. Run from `anvil/`, or invoke `node packages/cli/dist/index.js` directly.
The CLI uses the command path or `--root` as the game root depending on the
command.

## 2. Implemented commands

| Command | Main arguments | Purpose |
|---------|----------------|---------|
| `version` | — | Print runtime version |
| `new <name>` | `--genre`, `--root` | Scaffold a schema-v1 project |
| `validate [path]` | `--json` | Validate manifest/content/assets using the core validator |
| `test [path]` | `--json`, `--seed`, `--strict-assets` | Run scenario tests headlessly |
| `observe` | `--root`, `--json`, `--shot` | Emit structured state and optional PNG |
| `dev [path]` | `--port` | Start the Vite development server |
| `build [path]` | `--out` | Emit a static web build |
| `migrate [path]` | `--write`, `--json` | Preview (default) or apply the v1→v2 migration |
| `describe [path]` | `--json` | Compile and summarize manifest, intent, hash, content, capabilities |
| `capabilities [path]` | `--json` | Report the capability descriptors selected for the project |
| `assets missing [path]` | `--json` | List missing required assets |
| `audio list` | `--kind`, `--prefix`, `--query`, `--limit`, `--json` | Search bundled audio |
| `sprites list` | `--prefix`, `--query`, `--limit`, `--json` | Search bundled sprites |
| `content list [path]` | `--json` | List project content files |
| `recipe list` | — | List recipe ids |
| `recipe show <id>` | — | Print a recipe |
| `tools` | `--json` | Print the agent tool catalog |
| `doctor [path]` | `--json` | Run validate plus test |
| `net health` | `--url` | Query an Anvil net server health endpoint |

Unknown commands and invalid arguments return nonzero status. Structured modes
should be preferred by agents.

## 3. Scaffold genres

`new --genre` currently accepts:

```text
none card topdown2d vn shmup fps2
```

It emits `schemaVersion: 1` and copies the matching v1 template. `arpg` is
recognized by the schema package but not by the CLI scaffold command.

## 4. Planned, not implemented

| Planned command/change | Intended behavior | Tracking |
|------------------------|-------------------|----------|
| schema-v2 default scaffolds | Create intent contract with every project | M10 |
| `new --genre arpg` | Create a generic declarative ARPG starter | M11 |
| generic `genre-arpg` loader | Import `@anvil/genre-arpg` for a manifest module id | M11 |

`migrate`, `describe`, and `capabilities` landed with T-M10-008 (thin
projections over `migrateProject` and `compileProject` from
`@anvil/authoring`). `describe` and `capabilities` require a schema-v2
project; on a v1 project they exit 1 with the structured `MIGRATION_REQUIRED`
diagnostic pointing at `anvil migrate`.

## 5. Path safety

- Input and output paths must resolve inside the applicable game/build root.
- Project-relative module and asset paths may not escape their root.
- Recipes may only describe files under a game root.
- Writes outside the allowed root fail with a structured I/O/argument error.

## 6. Verification

CLI behavior is covered by `packages/cli/src/*.test.ts`. The current checkout
has two deliberately visible integration failures for the pending M10/M11
surfaces: schema-v2 scaffold output (T-M10-009) and ARPG scaffold support
(T-M11-007). The migration/description/capabilities surface (T-M10-008) is
implemented and covered.
