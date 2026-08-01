/**
 * SEC-1 — Module-containment Layer 2 (resolveContainedModule).
 * PREM-1: without the guard, path.resolve(root, "../x") escapes root (asserted).
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  ModuleContainmentError,
  resolveContainedModule,
} from "./loadModules.js";

const tmpRoots: string[] = [];

afterEach(() => {
  for (const t of tmpRoots.splice(0)) {
    fs.rmSync(t, { recursive: true, force: true });
  }
});

function makeTemp(): string {
  const t = fs.mkdtempSync(path.join(os.tmpdir(), "anvil-sec1-"));
  tmpRoots.push(t);
  return t;
}

describe("resolveContainedModule (SEC-1 Layer 2)", () => {
  it("PREM-1: naive path.resolve escapes root for ../ (defect shape)", () => {
    const root = makeTemp();
    const outside = path.resolve(root, "..", "outside-payload");
    const naive = path.resolve(root, "../outside-payload");
    expect(naive).toBe(outside);
    const rel = path.relative(root, naive);
    expect(rel.startsWith("..")).toBe(true);
  });

  it("rejects ../ escape with ModuleContainmentError", () => {
    const root = makeTemp();
    fs.mkdirSync(path.join(root, "ok"), { recursive: true });
    expect(() => resolveContainedModule(root, "../outside/x")).toThrow(
      ModuleContainmentError,
    );
    try {
      resolveContainedModule(root, "../outside/x");
    } catch (e) {
      expect(e).toBeInstanceOf(ModuleContainmentError);
      const err = e as ModuleContainmentError;
      expect(err.id).toBe("../outside/x");
      expect(err.name).toBe("ModuleContainmentError");
    }
  });

  it("rejects absolute and drive-like ids", () => {
    const root = makeTemp();
    expect(() => resolveContainedModule(root, "/etc/passwd")).toThrow(
      ModuleContainmentError,
    );
    expect(() => resolveContainedModule(root, "C:\\Windows\\x")).toThrow(
      ModuleContainmentError,
    );
  });

  it("allows in-root relative path when file exists under root", () => {
    const root = makeTemp();
    const modDir = path.join(root, "mods");
    fs.mkdirSync(modDir, { recursive: true });
    const file = path.join(modDir, "safe.js");
    fs.writeFileSync(file, "export default {};\n");
    const abs = resolveContainedModule(root, "./mods/safe.js");
    expect(abs).toBe(fs.realpathSync(file));
    const rel = path.relative(fs.realpathSync(root), abs);
    expect(rel.startsWith("..")).toBe(false);
  });

  it("rejects empty id", () => {
    const root = makeTemp();
    expect(() => resolveContainedModule(root, "")).toThrow(
      ModuleContainmentError,
    );
  });

  it("symlink/junction out of root is refused when platform allows symlinks", () => {
    const outer = makeTemp();
    const root = path.join(outer, "game");
    const outside = path.join(outer, "evil");
    fs.mkdirSync(root, { recursive: true });
    fs.mkdirSync(outside, { recursive: true });
    const payload = path.join(outside, "payload.js");
    fs.writeFileSync(payload, "export default {};\n");
    const link = path.join(root, "trap");
    try {
      fs.symlinkSync(outside, link, "dir");
    } catch {
      // Windows without symlink privilege — skip
      return;
    }
    if (!fs.lstatSync(link).isSymbolicLink()) return;
    expect(() =>
      resolveContainedModule(root, "./trap/payload.js"),
    ).toThrow(ModuleContainmentError);
  });
});
