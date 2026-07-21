import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";

const cli = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../dist/index.js",
);
const roots: string[] = [];

afterEach(() => {
  for (const root of roots.splice(0)) fs.rmSync(root, { recursive: true, force: true });
});

function tempRoot(): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "anvil-cli-v2-"));
  roots.push(root);
  return root;
}

function run(args: string[]): string {
  return execFileSync(process.execPath, [cli, ...args], { encoding: "utf8" });
}

function runResult(args: string[]): { status: number | null; stdout: string; stderr: string } {
  const r = spawnSync(process.execPath, [cli, ...args], { encoding: "utf8" });
  return { status: r.status, stdout: r.stdout, stderr: r.stderr };
}

function legacyRoot(id = "legacy-cli"): string {
  const root = tempRoot();
  fs.writeFileSync(
    path.join(root, "game.yaml"),
    `id: ${id}\ntitle: Legacy CLI\ngenre: none\nmodules: []\nentryScene: main\nschemaVersion: 1\n`,
  );
  return root;
}

describe("Anvil v2 CLI", () => {
  it("scaffolds, validates, describes, and reports capabilities", () => {
    const root = tempRoot();
    run(["new", "cli-test", "--root", root]);
    expect(fs.readFileSync(path.join(root, "game.yaml"), "utf8")).toContain("schemaVersion: 2");
    expect(fs.existsSync(path.join(root, "game.spec.yaml"))).toBe(true);

    expect(JSON.parse(run(["validate", root, "--json"]))).toMatchObject({ ok: true });
    const description = JSON.parse(run(["describe", root, "--json"]));
    // Reconciliation (T-M10-009): the spec fixes no scaffold requirement
    // count (S-SCHEMA §3 "at least one"; S-AUTHORING §4 shows an example).
    // The repo-wide baseline intent is the migrateProject default of THREE
    // requirements (lifecycle.start, input.responds, lifecycle.restart) —
    // see migrate.ts, every example/template game.spec.yaml, and the
    // "describes a migrated v2 project" case below asserting requirements: 3.
    // A fresh scaffold must describe identically to a fresh migration, so
    // the earlier placeholder value of 2 here was the wrong side.
    expect(description).toMatchObject({
      ok: true,
      manifest: { id: "cli-test", schemaVersion: 2 },
      counts: { requirements: 3 },
    });
    expect(description.sourceHash).toMatch(/^[0-9a-f]{64}$/);

    const capabilities = JSON.parse(run(["capabilities", root, "--json"]));
    expect(capabilities.capabilities.map((item: { id: string }) => item.id)).toEqual([
      "authoring-v2",
      "core",
    ]);
  });

  it("previews migration without mutation and applies it on request", () => {
    const root = tempRoot();
    fs.writeFileSync(
      path.join(root, "game.yaml"),
      "id: legacy-cli\ntitle: Legacy CLI\ngenre: none\nmodules: []\nentryScene: main\nschemaVersion: 1\n",
    );
    const before = fs.readFileSync(path.join(root, "game.yaml"), "utf8");
    const preview = JSON.parse(run(["migrate", root, "--json"]));
    expect(preview).toMatchObject({ ok: true, changed: true, written: false });
    expect(fs.readFileSync(path.join(root, "game.yaml"), "utf8")).toBe(before);

    const applied = JSON.parse(run(["migrate", root, "--write", "--json"]));
    expect(applied).toMatchObject({ ok: true, changed: true, written: true });
    expect(JSON.parse(run(["validate", root, "--json"]))).toMatchObject({ ok: true });
  });

  it("reports migrate no-op on an already-v2 project", () => {
    const root = legacyRoot("legacy-noop");
    run(["migrate", root, "--write", "--json"]);
    const again = JSON.parse(run(["migrate", root, "--json"]));
    expect(again).toMatchObject({
      ok: true,
      fromVersion: 2,
      toVersion: 2,
      changed: false,
      written: false,
      changes: [],
    });
  });

  it("fails migrate with a structured error when game.yaml is missing", () => {
    const root = tempRoot();
    const r = runResult(["migrate", root, "--json"]);
    expect(r.status).toBe(1);
    const body = JSON.parse(r.stdout);
    expect(body.ok).toBe(false);
    expect(body.errors[0]).toMatchObject({ code: "IO_ERROR" });
  });

  it("describes a migrated v2 project with hash, counts, and capabilities", () => {
    const root = legacyRoot("legacy-describe");
    run(["migrate", root, "--write", "--json"]);
    const description = JSON.parse(run(["describe", root, "--json"]));
    expect(description).toMatchObject({
      ok: true,
      irVersion: 1,
      schemaVersion: 2,
      manifest: { id: "legacy-describe", schemaVersion: 2 },
      counts: {
        requirements: 3,
        traits: 0,
        prefabs: 0,
        triggers: 0,
        machines: 0,
        content: 0,
      },
    });
    expect(description.sourceHash).toMatch(/^[0-9a-f]{64}$/);
    expect(description.capabilities.map((item: { id: string }) => item.id)).toEqual([
      "authoring-v2",
      "core",
    ]);
    // Determinism: repeated describe yields the same hash.
    expect(JSON.parse(run(["describe", root, "--json"])).sourceHash).toBe(description.sourceHash);
  });

  it("rejects describe on a v1 project with the migration diagnostic", () => {
    const root = legacyRoot("legacy-v1-describe");
    const r = runResult(["describe", root, "--json"]);
    expect(r.status).toBe(1);
    const body = JSON.parse(r.stdout);
    expect(body.ok).toBe(false);
    expect(body.errors[0]).toMatchObject({ code: "MIGRATION_REQUIRED" });
  });

  it("reports selected capability descriptors with JSON output", () => {
    const root = legacyRoot("legacy-capabilities");
    run(["migrate", root, "--write", "--json"]);
    const report = JSON.parse(run(["capabilities", root, "--json"]));
    expect(report.ok).toBe(true);
    expect(report.capabilities.map((item: { id: string }) => item.id)).toEqual([
      "authoring-v2",
      "core",
    ]);
    for (const descriptor of report.capabilities) {
      expect(descriptor).toMatchObject({
        id: expect.any(String),
        version: expect.any(String),
        kind: expect.any(String),
        summary: expect.any(String),
      });
      expect(Array.isArray(descriptor.provides)).toBe(true);
      expect(Array.isArray(descriptor.actions)).toBe(true);
    }
  });

  it("prints human-readable migrate preview without --json and without writing", () => {
    const root = legacyRoot("legacy-human");
    const before = fs.readFileSync(path.join(root, "game.yaml"), "utf8");
    const out = run(["migrate", root]);
    expect(out).toContain("Migration preview");
    expect(out).toContain("Re-run with --write to apply.");
    expect(fs.readFileSync(path.join(root, "game.yaml"), "utf8")).toBe(before);
  });

  it("scaffolds a valid ARPG project with the declarative runtime", () => {
    const root = tempRoot();
    run(["new", "agent-arpg", "--genre", "arpg", "--root", root]);
    const manifest = fs.readFileSync(path.join(root, "game.yaml"), "utf8");
    expect(manifest).toContain("genre: arpg");
    expect(manifest).toContain("genre-arpg");
    expect(JSON.parse(run(["validate", root, "--json"]))).toMatchObject({ ok: true });
    expect(JSON.parse(run(["test", root, "--json"]))).toMatchObject({ ok: true });
  });
});
