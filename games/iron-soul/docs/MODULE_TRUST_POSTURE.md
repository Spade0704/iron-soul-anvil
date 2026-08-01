# Module Trust Posture — games/iron-soul

**Status:** procedure IN FORCE now (docs). The engine guard is authored as the FIRST gated build
when the toolchain lands (Node 22 + pnpm). Source of record: the Delta Force verdict
`project_iron_soul/tasks/delta-force/2026-07-16-anvil-h1-module-trust-posture.md`
(CISO Aegis H1, 2026-07-16).

## The threat

Anvil's loader (`anvil/packages/cli/src/loadModules.ts`) `import()`s relative module IDs from
`game.yaml` with no containment check and no sandbox — `../` escapes the game root, and imported
top-level code runs with full fs/net/child_process authority. Our modules are **agent-generated**
(Grok Build), so the engine routinely executes machine-generated code.

**Honest framing: containment ≠ trust.** A path guard stops *misconfiguration* (a stray `../`).
It does NOT stop a malicious payload that sits legitimately in-root or arrives via a transitive
import. The real malice control is the pipeline + human review below.

## Layer 1 — authoring discipline (IN FORCE NOW)

- Module IDs in `game.yaml` MUST be **bare slugs**: `^[a-z0-9_-]+(/[a-z0-9_-]+)*$`. No `..`, no
  absolute paths, no drive-relative (`C:foo`), no UNC (`\\host`), no `file.js:stream` (ADS), no
  bare npm specifiers. If it isn't a plain relative slug under `games/iron-soul/`, it's rejected.
- Every module file lives under `games/iron-soul/` and enters via a **reviewed DRAFT PR**.
- **Review owner = the Regime-B Auditor, not the builder** (independence per framework/22). The
  review reads the module AND its imports (transitive-import ACE hides deps-deep).
- Dependencies pinned; no unpinned/floating installs feed a module.
- Nothing runs `pnpm play` on an unreviewed working tree.

## Layer 2 — engine containment guard (IMPLEMENTED — SEC-1 / WAVE-B)

**Status:** IN FORCE in loader (2026-08-01 SEC-1 dual-PASS path). Symbols:

- `ModuleContainmentError` — `anvil/packages/cli/src/loadModules.ts`
- `resolveContainedModule(root, id)` — same file
- Wire: relative module branch (`./` / `../`) calls the guard **before** `import()`
- Tests: `anvil/packages/cli/src/loadModules.containment.test.ts`

Helper: form-reject absolute/drive/UNC/NUL → `realpath(root)` + resolve id → `realpath` when
present → reject if `path.relative(root, abs)` starts with `..` or is absolute → throw
`ModuleContainmentError` (id/abs/root). Guard completes BEFORE the import expression.

Upstream contribution to 7etsuo/anvil remains a follow-up (generic hardening).

## Layer 3 — sandbox realm (DEFERRED)

A no-fs/no-net execution realm is deferred until modules arrive from OUTSIDE our pipeline
(marketplace / third-party mods). At that point provenance signing + a module manifest/hash
allowlist land with it. Not built now — half a sandbox buys false confidence.

## First test (lands with Layer 2)

`games/evil/game.yaml` listing (i) `../outside/payload`, (ii) a junction inside root → a
sentinel-writing module outside root, (iii) a bare npm specifier: all three throw
`ModuleContainmentError`, the sentinel side-effect file never appears; a bare in-root slug loads.

## gh standing rule

Always `gh pr ... --repo Spade0704/iron-soul-anvil` — gh defaults to the upstream parent
(7etsuo/anvil). Never trust the default target on fork work.
