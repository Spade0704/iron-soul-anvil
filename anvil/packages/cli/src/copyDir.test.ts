/**
 * Regression: symlink-to-directory must copy TARGET contents (dereference).
 *
 * Rule 9b: use a REAL symlink fixture — do not mock Dirent. The defect is that
 * the entry model and the filesystem disagree; a mock reproduces the bug.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { copyDir } from "./copyDir.js";

const tmpRoots: string[] = [];

afterEach(() => {
  for (const t of tmpRoots.splice(0)) {
    fs.rmSync(t, { recursive: true, force: true });
  }
});

function makeTemp(): string {
  const t = fs.mkdtempSync(path.join(os.tmpdir(), "anvil-copydir-"));
  tmpRoots.push(t);
  return t;
}

function canMakeSymlink(): boolean {
  const t = fs.mkdtempSync(path.join(os.tmpdir(), "anvil-symlink-probe-"));
  const target = path.join(t, "target");
  const link = path.join(t, "link");
  fs.mkdirSync(target);
  try {
    fs.symlinkSync(target, link, "dir");
    const ok = fs.lstatSync(link).isSymbolicLink() && fs.statSync(link).isDirectory();
    fs.rmSync(t, { recursive: true, force: true });
    return ok;
  } catch {
    fs.rmSync(t, { recursive: true, force: true });
    return false;
  }
}

const SYMLINKS_OK = canMakeSymlink();

describe("copyDir (dereference)", () => {
  it.skipIf(!SYMLINKS_OK)(
    "copies through a real symlink-to-directory (not EISDIR)",
    () => {
      const root = makeTemp();
      const real = path.join(root, "real-audio");
      const src = path.join(root, "assets");
      const dest = path.join(root, "out");
      fs.mkdirSync(real, { recursive: true });
      fs.writeFileSync(path.join(real, "tone.ogg"), "FAKE-OGG-BYTES");
      fs.mkdirSync(path.join(real, "music"), { recursive: true });
      fs.writeFileSync(path.join(real, "music", "loop.mp3"), "FAKE-MP3");
      fs.mkdirSync(src);
      // REAL symlink — not a mocked Dirent
      fs.symlinkSync(real, path.join(src, "audio"), "dir");
      fs.writeFileSync(path.join(src, "manifest.yaml"), "ok: true\n");

      expect(fs.lstatSync(path.join(src, "audio")).isSymbolicLink()).toBe(true);
      expect(fs.statSync(path.join(src, "audio")).isDirectory()).toBe(true);

      copyDir(src, dest);

      // Dest must contain real files, not a dangling or preserved symlink
      expect(fs.lstatSync(path.join(dest, "audio")).isSymbolicLink()).toBe(false);
      expect(fs.statSync(path.join(dest, "audio")).isDirectory()).toBe(true);
      expect(fs.readFileSync(path.join(dest, "audio", "tone.ogg"), "utf8")).toBe(
        "FAKE-OGG-BYTES",
      );
      expect(
        fs.readFileSync(path.join(dest, "audio", "music", "loop.mp3"), "utf8"),
      ).toBe("FAKE-MP3");
      expect(fs.readFileSync(path.join(dest, "manifest.yaml"), "utf8")).toBe(
        "ok: true\n",
      );
    },
  );

  it.skipIf(!SYMLINKS_OK)("copies through a real symlink-to-file", () => {
    const root = makeTemp();
    const realFile = path.join(root, "secret.txt");
    const src = path.join(root, "assets");
    const dest = path.join(root, "out");
    fs.writeFileSync(realFile, "payload");
    fs.mkdirSync(src);
    fs.symlinkSync(realFile, path.join(src, "link.txt"), "file");

    copyDir(src, dest);

    expect(fs.lstatSync(path.join(dest, "link.txt")).isSymbolicLink()).toBe(false);
    expect(fs.readFileSync(path.join(dest, "link.txt"), "utf8")).toBe("payload");
  });

  it("plain directory (no symlink) still copies", () => {
    const root = makeTemp();
    const src = path.join(root, "assets");
    const dest = path.join(root, "out");
    fs.mkdirSync(path.join(src, "sub"), { recursive: true });
    fs.writeFileSync(path.join(src, "a.txt"), "A");
    fs.writeFileSync(path.join(src, "sub", "b.txt"), "B");

    copyDir(src, dest);

    expect(fs.readFileSync(path.join(dest, "a.txt"), "utf8")).toBe("A");
    expect(fs.readFileSync(path.join(dest, "sub", "b.txt"), "utf8")).toBe("B");
  });

  it("documents visible skip when OS cannot create symlinks", () => {
    // Always-green companion so a platform without symlink rights does not
    // silently drop the regression suite — the skipIf cases log as skipped.
    if (!SYMLINKS_OK) {
      // eslint-disable-next-line no-console
      console.warn(
        "[copyDir.test] SYMLINK FIXTURES SKIPPED: platform cannot create symlinks",
      );
    }
    expect(typeof SYMLINKS_OK).toBe("boolean");
  });
});
