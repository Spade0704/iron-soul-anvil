// visual-evidence.ts — Visual-Evidence Standard v0.1 mechanical checker.
//
// Additive, pure module consumed by `anvil test --strict-assets` (wired at
// index.ts, behind the flag — nothing here runs when the flag is off).
//
// Design invariants (from the Delta Force gate 2026-07-24):
//  - FAIL-CLOSED everywhere: a missing file, a truncated header, an unexpected
//    format, or any caught exception yields an explicit FAIL or N/A(reason) —
//    NEVER a silent green.
//  - No pixel-decode dependency in v0.1: format/dimensions come from the PNG
//    magic bytes + a hand-rolled IHDR parse. Palette (check 4) is
//    declaration-level only; per-pixel verification is deferred (see the
//    test.todo stubs in visual-evidence.checks.test.ts).
//  - The schema of record lives in EMCC Library Codex §9. This package VENDORS
//    it SHA-pinned (schemas/visual-evidence.schema.json) and authors none.
//  - The rendered report is TWO legs: a MECHANICAL leg (checks 1-5 + the
//    mechanical presence-half of check 6) and a separate human AESTHETIC leg
//    that NEVER renders as "PASS". The string "certified" never appears.
//
// `fresh-gen` (below): the literal sentinel a sidecar carries in `base_asset_ref`
// to declare a from-scratch generation with NO base asset — as opposed to a
// derived asset, which instead carries an object { path, sha256 } naming its base.

import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

// ── Verdict taxonomy + exit contract ────────────────────────────────────────
// PASS       — check verified and satisfied.
// FAIL       — check verified and violated (drives exit != 0).
// N/A        — check not applicable to this asset, with a printed reason
//              (e.g. dimension parse on a non-PNG). NOT a failure.
// WARN       — a limitation was hit but nothing is violated (e.g. an
//              unresolved style-bible ref). NOT a failure.
// UNCOVERED  — the asset carries no sidecar at all. Printed, never silent.
//              v0.1 may exit 0 on UNCOVERED.
export type Verdict = "PASS" | "FAIL" | "N/A" | "WARN" | "UNCOVERED";

export interface CheckResult {
  /** Stable check id, e.g. "1-sha256". */
  check: string;
  verdict: Verdict;
  /** Human-readable, always populated. */
  reason: string;
  expected?: string;
  actual?: string;
  /** The specific offending value, when one can be named. */
  offending?: string;
}

export interface Dimensions {
  width: number;
  height: number;
}

export interface StyleBibleRef {
  path: string;
  commit_sha: string;
}

export interface StyleTokens {
  palette?: unknown;
  grid?: string;
  resolution_class?: string;
}

export interface BaseAssetRefObject {
  ast_id?: string | null;
  path?: string;
  sha256?: string;
}

export interface AestheticSignoff {
  name?: string;
  date?: string;
  verdict?: string;
  note?: string;
  reviewed_at_resolution?: string;
  reviewed_on_surface?: string;
}

/** The vendored §9 sidecar shape (fields the checks read; extra fields ignored). */
export interface Sidecar {
  asset_path?: string;
  sha256?: string;
  format?: string;
  dimensions?: Dimensions;
  base_asset_ref?: string | BaseAssetRefObject;
  prompt?: string;
  seed?: string | number;
  model_id?: string;
  style_bible_ref?: StyleBibleRef;
  style_tokens_declared?: StyleTokens;
  generated_at?: string;
  generator?: string;
  aesthetic_signoff?: AestheticSignoff;
}

export interface EvidenceContext {
  /**
   * Text corpus searched by the path-binding check (check 3): source files,
   * asset manifests, etc. Each entry is { file, text }.
   */
  sources?: Array<{ file: string; text: string }>;
  /**
   * Explicit escape hatch for constructed-path / glob-loaded assets that no
   * literal source reference will ever match. Basenames listed here pass
   * check 3 as N/A(allowlisted) rather than FAIL.
   */
  allowlist?: string[];
  /**
   * Resolves a style-bible ref to its NAMED palette (array of hex strings), or
   * null when the ref cannot be resolved. Injected so the check stays pure.
   */
  resolveStyleBiblePalette?: (ref: StyleBibleRef) => string[] | null;
}

// ── check 1 — sha256 over raw bytes on disk ─────────────────────────────────
// Hashes the RAW bytes (no newline translation — the git autocrlf trap) and
// compares to the sidecar's declared sha256. Missing asset = FAIL, not a throw.
export function checkSha256(sidecar: Sidecar, assetPath: string): CheckResult {
  const check = "1-sha256";
  const declared = (sidecar.sha256 ?? "").trim().toLowerCase();
  if (!declared) {
    return { check, verdict: "FAIL", reason: "sidecar declares no sha256", expected: "<64-hex>", actual: "" };
  }
  let bytes: Buffer;
  try {
    bytes = fs.readFileSync(assetPath);
  } catch {
    return {
      check,
      verdict: "FAIL",
      reason: "asset file missing or unreadable",
      expected: declared,
      actual: "<no-file>",
      offending: assetPath,
    };
  }
  const actual = createHash("sha256").update(bytes).digest("hex");
  if (actual === declared) {
    return { check, verdict: "PASS", reason: "on-disk sha256 matches sidecar", expected: declared, actual };
  }
  return {
    check,
    verdict: "FAIL",
    reason: "on-disk sha256 does not match sidecar",
    expected: declared,
    actual,
    offending: assetPath,
  };
}

// ── check 2 — format (magic bytes) + PNG IHDR dimensions + derived res-class ─
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

/** Detect container by magic bytes. Returns a lowercase token or "unknown". */
function detectFormat(bytes: Buffer): string {
  if (bytes.length >= 8 && bytes.subarray(0, 8).equals(PNG_SIGNATURE)) return "png";
  if (bytes.length >= 12 && bytes.subarray(0, 4).toString("ascii") === "RIFF" && bytes.subarray(8, 12).toString("ascii") === "WEBP") {
    return "webp";
  }
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpeg";
  if (bytes.length >= 5 && bytes.subarray(0, 5).toString("ascii") === "<?xml") return "svg";
  if (bytes.length >= 4 && bytes.subarray(0, 4).toString("ascii").toLowerCase() === "<svg") return "svg";
  return "unknown";
}

/** Parse PNG IHDR width/height. Returns null if the header is truncated/absent. */
function parsePngDimensions(bytes: Buffer): Dimensions | null {
  // 8-byte signature, then a length(4)+type(4) chunk header, then IHDR data.
  // Width/height are the first two big-endian uint32s of IHDR at offsets 16/20.
  if (bytes.length < 24) return null;
  if (bytes.subarray(12, 16).toString("ascii") !== "IHDR") return null;
  const width = bytes.readUInt32BE(16);
  const height = bytes.readUInt32BE(20);
  if (width === 0 || height === 0) return null;
  return { width, height };
}

/** Derived resolution class token, purely a function of the dimensions. */
export function deriveResolutionClass(dim: Dimensions): string {
  return `${dim.width}x${dim.height}`;
}

export function checkFormatDimensions(sidecar: Sidecar, assetPath: string): CheckResult {
  const check = "2-format-dimensions";
  const declaredFormat = (sidecar.format ?? "").trim().toLowerCase();
  let bytes: Buffer;
  try {
    bytes = fs.readFileSync(assetPath);
  } catch {
    return { check, verdict: "FAIL", reason: "asset file missing or unreadable", offending: assetPath };
  }
  const onDisk = detectFormat(bytes);

  // Declared format must match what the bytes actually are.
  if (declaredFormat && declaredFormat !== onDisk) {
    return {
      check,
      verdict: "FAIL",
      reason: "declared format does not match on-disk magic bytes",
      expected: declaredFormat,
      actual: onDisk,
      offending: assetPath,
    };
  }

  if (onDisk !== "png") {
    // v0.1 parses dimensions for PNG only. Non-PNG (or unknown) = N/A, printed.
    return {
      check,
      verdict: "N/A",
      reason: `v0.1 dimension parse is PNG-only; on-disk format = ${onDisk}`,
      actual: onDisk,
    };
  }

  const dims = parsePngDimensions(bytes);
  if (!dims) {
    return {
      check,
      verdict: "FAIL",
      reason: "PNG header truncated or IHDR missing",
      expected: "valid IHDR",
      actual: "<truncated>",
      offending: assetPath,
    };
  }
  const declaredDims = sidecar.dimensions;
  const resClass = deriveResolutionClass(dims);
  if (!declaredDims || declaredDims.width !== dims.width || declaredDims.height !== dims.height) {
    return {
      check,
      verdict: "FAIL",
      reason: "on-disk dimensions do not match sidecar",
      expected: declaredDims ? `${declaredDims.width}x${declaredDims.height}` : "<none>",
      actual: `${dims.width}x${dims.height}`,
      offending: assetPath,
    };
  }
  return {
    check,
    verdict: "PASS",
    reason: `format=png, dimensions match, derived res-class=${resClass}`,
    expected: `${declaredDims.width}x${declaredDims.height}`,
    actual: `${dims.width}x${dims.height} (res-class ${resClass})`,
  };
}

// ── check 3 — path-binding (word-boundary, NOT bare substring) ───────────────
function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * True iff `basename` appears in `text` bounded by non-filename characters on
 * both sides. Filename chars are [A-Za-z0-9_.-]; a match must NOT be preceded
 * or followed by one. So `actors/gravewarden.png` and `"gravewarden.png"` match
 * `gravewarden.png`, but `old_gravewarden.png` and `gravewarden.png2` do NOT
 * (the classic substring false-PASS the gate calls out).
 */
export function referencesBasename(text: string, basename: string): boolean {
  const re = new RegExp(`(?<![A-Za-z0-9_.\\-])${escapeRegExp(basename)}(?![A-Za-z0-9_.\\-])`);
  return re.test(text);
}

export function checkPathBinding(_sidecar: Sidecar, assetPath: string, ctx: EvidenceContext = {}): CheckResult {
  const check = "3-path-binding";
  const basename = path.basename(assetPath);
  const sources = ctx.sources ?? [];
  const matched = sources.find((s) => referencesBasename(s.text, basename));
  if (matched) {
    return { check, verdict: "PASS", reason: `referenced by ${matched.file}`, actual: matched.file };
  }
  const allowlist = ctx.allowlist ?? [];
  if (allowlist.includes(basename)) {
    return {
      check,
      verdict: "N/A",
      reason: `no literal reference found; allowlisted (constructed/glob-loaded path): ${basename}`,
      actual: "allowlisted",
    };
  }
  return {
    check,
    verdict: "FAIL",
    reason: "asset is not referenced by any source or manifest (and not allowlisted)",
    expected: "at least one word-boundary reference",
    actual: "none",
    offending: basename,
  };
}

// ── check 4 — palette (DEGRADED, declaration-level only in v0.1) ─────────────
const PALETTE_LIMITATION = "v0.1: declaration-level only; pixel verification deferred";
const HEX_RE = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

export function checkPalette(sidecar: Sidecar, ctx: EvidenceContext = {}): CheckResult {
  const check = "4-palette";
  const tokens = sidecar.style_tokens_declared;
  const palette = tokens?.palette;
  if (!Array.isArray(palette) || palette.length === 0) {
    return {
      check,
      verdict: "FAIL",
      reason: `declared palette missing or empty (${PALETTE_LIMITATION})`,
      expected: "non-empty hex array",
      actual: palette === undefined ? "<none>" : JSON.stringify(palette),
    };
  }
  const malformed = palette.find((c) => typeof c !== "string" || !HEX_RE.test(c));
  if (malformed !== undefined) {
    return {
      check,
      verdict: "FAIL",
      reason: `declared palette contains a malformed hex value (${PALETTE_LIMITATION})`,
      expected: "#RGB | #RRGGBB | #RRGGBBAA",
      actual: String(malformed),
      offending: String(malformed),
    };
  }
  const declared = (palette as string[]).map((c) => c.toLowerCase());

  const ref = sidecar.style_bible_ref;
  const resolve = ctx.resolveStyleBiblePalette;
  const named = ref && resolve ? resolve(ref) : null;
  if (!named) {
    return {
      check,
      verdict: "WARN",
      reason: `style_bible_ref did not resolve; palette well-formed but unverified against a named palette (${PALETTE_LIMITATION})`,
      actual: `${declared.length} declared colors`,
    };
  }
  const namedLower = named.map((c) => c.toLowerCase());
  const notInBible = declared.find((c) => !namedLower.includes(c));
  if (notInBible !== undefined) {
    return {
      check,
      verdict: "FAIL",
      reason: `declared palette is not a subset of the named style-bible palette (${PALETTE_LIMITATION})`,
      expected: "declared ⊆ named palette",
      actual: notInBible,
      offending: notInBible,
    };
  }
  return {
    check,
    verdict: "PASS",
    reason: `declared palette ⊆ named style-bible palette (${PALETTE_LIMITATION})`,
    actual: `${declared.length} colors ⊆ ${namedLower.length}`,
  };
}

// ── check 5 — provenance fields + rule R1 (base_asset_ref) ───────────────────
export const FRESH_GEN = "fresh-gen";

export function checkProvenance(sidecar: Sidecar): CheckResult {
  const check = "5-provenance";
  const nonEmpty = (v: unknown): boolean =>
    (typeof v === "string" && v.trim().length > 0) || typeof v === "number";
  const required: Array<[string, unknown]> = [
    ["prompt", sidecar.prompt],
    ["model_id", sidecar.model_id],
    ["generator", sidecar.generator],
    ["generated_at", sidecar.generated_at],
    ["seed", sidecar.seed],
  ];
  const missing = required.find(([, v]) => !nonEmpty(v));
  if (missing) {
    return {
      check,
      verdict: "FAIL",
      reason: `provenance field is empty: ${missing[0]}`,
      expected: "non-empty",
      actual: "empty",
      offending: missing[0],
    };
  }

  // Rule R1 — base_asset_ref: object{path,sha256} XOR literal "fresh-gen".
  const base = sidecar.base_asset_ref;
  if (typeof base === "string") {
    if (base === FRESH_GEN) {
      return { check, verdict: "PASS", reason: `provenance complete; base_asset_ref="${FRESH_GEN}" (from-scratch, no base)` };
    }
    return {
      check,
      verdict: "FAIL",
      reason: `R1: base_asset_ref string must equal the literal "${FRESH_GEN}" (unflagged and no base)`,
      expected: `"${FRESH_GEN}" or { path, sha256 }`,
      actual: base.length === 0 ? '"" (empty)' : JSON.stringify(base),
      offending: base,
    };
  }
  if (base && typeof base === "object") {
    const hasPath = typeof base.path === "string" && base.path.trim().length > 0;
    const hasSha = typeof base.sha256 === "string" && base.sha256.trim().length > 0;
    if (hasPath && hasSha) {
      return { check, verdict: "PASS", reason: `provenance complete; derived from ${base.path}` };
    }
    return {
      check,
      verdict: "FAIL",
      reason: "R1: derived base_asset_ref must carry both path and sha256",
      expected: "{ path, sha256 } both non-empty",
      actual: JSON.stringify(base),
      offending: JSON.stringify(base),
    };
  }
  return {
    check,
    verdict: "FAIL",
    reason: `R1: base_asset_ref absent — must be "${FRESH_GEN}" or a { path, sha256 } base`,
    expected: `"${FRESH_GEN}" or { path, sha256 }`,
    actual: "<none>",
  };
}

// ── check 6 (mechanical presence-half) — attestation block well-formed + R2 ──
// The MECHANICAL leg only asserts the human record EXISTS, is well-formed, and
// carries a non-empty name (rule R2). It does NOT re-judge aesthetics — the
// human verdict is rendered separately on the AESTHETIC leg (never as "PASS").
const SIGNOFF_REQUIRED: Array<keyof AestheticSignoff> = [
  "name",
  "date",
  "verdict",
  "reviewed_at_resolution",
  "reviewed_on_surface",
];
const SIGNOFF_VERDICTS = ["on-vibe", "off-vibe"];

export function checkAttestationPresence(sidecar: Sidecar): CheckResult {
  const check = "6-attestation-presence";
  const s = sidecar.aesthetic_signoff;
  if (!s || typeof s !== "object") {
    return { check, verdict: "FAIL", reason: "aesthetic_signoff block absent", expected: "well-formed signoff", actual: "<none>" };
  }
  const missing = SIGNOFF_REQUIRED.find((k) => s[k] === undefined || s[k] === null);
  if (missing) {
    return {
      check,
      verdict: "FAIL",
      reason: `aesthetic_signoff missing required field: ${missing}`,
      expected: SIGNOFF_REQUIRED.join(", "),
      actual: `missing ${missing}`,
      offending: missing,
    };
  }
  if (typeof s.verdict !== "string" || !SIGNOFF_VERDICTS.includes(s.verdict)) {
    return {
      check,
      verdict: "FAIL",
      reason: "aesthetic_signoff.verdict is not a recognized value",
      expected: SIGNOFF_VERDICTS.join(" | "),
      actual: String(s.verdict),
      offending: String(s.verdict),
    };
  }
  // Rule R2 — name must be non-empty AFTER trim (whitespace-only fails).
  if (typeof s.name !== "string" || s.name.trim().length === 0) {
    return {
      check,
      verdict: "FAIL",
      reason: "R2: aesthetic_signoff.name is empty after trim (no name = no pass)",
      expected: "non-empty name",
      actual: JSON.stringify(s.name ?? null),
    };
  }
  return {
    check,
    verdict: "PASS",
    reason: `attestation block well-formed; signed by ${s.name.trim()}`,
    actual: s.name.trim(),
  };
}

// ── AESTHETIC leg (human) — ATTESTED / NOT ATTESTED, never "PASS" ────────────
export interface AestheticLeg {
  attested: boolean;
  name: string;
  date: string;
  /** Human-readable render, e.g. `ATTESTED — JP, 2026-07-24` or `NOT ATTESTED (...)`. */
  line: string;
}

export function evaluateAesthetic(sidecar: Sidecar): AestheticLeg {
  const s = sidecar.aesthetic_signoff;
  const name = (s?.name ?? "").trim();
  const date = (s?.date ?? "").trim();
  if (!s || !name || s.verdict !== "on-vibe") {
    let why = "no aesthetic_signoff";
    if (s && !name) why = "signoff name empty";
    else if (s && s.verdict !== "on-vibe") why = `human verdict = ${JSON.stringify(s.verdict)}`;
    return { attested: false, name, date, line: `NOT ATTESTED (${why})` };
  }
  return { attested: true, name, date, line: `ATTESTED — ${name}, ${date}` };
}

// ── runner over a single sidecar ─────────────────────────────────────────────
export const CERT_CLASS = "mechanical-pass-human-aesthetic";

export interface SidecarReport {
  assetPath: string;
  checks: CheckResult[];
  /** true iff no mechanical check is FAIL. */
  mechanicalPass: boolean;
  mechanicalPassCount: number;
  mechanicalTotal: number;
  aesthetic: AestheticLeg;
  /** Overall gate: mechanical clean AND human attested. */
  ok: boolean;
  cert_class: string;
}

/** Run the six mechanical checks (1-5 + 6-presence) against one sidecar+asset. */
export function evaluateSidecar(sidecar: Sidecar, assetPath: string, ctx: EvidenceContext = {}): SidecarReport {
  const checks: CheckResult[] = [
    checkSha256(sidecar, assetPath),
    checkFormatDimensions(sidecar, assetPath),
    checkPathBinding(sidecar, assetPath, ctx),
    checkPalette(sidecar, ctx),
    checkProvenance(sidecar),
    checkAttestationPresence(sidecar),
  ];
  const mechanicalTotal = checks.length;
  const mechanicalPassCount = checks.filter((c) => c.verdict === "PASS").length;
  const anyFail = checks.some((c) => c.verdict === "FAIL");
  const aesthetic = evaluateAesthetic(sidecar);
  return {
    assetPath,
    checks,
    mechanicalPass: !anyFail,
    mechanicalPassCount,
    mechanicalTotal,
    aesthetic,
    ok: !anyFail && aesthetic.attested,
    cert_class: CERT_CLASS,
  };
}

// ── two-line report renderer ────────────────────────────────────────────────
export interface RenderedReport {
  /** Ordered human-readable lines (per-check diagnostics + the two legs). */
  human: string[];
  /** Machine-readable summary, emitted alongside. */
  json: unknown;
}

export function renderSidecarReport(report: SidecarReport): RenderedReport {
  const human: string[] = [];
  for (const c of report.checks) {
    const parts = [`  [${c.verdict}] ${c.check}: ${c.reason}`];
    if (c.expected !== undefined || c.actual !== undefined) {
      parts.push(`(expected: ${c.expected ?? "-"} | actual: ${c.actual ?? "-"})`);
    }
    if (c.offending !== undefined) parts.push(`{offending: ${c.offending}}`);
    human.push(parts.join(" "));
  }
  // MECHANICAL leg — the only leg that may say PASS.
  const mechLabel = report.mechanicalPass ? "PASS" : "FAIL";
  human.push(`MECHANICAL: ${mechLabel} (${report.mechanicalPassCount}/${report.mechanicalTotal})`);
  // AESTHETIC leg — human, never renders "PASS".
  human.push(`AESTHETIC: ${report.aesthetic.line}`);

  const json = {
    asset_path: report.assetPath,
    cert_class: report.cert_class,
    mechanical: {
      pass: report.mechanicalPass,
      passed: report.mechanicalPassCount,
      total: report.mechanicalTotal,
      checks: report.checks,
    },
    aesthetic: {
      attested: report.aesthetic.attested,
      name: report.aesthetic.name,
      date: report.aesthetic.date,
    },
    ok: report.ok,
  };
  return { human, json };
}

// ── UNCOVERED helper + sidecar path convention ───────────────────────────────
export const SIDECAR_SUFFIX = ".visual-evidence.json";

export function sidecarPathFor(assetPath: string): string {
  return `${assetPath}${SIDECAR_SUFFIX}`;
}

export function assetPathForSidecar(sidecarPath: string): string {
  return sidecarPath.slice(0, -SIDECAR_SUFFIX.length);
}

export function uncovered(assetPath: string): CheckResult {
  return {
    check: "0-coverage",
    verdict: "UNCOVERED",
    reason: `no ${SIDECAR_SUFFIX} sidecar beside asset`,
    offending: assetPath,
  };
}

// ── CLI glue (impure): walk a project root, evaluate every sidecar, print ─────
const SKIP_DIRS = new Set(["node_modules", "dist", ".git", ".turbo", "coverage"]);
const SOURCE_EXTS = new Set([".ts", ".js", ".mjs", ".cjs", ".json", ".yaml", ".yml", ".md", ".html", ".css"]);
const HEX_TOKEN_RE = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g;
const MAX_SOURCE_BYTES = 512 * 1024;

function walkFiles(root: string): string[] {
  const out: string[] = [];
  const stack = [root];
  while (stack.length) {
    const dir = stack.pop()!;
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        if (!SKIP_DIRS.has(e.name)) stack.push(full);
      } else if (e.isFile()) {
        out.push(full);
      }
    }
  }
  return out;
}

/** Resolve a style-bible ref to its named palette by scraping hex tokens. */
function makeStyleBibleResolver(root: string, sidecarDir: string): (ref: StyleBibleRef) => string[] | null {
  return (ref: StyleBibleRef): string[] | null => {
    if (!ref?.path) return null;
    const candidates = [path.resolve(sidecarDir, ref.path), path.resolve(root, ref.path)];
    for (const p of candidates) {
      try {
        const text = fs.readFileSync(p, "utf8");
        const tokens = text.match(HEX_TOKEN_RE);
        if (tokens && tokens.length) return Array.from(new Set(tokens.map((t) => t.toLowerCase())));
      } catch {
        // try next candidate
      }
    }
    return null;
  };
}

export interface RunOptions {
  log?: (line: string) => void;
  emitJson?: (obj: unknown) => void;
}

/**
 * CLI entry: find every `*.visual-evidence.json` under `root`, evaluate it, and
 * print the per-check diagnostics + two-leg report + a machine-readable summary.
 * Returns true iff every covered sidecar is mechanically clean AND human-attested
 * (i.e. no FAIL and no NOT-ATTESTED). UNCOVERED assets are reported but, per
 * v0.1, do not by themselves fail the run.
 */
export function runVisualEvidence(root: string, opts: RunOptions = {}): boolean {
  const log = opts.log ?? ((l: string) => console.log(l));
  const emitJson = opts.emitJson ?? ((o: unknown) => console.log(JSON.stringify(o, null, 2)));

  const files = walkFiles(root);
  const sidecarFiles = files.filter((f) => f.endsWith(SIDECAR_SUFFIX));

  // Build the path-binding source corpus once (all text files bar sidecars).
  const sources: Array<{ file: string; text: string }> = [];
  for (const f of files) {
    if (f.endsWith(SIDECAR_SUFFIX)) continue;
    if (!SOURCE_EXTS.has(path.extname(f).toLowerCase())) continue;
    try {
      const stat = fs.statSync(f);
      if (stat.size > MAX_SOURCE_BYTES) continue;
      sources.push({ file: path.relative(root, f), text: fs.readFileSync(f, "utf8") });
    } catch {
      // unreadable source — skip
    }
  }

  // Optional allowlist for constructed/glob-loaded paths.
  let allowlist: string[] = [];
  try {
    const raw = fs.readFileSync(path.join(root, "visual-evidence.allowlist.json"), "utf8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) allowlist = parsed.filter((x) => typeof x === "string");
  } catch {
    // no allowlist — fine
  }

  log("── visual-evidence (v0.1) ──────────────────────────────────────");
  if (sidecarFiles.length === 0) {
    log("no visual-evidence sidecars found (nothing to check)");
    emitJson({ visual_evidence: { version: "0.1", sidecars: 0, ok: true, reports: [] } });
    return true;
  }

  let ok = true;
  const jsonReports: unknown[] = [];
  for (const sidecarFile of sidecarFiles.sort()) {
    const assetPath = assetPathForSidecar(sidecarFile);
    const rel = path.relative(root, assetPath);
    log("");
    log(`asset: ${rel}`);
    let sidecar: Sidecar;
    try {
      sidecar = JSON.parse(fs.readFileSync(sidecarFile, "utf8")) as Sidecar;
    } catch (e) {
      // Fail-closed: an unparseable sidecar is a FAIL, never a skip.
      ok = false;
      const reason = e instanceof Error ? e.message : String(e);
      log(`  [FAIL] 0-parse: sidecar is not valid JSON — ${reason}`);
      log("MECHANICAL: FAIL (0/6)");
      log("AESTHETIC: NOT ATTESTED (sidecar unparseable)");
      jsonReports.push({ asset_path: rel, parse_error: reason, ok: false });
      continue;
    }
    const ctx: EvidenceContext = {
      sources,
      allowlist,
      resolveStyleBiblePalette: makeStyleBibleResolver(root, path.dirname(sidecarFile)),
    };
    const report = evaluateSidecar(sidecar, assetPath, ctx);
    const rendered = renderSidecarReport(report);
    for (const line of rendered.human) log(line);
    jsonReports.push(rendered.json);
    if (!report.ok) ok = false;
  }

  emitJson({
    visual_evidence: { version: "0.1", cert_class: CERT_CLASS, sidecars: sidecarFiles.length, ok, reports: jsonReports },
  });
  return ok;
}
