# CI-1 file manifest (Surgeon fence) — PRE-COMMITTED before build

Binding: `dir-20260727-anvil-ci-trigger-parity-and-dispatch`.
Per `rul-20260727-anvil-manifest-precommit`: this file is committed **before** the
diff it describes. It is a prediction the build can contradict.

## In fence (exactly one path)

- `.github/workflows/ci.yml`

### Required edits (and only these)

1. Add `games/**` to the `paths` list on **both** `push` and `pull_request`.
   Use `games/**` — not `games/iron-soul/**` (gravewake shares the blind spot).
2. Add `workflow_dispatch:` under `on:` so the workflow can be smoke-tested
   without a code push.

## Explicitly out of fence

- Any product source under `anvil/packages/**`, `anvil/examples/**`, `games/**`
  (except a later games/**-only *proof* commit for acceptance B, not this atom's fix)
- `package.json`, `pnpm-workspace.yaml`, lockfiles
- Test files
- `continue-on-error`, `|| true`, path-narrowing, or test skips to force green

## Range

- Base (literal): `f8566e8446e6b4e1e1b23bbd6f3c857376ded8ff`
- Head: filled at drop
- Builder: `grok:anvil-dfdu` (byte-exact)
- Certifier: `claude` / seat `d6id8o0h` (cross-model; never grok on this repo)

## Acceptance (run LOG, not badge)

A. `gh api repos/Spade0704/iron-soul-anvil/actions/runs --jq .total_count` > 0  
   (explicit repo; bare `gh run list` hits upstream 7etsuo/anvil)
B. A games/**-only commit demonstrably triggers a run
C. Read the run log: steps executed; `pnpm test` covers game packages
D. Establish whether F4 (gravewake file:// doubled drive letter) exists on Linux
E. First-run failures fixed honestly inside fence, or STOP AND REPORT
