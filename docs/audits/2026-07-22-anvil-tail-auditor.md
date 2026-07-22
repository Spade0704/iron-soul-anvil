# audit_result — Anvil M10/M11 tail (Regime B) — VERDICT: concerns (proceed)

- Target: `6b53a3b` · Directive `dir-20260722-anvil-m10-m11-tail` (builder ≠ director ≠ auditor
  verified). Independent persona; read-only; own scratch smoke.
- ALL five breakdown rows + both routed warning fixes Met, independently re-run: T-M10-011
  compile gate is genuinely NEW (parent had compileProject only in describe/capabilities) and
  REAL (core never reads game.spec.yaml, so the positive-probe test fails without the gate;
  own smoke: broken spec → validate exit 1 INTENT_INVALID, test refuses); v1 skip = S-AUTHORING
  §2-required; core isolation intact. Root suite now runs authoring 9 + arpg 4 + cli 13/13;
  ci.yml inherits with zero edits. critMult 0.35→1.35 disposition SOUND (schema min(1),
  runtime base*critMult + clamp, siblings multiplier-form; no reference pinned 0.35). Lockfile
  tarball restore byte-identical to the 2172841 form at all 3 sites, zero other churn; hint
  string fixed. pnpm test/lint/check ALL exit 0 (re-run by the Auditor); evidence file matches
  test-for-test. Scope: 14 files, all enumerated. Builder disclosures (stale doc-14 rows
  reconciled in-scope; P01–P03 residual drift left + disclosed; dev-smoke timeout annotated)
  all judged honest.
- **W1 (warning — FIXED on top, same session):** doc 18 attributed the aggregate compile-gate
  coverage to `pnpm test`; it runs under `pnpm check`. One-line correction applied.
- Info: doc-14 P01–P03 v1-starter drift queued (pre-existing, disclosed); authoringCompileGate
  treats a non-numeric schemaVersion as v2 (MIGRATION_REQUIRED rather than skip — backlog
  note); Grok cert slot to be opened at this close (DUAL PASS pends the poll).
