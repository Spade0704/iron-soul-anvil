# Session handover — iron-soul-anvil PM seat — 2026-07-29

Seat: `[ROLE:project-manager][REPO:iron-soul-anvil]` per EMCC `framework/09` §4.2.
Covers 2026-07-28 through 2026-07-29 EOD. Repo state: `main` at or after **`032e428`** (the merge of
this document's first revision), clean, in sync with `origin/main`. Zero atoms built this session —
it was a coordination, verification and correction session.

## Read first

1. `AGENTS.md` — this repo has **no CLAUDE.md**; AGENTS.md is the dispatcher and carries no role
   content. The PM role is derived from framework/09 §4.2 (consumer project) + §5.1 (no self-code).
2. Container `D:\Projects\IronSoul-Anvil\tasks\todo.md` — the live board. **Untracked**, disk-only,
   does not exist in a fresh clone.
3. Container `D:\Projects\IronSoul-Anvil\tasks\sessions.md` — the durable narrative record.
4. `tasks/orchestrator-log.jsonl` (tracked, in-repo) — binding rulings with history and blame. Seats
   correctly grep the repo, so anything binding must live here, not on the untracked board.

## What shipped

- **PR #10 merged** (squash `00e6dda`) on Operator instruction. **It was a NO-OP** — zero files
  changed. PR #9 (`957e6ba`) had landed the identical bytes on 2026-07-27 22:44:43 +0400. See
  "Corrections" below; this is the session's main lesson, not an accomplishment.
- Branch `docs/module-trust-posture` deleted, local and remote.
- CRW peer-identity census answered in full (this seat = peer id `v6u2ccqi`).
- P0b validator re-run completed and answered — **no remediation owed**.
- `.gitattributes` atom filed with the Director and prioritised; routing held.
- Container audit log repaired (four-day-old UTF-8 BOM) and `tasks/validate-log.py` added.

## Locked decisions — DO NOT re-litigate

- **P0b is DISCHARGED.** `rul-20260727-p0b-discharged-stale-open` stands. Attempt 1 fails today for
  a *better* reason than when it was written: `mechanical-pass-human-aesthetic` is for ASSET-only
  changes with a named human attester, and P0b's range (`8254a1b..997d896`) is twelve files of
  TypeScript whose only PNG is a test fixture. **P0b is the build that implements that class's own
  mechanical leg** — it was classed under the standard it implements. Attempt 2
  (`cross-model-certified`) passes clean on the current validator. Attempt 1 stays **UNEDITED** —
  handoffs are immutable, supersede-only, and it is the repo's second deliberately-retained failing
  artifact (alongside ARENA-1 attempt 1).
- **The Layer-2 disclosure requirement is SATISFIED. Do not seek a doc amendment.** `MODULE_TRUST_
  POSTURE.md` is on main; PR #9's commit body carries the Layer-2-absent statement with file:line,
  permanently and `git log --grep`-able. The doc itself reads future-tense section by section. An
  amendment to a CISO-ratified doc requested on a false premise is worse than the gap.
- **Layer 2 does not exist** (verified against source, unaffected by any of the above):
  `resolveContainedModule` / `ModuleContainmentError` appear nowhere in code — the only three hits in
  the tree are inside the doc describing them. `anvil/packages/cli/src/loadModules.ts:30-33` admits
  `../` in its branch condition, `path.resolve`s it and `import()`s the result with no realpath and
  no containment check. Modules are agent-generated, so that path runs machine-generated code.
  **SEC-1 is unstarted; Guard-House owns Aegis.**
- **Builder seats get their own worktree, not turn-taking.** `git worktree add` off `origin/main` at
  directive time, named for the atom. Turn-taking is a promise, and the failure mode (a checkout
  relocating another seat's HEAD) is silent on the losing side.
- **`-text` over `eol=lf`** for byte-pinned artifacts: such a file should declare itself *not text*,
  not declare a preferred conversion.
- **Cert lane** (`rul-20260727-anvil-cert-lane-binding`): `d6id8o0h` PRIMARY, `dvxhksay` FALLBACK,
  never `certifier_id: grok` on this repo — seat-independence grounds.
- **`slp4frjk` is legitimate** and routable: Grok 4.5, host `grok.exe` 24176, `builder_id`
  `grok:anvil-dfdu` byte-exact, idle, no write lane. Route via directive only.

## In flight / next, most actionable first

1. **Owed by Director, not by this seat:** `draft-20260727-anvil-replaytape-v2` builder + certifier
   assignment. It is deliberately `directive_draft`, not `directive_assignment`, so no handoff can
   resolve against it. **DO NOT self-start it.**
2. **`.gitattributes` atom** — filed, prioritised, routing HELD one Operator beat (Operator focus is
   CRW). Intended as the first routing to `slp4frjk` under the worktree convention. Three lines,
   declarative, no test surface.
3. ~~`claude/iron-soul-scaffold` deletion~~ **DONE 2026-07-29** — Operator-authorised, deleted local
   and remote, recovery sha `6cacd02e9563878126ca6229589ba4b63755a9f5` recorded BEFORE the delete
   (reachable until gc). **Convention going forward, Director's standing request: record the tip sha
   before every branch-delete in this repo** — reversible-for-now is a different risk class from
   irreversible, and that one line is the whole difference.
4. **Held on blocking entry conditions, DO NOT START:** the copyDir depth-cap (cycle guard) and the
   manifest-driven-copy atom.
5. **Expected, pre-recorded, NOT a defect:** EMCC.Library will ship `$id` + `version` into the
   vendored `visual-evidence.schema.json`. That rewrites the bytes, so
   `visual-evidence.pin.test.ts` **WILL GO RED ONCE, BY DESIGN**, presenting as "hash changed,
   version string unchanged (still v0.1)" — the exact signature a naive reading calls tampering.
   Re-vendor and re-stamp from the Librarian's value. **Never edit the pin to match a local file.**

## How to operate

- **`git fetch` before ANY `origin/..` comparison.** `origin/main` is a local cache, not the remote.
  `git branch -r` is the same cache — a deleted remote branch keeps showing until `--prune`.
- **Judge supersession by TREE.** Ancestry lies, branch names lie, and after a squash the sha lies
  too. `git rev-parse <sha>^{tree}` settles it in one command.
- **MATCH THE INSTRUMENT TO THE GRANULARITY OF THE CLAIM.** "Nothing unique on this branch" is a
  CONTENT claim; `comm -13` over `git ls-tree` answers a PATH question and is blind by construction
  to a file present on both sides with different content. For any branch-delete: diff from the
  merge-base, then compare blob OIDs per path. Same rule as judge-by-tree, one granularity down.
- **A phrase grep can fail because the sentence WRAPS.** Flatten before concluding a clause is
  missing: `git show <ref>:<path> | tr '\n' ' ' | tr -s ' '`. Line-oriented instruments fail
  line-shaped.
- **When the claim is about what an artifact SAYS, open the artifact.** `git log -1 --format=%B
  <sha>` before asserting what a commit contains.
- **Publish the command with the claim** — a conclusion alone can only be agreed with; a conclusion
  plus its command can be falsified.
- **Track builds via the REPO** (worktree / branch / commits), never via bus summaries. Peer state
  has flaked on this lane before.
- Flat-log the authorizing directive row in this repo's `tasks/orchestrator-log.jsonl` BEFORE any
  pending cert drop — `validate_cert_handoff` resolves `directive_ref` against the handoff repo's own
  log. `directive_ref` is a PATH on a directive and an ID on a handoff; a bare path fails silently
  AFTER the build.
- File manifests are PRE-COMMITTED as their own commit, never in the same commit as the diff.
- Bookkeeping pushes are branch + PR + human-at-merge (`ruling-20260726-pr-required-binds-
  bookkeeping`). Coordination-plane paths are exempt.

## Gotchas the next room would otherwise rediscover

- **`anvil-arena1-tip-wt/` and `anvil-cli1-wt/` ARE NOT WORKTREES.** No `.git` of any kind,
  unregistered, ~1.3G of orphaned source that reads as a worktree by name only. Never build in them,
  never count them as independent copies. Disposal is an Operator call.
- **This PM seat and the Grok builder seat share ONE checkout** until the worktree convention is
  applied. Announce before any branch operation in that tree.
- **Bare `gh` in this clone resolves to upstream `7etsuo/anvil`** (two remotes, no default set) and
  returns stale failed runs that look exactly like working CI. Always
  `--repo Spade0704/iron-soul-anvil`.
- **The vendored schema pin is ONE-DIRECTIONAL** — green proves only "nobody edited our copy", never
  "current with canon". Library asserts its own hash nowhere. Their guard false-GREENS on line-ending
  drift where ours false-REDS; the pair looks like coverage while the shipping side holds the silent
  half. Neither repo has `.gitattributes`.
- **`tasks/validate-log.py` is a TOOL, not a GATE.** Nothing invokes it, and it covers the untracked
  container log only. Never cite it as coverage.
- **F4 is retired on LINUX ONLY** — it is a Windows-only defect. Do not read the retirement as
  global.
- Named residuals still open: ARENA-1 F1 (`games/iron-soul/src/streams.ts:79` comment
  over-generalised — correct statement is "trips AT OR BEFORE the first loss of canonicity, never
  after"), ARENA-1 F2 (`cliffChecked` latches per sim INSTANCE, not per `run()`; re-test trigger is a
  change in CALL PATTERNS, not the cliff margin), `sfx/blip.ogg` does not exist (correct copy set is
  EMPTY), copyDir has no cycle guard (fix is a DEPTH CAP, not a visited-set).

## Corrections this session — read these before trusting a confident report

This session's largest finding was against itself, twice.

1. **PR #10 was a no-op built on a false premise.** This seat never ran `git fetch`, so
   `git log origin/main..HEAD` compared against a stale `origin/main` (`72e3c35`) while the real
   remote had advanced. `tree 7aec89c == tree 957e6ba == e7d8c446`, authored 22:41:32 and
   squash-committed 22:44:43 — **the local commit IS the one that became #9.** One piece of work
   renamed by the squash, not two. The board already carried the lesson, written by this seat two
   days earlier. Reading a lesson is not running it.
2. **The residual filed off that correction was ALSO false** — the disclosure this seat escalated as
   missing was already in #9's commit body. It had been inferred from where the disclosure had been
   *put*, instead of read with `git show`.

Both collapse to one move: **a read of the artifact replaced by an inference about it.** And the
sharper rule, because the second error rode in on the credibility of the first: **a self-correction
carries unverified premises — verify what you assert inside a correction at the same depth as what
you are correcting.**

Six further instrument findings this session, every one caught by re-running a claim rather than
reading it, three of them self-inflicted: an absent Layer-2 control reading as ratified; a prose
`v0.1` reading as machine-readable metadata; a directory name reading as a worktree; "three
checkouts" reading as triangulation; a byte-pin holding by installer default; an audit log validated
only at its tail for four days. Two false measurements landed inside one hour, **both numerically
equal to the line count** (PowerShell `>` re-encoding, and `grep -c $'\r'` collapsing to an empty
pattern). Line-oriented instruments fail line-shaped — when a suspicious number equals the line
count, suspect the instrument before the artifact.

The set is not "docs go stale". It is **a name, a green light, or a narrowed instrument standing in
for a verification nobody runs.**

## RESUME-PROMPT

Resuming the iron-soul-anvil PM seat. Read first: `AGENTS.md` (this repo has NO CLAUDE.md — role
comes from EMCC `framework/09` §4.2, consumer project = project-manager, §5.1 no-self-code), then the
untracked container board at `D:\Projects\IronSoul-Anvil\tasks\todo.md` and `sessions.md`, then the
tracked `tasks/orchestrator-log.jsonl` for binding rulings. Publish `[ROLE:project-manager]
[REPO:iron-soul-anvil]` via `set_summary`.

State: `main` at or after `032e428`, clean, in sync. Nothing in flight — the only thing that may
still be open when you read this is this document's own PR. You are idle and awaiting a
`directive_assignment` from director:EMCC.

Locked, do not reopen: P0b is discharged (attempt 1 was a category error — it was classed under the
very standard it implements; attempt 2 passes clean; attempt 1 stays unedited). The Layer-2
disclosure requirement is satisfied by PR #9's commit body — do not seek a doc amendment. Layer 2
itself does not exist in code and SEC-1 is unstarted under Guard-House. Builder seats get their own
per-atom worktree, never turn-taking. `-text` over `eol=lf` for byte-pinned files. Cert lane:
`d6id8o0h` primary, never `certifier_id: grok`.

Next, in order: replaytape-v2 assignment is the DIRECTOR'S to make — it is `directive_draft` on
purpose, do not self-start. The `.gitattributes` atom is filed and prioritised, routing held behind
CRW. `claude/iron-soul-scaffold` is DELETED (2026-07-29, recovery sha `6cacd02`). The depth-cap and
manifest-driven-copy atoms are held on blocking entry conditions.

Operate like this: `git fetch` before any `origin/..` comparison; judge supersession by TREE
(`git rev-parse <sha>^{tree}`) because ancestry, names and post-squash shas all lie; when the claim
is about what an artifact says, open the artifact; publish the command alongside the claim; track
builds via the repo, never via bus summaries; always pass `--repo Spade0704/iron-soul-anvil` to `gh`.

Gotchas: `anvil-arena1-tip-wt/` and `anvil-cli1-wt/` are NOT worktrees (no `.git`, orphaned, ~1.3G) —
never build in them. This seat shares one checkout with the Grok builder seat `slp4frjk` until the
worktree convention is applied — announce before any branch op. The vendored
`visual-evidence.schema.json` pin is one-directional and WILL go red once, by design, when
EMCC.Library ships `$id`+`version` — re-vendor from the Librarian's value, never edit the pin to
match. `tasks/validate-log.py` is a tool, never coverage.
