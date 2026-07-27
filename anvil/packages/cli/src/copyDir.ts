/**
 * Directory tree copy for packaging (`anvil build` data packages).
 *
 * dir-20260727-anvil-cli-symlink-copy: DEREFERENCE symlinks.
 * Dirent describes the ENTRY; packaging must branch on the TARGET (stat).
 * A build artifact must be self-contained â€” relative symlinks out of the dist
 * tree fail silently at serve time.
 *
 * Note: fs.cpSync({ dereference: true }) was checked on Node 24 / Windows and
 * still preserved directory reparse points in dest; the hand-rolled path uses
 * statSync + copyFileSync so dest never retains symlinks.
 */
import fs from "node:fs";
import path from "node:path";

/**
 * Copy `src` directory into `dest`, following symlinks and writing real files.
 */
export function copyDir(src: string, dest: string): void {
  fs.mkdirSync(dest, { recursive: true });
  for (const ent of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, ent.name);
    const d = path.join(dest, ent.name);
    // TARGET identity (follows symlinks) â€” not Dirent.isDirectory() (entry only).
    const st = fs.statSync(s);
    if (st.isDirectory()) {
      copyDir(s, d);
    } else {
      fs.copyFileSync(s, d);
    }
  }
}
