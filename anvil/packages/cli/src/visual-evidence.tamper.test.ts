// TAMPER TEST — proof of life for the visual-evidence checker.
//
// Per the Delta Force gate this is THE first test: it must go RED when the
// checker is wrong and GREEN when it is right, so a green result MEANS
// something. It copies the real gravewake sprite into a temp dir, authors the
// valid sidecar beside it, flips ONE byte, and asserts the sha256 check FAILs
// naming the asset + expected-vs-actual. The companion asserts the untampered
// pair reports MECHANICAL: PASS and NEVER an unqualified top-level "PASS".

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import { checkSha256, evaluateSidecar, renderSidecarReport, type Sidecar } from "./visual-evidence.js";

const fixtures = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "__fixtures__/visual-evidence");
const realSprite = path.join(fixtures, "gravewarden.png");
const realSidecar = path.join(fixtures, "gravewarden.png.visual-evidence.json");

const temps: string[] = [];
afterEach(() => {
  for (const d of temps.splice(0)) fs.rmSync(d, { recursive: true, force: true });
});

function tempDir(): string {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), "ve-tamper-"));
  temps.push(d);
  return d;
}

function loadSidecar(): Sidecar {
  return JSON.parse(fs.readFileSync(realSidecar, "utf8")) as Sidecar;
}

describe("visual-evidence tamper test (proof of life)", () => {
  it("FAILs check 1 when a byte is flipped, naming the asset + expected-vs-actual sha", () => {
    const dir = tempDir();
    const assetCopy = path.join(dir, "gravewarden.png");
    const bytes = fs.readFileSync(realSprite);
    bytes[Math.floor(bytes.length / 2)] ^= 0xff; // flip one byte in the middle
    fs.writeFileSync(assetCopy, bytes);

    const sidecar = loadSidecar(); // the VALID sidecar (declares the real sha)
    const result = checkSha256(sidecar, assetCopy);

    expect(result.verdict).toBe("FAIL");
    expect(result.offending).toBe(assetCopy); // names the asset
    expect(result.expected).toBe(sidecar.sha256!.toLowerCase()); // expected sha
    expect(result.actual).not.toBe(result.expected); // actual differs
    expect(result.actual).toMatch(/^[0-9a-f]{64}$/); // a real recomputed hash
  });

  it("exit-contract: a tampered asset drives the run to not-ok (exit != 0)", () => {
    const dir = tempDir();
    const assetCopy = path.join(dir, "gravewarden.png");
    const bytes = fs.readFileSync(realSprite);
    bytes[10] ^= 0x01;
    fs.writeFileSync(assetCopy, bytes);

    const report = evaluateSidecar(loadSidecar(), assetCopy);
    expect(report.mechanicalPass).toBe(false);
    expect(report.ok).toBe(false); // exit != 0
  });

  it("companion: the UNTAMPERED pair reports MECHANICAL: PASS and never a bare top-level PASS", () => {
    const dir = tempDir();
    const assetCopy = path.join(dir, "gravewarden.png");
    fs.copyFileSync(realSprite, assetCopy); // byte-identical copy
    // give path-binding a source that references the basename
    const report = evaluateSidecar(loadSidecar(), assetCopy, {
      sources: [{ file: "manifest.yaml", text: "  - actors/gravewarden.png\n" }],
      resolveStyleBiblePalette: () => null, // WARN on palette, not FAIL
    });
    expect(report.mechanicalPass).toBe(true);

    const rendered = renderSidecarReport(report);
    const mechLine = rendered.human.find((l) => l.startsWith("MECHANICAL:"));
    const aesthLine = rendered.human.find((l) => l.startsWith("AESTHETIC:"));
    expect(mechLine).toBe("MECHANICAL: PASS (5/6)"); // 5 PASS + 1 WARN (palette)
    expect(aesthLine).toBe("AESTHETIC: ATTESTED — JP, 2026-07-24");

    // No line may be a bare, unqualified top-level "PASS".
    expect(rendered.human.some((l) => l.trim() === "PASS")).toBe(false);
    // The human/aesthetic leg must never render the word PASS.
    expect(aesthLine).not.toContain("PASS");
  });

  it('never emits the banned word "certified" anywhere in the rendered report', () => {
    const dir = tempDir();
    const assetCopy = path.join(dir, "gravewarden.png");
    fs.copyFileSync(realSprite, assetCopy);
    const report = evaluateSidecar(loadSidecar(), assetCopy, {
      sources: [{ file: "m", text: "gravewarden.png" }],
    });
    const rendered = renderSidecarReport(report);
    const blob = (rendered.human.join("\n") + JSON.stringify(rendered.json)).toLowerCase();
    expect(blob).not.toContain("certified");
    expect(report.cert_class).toBe("mechanical-pass-human-aesthetic");
  });
});
