// PROVE-RUN — the runner over the real fixture sidecar (byte-identical copy of
// games/gravewake gravewarden.png + its hand-authored honest sidecar).

import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { runVisualEvidence } from "./visual-evidence.js";

const fixtures = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "__fixtures__/visual-evidence");

function capture(root: string): { ok: boolean; lines: string[]; json: unknown[] } {
  const lines: string[] = [];
  const json: unknown[] = [];
  const ok = runVisualEvidence(root, { log: (l) => lines.push(l), emitJson: (o) => json.push(o) });
  return { ok, lines, json };
}

describe("visual-evidence prove-run (real fixture)", () => {
  it("passes the real gravewarden prove-pair with the two-leg report", () => {
    const { ok, lines, json } = capture(fixtures);
    expect(ok).toBe(true);

    const mech = lines.find((l) => l.startsWith("MECHANICAL:"));
    const aesth = lines.find((l) => l.startsWith("AESTHETIC:"));
    // All six mechanical checks pass (path-binding via manifest, palette ⊆ style bible).
    expect(mech).toBe("MECHANICAL: PASS (6/6)");
    expect(aesth).toBe("AESTHETIC: ATTESTED — JP, 2026-07-24");

    // The human leg never renders PASS; the banned word never appears.
    expect(aesth).not.toContain("PASS");
    const blob = lines.join("\n").toLowerCase();
    expect(blob).not.toContain("certified");

    // Machine-readable summary emitted alongside.
    const summary = json[0] as { visual_evidence: { ok: boolean; sidecars: number; cert_class: string } };
    expect(summary.visual_evidence.ok).toBe(true);
    expect(summary.visual_evidence.sidecars).toBe(1);
    expect(summary.visual_evidence.cert_class).toBe("mechanical-pass-human-aesthetic");
  });

  it("reports cleanly (ok, exit 0) on a directory with no sidecars", () => {
    const dirWithout = path.dirname(fileURLToPath(import.meta.url)); // src/ has no sidecars
    // src/ DOES contain sidecar tests but no *.visual-evidence.json data files there;
    // point at schemas/ which has none.
    const schemasDir = path.join(dirWithout, "schemas");
    const { ok, lines } = capture(schemasDir);
    expect(ok).toBe(true);
    expect(lines.some((l) => l.includes("no visual-evidence sidecars found"))).toBe(true);
  });
});
