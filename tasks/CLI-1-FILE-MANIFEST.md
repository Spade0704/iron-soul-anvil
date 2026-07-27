# CLI-1 file manifest (Surgeon fence) — PRE-COMMITTED before build

Binding: `dir-20260727-anvil-cli-symlink-copy`.
Splits from: `dir-20260727-anvil-ci-trigger-parity-and-dispatch` (CI-1 closed).
Ruling: `rul-20260727-ci1-closes-cli-copydir-separate-atom`.

Per `rul-20260727-anvil-manifest-precommit`: this file is committed **before** the
diff it describes.

## In fence

- `anvil/packages/cli/src/**` (copyDir / packaging path)
- CLI tests under `anvil/packages/cli/src/**` (real symlink fixture)

## Design ruled (Director)

**DEREFERENCE** — follow symlinks; copy target contents into dist.
A build artifact must be self-contained. Preserve would ship relative links that
break silently outside the worktree.

**Price the ruling (acceptance leg):** measure dist size before/after in bytes.
If the cost is disproportionate, **STOP AND REPORT** — do not ship the ruling
against a contradicting number.

## Out of fence

- `.github/workflows/ci.yml` (CI-1 closed)
- Example asset symlink retarget (CI-1 fence-widened blob)
- Anything outside `anvil/packages/cli/src/**`

## Cert

- `builder_id`: `grok:anvil-dfdu` (byte-exact)
- `certifier_id`: `claude` / seat `d6id8o0h` (cross-model; never grok)
- Range base: **compute** `git merge-base origin/main <tip>` at handoff (equality)

## Acceptance index

A. Real symlink fixture regression test (no mocked Dirent)  
B. Rule 9: mutate copyDir back to isDirectory-only; prove mutation; test REDS  
C. CI green through steps 10, 11, 12, 13  
D. F4 on Linux once 12/13 run — state the answer  
E. Read the run log, not the badge  
