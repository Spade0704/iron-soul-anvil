# Evidence — SEC-1 module-containment Layer 2

**Atom:** SEC-1  
**Wave:** WAVE-B  
**Repo:** iron-soul-anvil  
**Date:** 2026-08-01  

## PREM-1 reproduce

Naive `path.resolve(root, "../outside")` yields a path whose `path.relative(root, ...)` starts with `..` (test: PREM-1 in `loadModules.containment.test.ts`).

## Product

- `anvil/packages/cli/src/loadModules.ts` — `ModuleContainmentError`, `resolveContainedModule`, wire before import
- `anvil/packages/cli/src/loadModules.containment.test.ts` — 6 tests
- `games/iron-soul/docs/MODULE_TRUST_POSTURE.md` — Layer 2 implemented

## Executes-clean

```
cd anvil/packages/cli && pnpm test
# 7 files, 62 passed | 2 todo
pnpm run build  # tsc OK
```

## Falsifier

Without `resolveContainedModule`, the relative branch used raw `path.resolve` (escape). Guard unit tests prove escape throws; PREM-1 proves naive resolve escapes.

## DF / CISO

- CISO unlock: Operator 2026-08-01
- Delta Force: EMCC `tasks/delta-force/2026-08-01-wave-b-sec1-module-containment.md` PROCEED-WITH-CHANGES
