# ARENA-1 file manifest (Surgeon fence)

Binding: `dir-20260727-anvil-arena-command-scaffold`.
Any path outside this list in the ARENA-1 PR = mechanical defect.

## Engine (@anvil/core) — single getter only

- `anvil/packages/core/src/kernel/SeededRng.ts` — `getState(): number { return this.state >>> 0 }` only
- `anvil/packages/core/src/kernel/SeededRng.test.ts` — getState + state canary

## Module (games/iron-soul)

- `games/iron-soul/src/streams.ts` — STREAM_LABELS, createStreams, cliff assert, sorted stream-state pairs
- `games/iron-soul/src/streams.test.ts` — RNG-5 gate (imports STREAM_LABELS), bounds fire, createStreams
- `games/iron-soul/src/sim.ts` — streams on sim state; sim/opponent adopted as shipped
- `games/iron-soul/src/sim.test.ts` — streams-on-state keys assertion
- `games/iron-soul/src/index.ts` — export streams surface
- `games/iron-soul/package.json` — description
- `games/iron-soul/README.md` — ARENA-1 scope
- `games/iron-soul/game.yaml` — `anvil new --genre none` scaffold (personalized)
- `games/iron-soul/game.spec.yaml` — schema-v2 intent from scaffold migrate
- `games/iron-soul/tests/smoke.json` — scaffold smoke
- `games/iron-soul/content/` · `games/iron-soul/assets/` — scaffold dirs

## Evidence / coordination

- `docs/evidence/arena-1-transcript.txt` — real captured build+test transcript
- `tasks/ARENA-1-FILE-MANIFEST.md` — this file
- Cert handoff on **main** only (outside certified range); `directive_ref` = id not bare path

## Forbidden

- Rename any stream label
- `.stream()` in per-tick / per-round / per-check paths
- `fork()` of the root
- Numeric headroom figure
- Sweep mode
- `validate_cert_handoff` or any gate
- ReplayTape v2 / mulberry32 mask / Imagine assets
- Any core change beyond `getState`
- `games/iron-soul/replay/golden.json` — must remain `ss1:be646bd7`
