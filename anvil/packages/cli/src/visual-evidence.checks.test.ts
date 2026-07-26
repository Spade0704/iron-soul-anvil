import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import {
  checkAttestationPresence,
  checkFormatDimensions,
  checkPalette,
  checkPathBinding,
  checkProvenance,
  checkSha256,
  evaluateAesthetic,
  referencesBasename,
  type Sidecar,
} from "./visual-evidence.js";

const fixtures = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "__fixtures__/visual-evidence");
const realSprite = path.join(fixtures, "gravewarden.png");

const temps: string[] = [];
afterEach(() => {
  for (const d of temps.splice(0)) fs.rmSync(d, { recursive: true, force: true });
});
function tempDir(): string {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), "ve-checks-"));
  temps.push(d);
  return d;
}

/** A fully valid sidecar; individual tests mutate one field. */
function validSidecar(): Sidecar {
  return {
    asset_path: "games/gravewake/assets/actors/gravewarden.png",
    sha256: "9715a94a47e85a53949849aa3e18e20d9396c83d53482c8a44e2bdf67cf1f314",
    format: "png",
    dimensions: { width: 128, height: 128 },
    base_asset_ref: "fresh-gen",
    prompt: "gravewarden sprite",
    seed: 40125,
    model_id: "grok-imagine-v0.9",
    style_bible_ref: { path: "style-bible.gravewake.md", commit_sha: "8254a1b" },
    style_tokens_declared: { palette: ["#0a0a0a", "#c8823c"], resolution_class: "128x128" },
    generated_at: "2026-07-24T00:00:00Z",
    generator: "hand-authored v0.1 bootstrap",
    aesthetic_signoff: {
      name: "JP",
      date: "2026-07-24",
      verdict: "on-vibe",
      reviewed_at_resolution: "128x128",
      reviewed_on_surface: "editor-zoom-4x",
    },
  };
}

describe("check 1 — sha256", () => {
  it("PASS on a byte-identical asset", () => {
    expect(checkSha256(validSidecar(), realSprite).verdict).toBe("PASS");
  });
  it("FAIL (not throw) when the asset file is missing", () => {
    const r = checkSha256(validSidecar(), path.join(tempDir(), "nope.png"));
    expect(r.verdict).toBe("FAIL");
    expect(r.actual).toBe("<no-file>");
  });
  it("FAIL when the sidecar declares no sha256", () => {
    const s = validSidecar();
    delete s.sha256;
    expect(checkSha256(s, realSprite).verdict).toBe("FAIL");
  });
});

describe("check 2 — format + dimensions", () => {
  it("PASS on the real 128x128 PNG and derives the res-class", () => {
    const r = checkFormatDimensions(validSidecar(), realSprite);
    expect(r.verdict).toBe("PASS");
    expect(r.actual).toContain("res-class 128x128");
  });
  it("FAIL on a dimensions mismatch, naming expected vs actual", () => {
    const s = validSidecar();
    s.dimensions = { width: 64, height: 64 };
    const r = checkFormatDimensions(s, realSprite);
    expect(r.verdict).toBe("FAIL");
    expect(r.expected).toBe("64x64");
    expect(r.actual).toBe("128x128");
  });
  it("FAIL on a declared-format vs magic-bytes mismatch", () => {
    const s = validSidecar();
    s.format = "webp";
    expect(checkFormatDimensions(s, realSprite).verdict).toBe("FAIL");
  });
  it("N/A(reason) for a non-PNG asset (no pixel-decode dep in v0.1)", () => {
    const dir = tempDir();
    const svg = path.join(dir, "logo.svg");
    fs.writeFileSync(svg, '<svg xmlns="http://www.w3.org/2000/svg"></svg>');
    const s = validSidecar();
    s.format = "svg";
    const r = checkFormatDimensions(s, svg);
    expect(r.verdict).toBe("N/A");
    expect(r.reason).toContain("PNG-only");
  });
  it("FAIL on a truncated PNG header", () => {
    const dir = tempDir();
    const trunc = path.join(dir, "trunc.png");
    // valid 8-byte PNG signature then nothing — IHDR truncated
    fs.writeFileSync(trunc, Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    const r = checkFormatDimensions(validSidecar(), trunc);
    expect(r.verdict).toBe("FAIL");
    expect(r.actual).toBe("<truncated>");
  });
});

describe("check 3 — path-binding (word-boundary, not substring)", () => {
  it("PASS when a manifest references the exact basename", () => {
    const r = checkPathBinding(validSidecar(), "a/gravewarden.png", {
      sources: [{ file: "manifest.yaml", text: "  - actors/gravewarden.png\n" }],
    });
    expect(r.verdict).toBe("PASS");
  });
  it("FAIL when nothing references the asset and it is not allowlisted", () => {
    const r = checkPathBinding(validSidecar(), "a/gravewarden.png", {
      sources: [{ file: "other.ts", text: "const x = 1;" }],
    });
    expect(r.verdict).toBe("FAIL");
  });
  it("REJECTS the substring false-PASS: gravewake_old.png must not match gravewake.png", () => {
    // searching for gravewake.png against a source that only has gravewake_old.png
    expect(referencesBasename("load('gravewake_old.png')", "gravewake.png")).toBe(false);
    // and a prefix collision must not match either
    expect(referencesBasename("load('mygravewake.png')", "gravewake.png")).toBe(false);
    // but a legitimate path-prefixed reference DOES match
    expect(referencesBasename("art/gravewake.png", "gravewake.png")).toBe(true);
    expect(referencesBasename('"gravewake.png"', "gravewake.png")).toBe(true);
  });
  it("N/A(allowlisted) escape hatch for constructed/glob paths", () => {
    const r = checkPathBinding(validSidecar(), "a/gravewarden.png", {
      sources: [{ file: "other.ts", text: "no ref here" }],
      allowlist: ["gravewarden.png"],
    });
    expect(r.verdict).toBe("N/A");
    expect(r.reason).toContain("allowlisted");
  });
});

describe("check 4 — palette (degraded, declaration-level in v0.1)", () => {
  it("PASS when declared ⊆ resolved named palette, printing its own limitation", () => {
    const r = checkPalette(validSidecar(), {
      resolveStyleBiblePalette: () => ["#0a0a0a", "#c8823c", "#ffffff"],
    });
    expect(r.verdict).toBe("PASS");
    expect(r.reason).toContain("declaration-level only");
  });
  it("FAIL when a declared color is not in the named palette", () => {
    const s = validSidecar();
    s.style_tokens_declared = { palette: ["#123456"], resolution_class: "128x128" };
    const r = checkPalette(s, { resolveStyleBiblePalette: () => ["#0a0a0a"] });
    expect(r.verdict).toBe("FAIL");
    expect(r.offending).toBe("#123456");
  });
  it("FAIL on a malformed hex value", () => {
    const s = validSidecar();
    s.style_tokens_declared = { palette: ["#zzzz"], resolution_class: "x" };
    expect(checkPalette(s, {}).verdict).toBe("FAIL");
  });
  it("FAIL on an empty/absent palette", () => {
    const s = validSidecar();
    s.style_tokens_declared = { palette: [], resolution_class: "x" };
    expect(checkPalette(s, {}).verdict).toBe("FAIL");
  });
  it("WARN (printed) when the style-bible ref does not resolve", () => {
    const r = checkPalette(validSidecar(), { resolveStyleBiblePalette: () => null });
    expect(r.verdict).toBe("WARN");
    expect(r.reason).toContain("did not resolve");
  });
});

describe("check 5 — provenance + rule R1", () => {
  it("PASS for a well-formed fresh-gen sidecar", () => {
    expect(checkProvenance(validSidecar()).verdict).toBe("PASS");
  });
  it("PASS for a derived asset with base { path, sha256 } (both present)", () => {
    const s = validSidecar();
    s.base_asset_ref = { path: "base/x.png", sha256: "deadbeef" };
    expect(checkProvenance(s).verdict).toBe("PASS");
  });
  it("FAIL R1 when base is absent (neither fresh-gen nor a base object)", () => {
    const s = validSidecar();
    delete s.base_asset_ref;
    expect(checkProvenance(s).verdict).toBe("FAIL");
  });
  it("FAIL R1 on an empty-string base_asset_ref", () => {
    const s = validSidecar();
    s.base_asset_ref = "";
    const r = checkProvenance(s);
    expect(r.verdict).toBe("FAIL");
    expect(r.actual).toContain("empty");
  });
  it("FAIL R1 on a non-fresh-gen literal string", () => {
    const s = validSidecar();
    s.base_asset_ref = "yes";
    expect(checkProvenance(s).verdict).toBe("FAIL");
  });
  it("FAIL R1 when a base object is missing sha256", () => {
    const s = validSidecar();
    s.base_asset_ref = { path: "base/x.png" };
    expect(checkProvenance(s).verdict).toBe("FAIL");
  });
  it("FAIL when a provenance field is empty", () => {
    const s = validSidecar();
    s.model_id = "";
    const r = checkProvenance(s);
    expect(r.verdict).toBe("FAIL");
    expect(r.offending).toBe("model_id");
  });
});

describe("check 6 (presence) + rule R2", () => {
  it("PASS on a well-formed signoff with a real name", () => {
    expect(checkAttestationPresence(validSidecar()).verdict).toBe("PASS");
  });
  it("FAIL R2 on a whitespace-only name", () => {
    const s = validSidecar();
    s.aesthetic_signoff!.name = "   ";
    const r = checkAttestationPresence(s);
    expect(r.verdict).toBe("FAIL");
    expect(r.reason).toContain("R2");
  });
  it("FAIL when the signoff block is absent", () => {
    const s = validSidecar();
    delete s.aesthetic_signoff;
    expect(checkAttestationPresence(s).verdict).toBe("FAIL");
  });
  it("FAIL when a required signoff field is missing", () => {
    const s = validSidecar();
    delete s.aesthetic_signoff!.reviewed_on_surface;
    expect(checkAttestationPresence(s).verdict).toBe("FAIL");
  });
  it("FAIL on an unrecognized verdict value", () => {
    const s = validSidecar();
    s.aesthetic_signoff!.verdict = "meh";
    expect(checkAttestationPresence(s).verdict).toBe("FAIL");
  });
});

describe("aesthetic leg (human, never PASS)", () => {
  it("ATTESTED when signed on-vibe with a name", () => {
    const a = evaluateAesthetic(validSidecar());
    expect(a.attested).toBe(true);
    expect(a.line).toBe("ATTESTED — JP, 2026-07-24");
    expect(a.line).not.toContain("PASS");
  });
  it("NOT ATTESTED when the human verdict is off-vibe", () => {
    const s = validSidecar();
    s.aesthetic_signoff!.verdict = "off-vibe";
    const a = evaluateAesthetic(s);
    expect(a.attested).toBe(false);
    expect(a.line).toContain("NOT ATTESTED");
  });
  it("NOT ATTESTED when there is no signoff", () => {
    const s = validSidecar();
    delete s.aesthetic_signoff;
    expect(evaluateAesthetic(s).attested).toBe(false);
  });
});

// ── DEFERRED to v0.2 — metric specified now so it is not relitigated later ────
describe("deferred v0.2 checks", () => {
  // Check 4 (pixel) — per-pixel palette conformance. Metric (LOCKED): for each
  // non-transparent pixel (alpha=0 EXCLUDED), nearest declared-palette color by
  // CIE Lab ΔE (or per-channel max-abs); NEVER naive RGB Euclidean. A pixel
  // whose nearest distance exceeds the style-bible tolerance is off-palette.
  // Requires a PNG decoder — deferred (no image-decode dep in v0.1).
  it.todo(
    "check 4 (pixel): every non-alpha-0 pixel within Lab ΔE tolerance of nearest declared color (no naive RGB Euclidean)",
  );

  // Check 6 (likeness/vision) — semantic likeness to the base identity. Metric
  // (LOCKED for v0.1): provenance-flag + attestation-presence ONLY (implemented
  // as check 5 R1 + check 6-presence). Vision-model likeness scoring is deferred
  // (no vision dep in v0.1).
  it.todo("check 6 (likeness): vision-model likeness score vs base identity above threshold");
});
