# ARENA-1 file manifest (Surgeon fence)

Binding: `dir-20260727-anvil-arena-command-scaffold`.
Any path outside this list in the ARENA-1 PR = mechanical defect.

## Engine (@anvil/core) — two read-only methods only

Director amended the single-getter fence for the bounds fix (getState mask vs draw count).

- `anvil/packages/core/src/kernel/SeededRng.ts`
  - `getState(): number { return this.state >>> 0 }`
  - `isStateExact(): boolean { return Number.isSafeInteger(this.state) }`
  - No setter, no restore, nothing else
- `anvil/packages/core/src/kernel/SeededRng.test.ts` — getState canary + isStateExact cliff

## Module (games/iron-soul)

- `games/iron-soul/src/streams.ts` — STREAM_LABELS, createStreams (plain SeededRng, no Proxy),
  assertStreamsWithinCliff via `isStateExact()`, sorted stream-state pairs
- `games/iron-soul/src/streams.test.ts` — RNG-5 gate (imports STREAM_LABELS), bounds fire (honest full-length run), createStreams
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
- **Certified range** (re-declared): `a7f8c0e..<head>` — NOT `eed1961..<head>`
  (directive commit is coordination and must sit outside the certified range)

## Forbidden

- Rename any stream label
- `.stream()` in per-tick / per-round / per-check paths
- `fork()` of the root
- Numeric headroom figure
- Sweep mode
- Per-draw Proxy / WeakMap counter on the draw path
- `validate_cert_handoff` or any gate
- ReplayTape v2 / mulberry32 mask / Imagine assets
- Any core change beyond `getState` + `isStateExact`
- `games/iron-soul/replay/golden.json` — must remain `ss1:be646bd7`
