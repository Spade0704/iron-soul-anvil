import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  type GameYaml,
  GameYamlSchema,
  normalizeModules,
} from "@anvil/schema";
import type { GenreModule } from "@anvil/core";
import yaml from "yaml";

/**
 * SEC-1 / MODULE_TRUST_POSTURE Layer 2 — path escape on module load.
 * Containment is not trust; it stops misconfiguration and `../` agent slips.
 */
export class ModuleContainmentError extends Error {
  readonly id: string;
  readonly abs: string;
  readonly root: string;

  constructor(message: string, id: string, abs: string, root: string) {
    super(message);
    this.name = "ModuleContainmentError";
    this.id = id;
    this.abs = abs;
    this.root = root;
  }
}

/**
 * Resolve a module filesystem path that must stay under `root`.
 * Form-checks absolute/drive/UNC/NUL, then realpath containment.
 */
export function resolveContainedModule(root: string, id: string): string {
  if (id == null || typeof id !== "string" || id.length === 0) {
    throw new ModuleContainmentError(
      "module id is empty",
      String(id ?? ""),
      "",
      root,
    );
  }
  if (id.includes("\0")) {
    throw new ModuleContainmentError(
      "module id contains NUL",
      id,
      "",
      root,
    );
  }
  // Absolute / drive-relative / UNC — never load from outside root via id form.
  if (
    path.isAbsolute(id) ||
    /^[a-zA-Z]:[\\/]/.test(id) ||
    id.startsWith("\\\\") ||
    id.startsWith("//")
  ) {
    throw new ModuleContainmentError(
      `module id must not be absolute or drive-relative: ${id}`,
      id,
      id,
      root,
    );
  }

  let rootReal: string;
  try {
    rootReal = fs.realpathSync(root);
  } catch {
    throw new ModuleContainmentError(
      `module root is not resolvable: ${root}`,
      id,
      "",
      root,
    );
  }

  const candidate = path.resolve(rootReal, id);
  let absReal: string;
  try {
    absReal = fs.realpathSync(candidate);
  } catch {
    // File may not exist yet — still enforce path geometry under root.
    absReal = path.normalize(candidate);
  }

  const rel = path.relative(rootReal, absReal);
  if (rel.startsWith("..") || path.isAbsolute(rel)) {
    throw new ModuleContainmentError(
      `module path escapes project root: id=${id}`,
      id,
      absReal,
      rootReal,
    );
  }
  return absReal;
}

export function readGameYaml(root: string): GameYaml {
  const raw = yaml.parse(
    fs.readFileSync(path.join(root, "game.yaml"), "utf8"),
  );
  return GameYamlSchema.parse(raw);
}

export async function loadModulesForRoot(root: string): Promise<GenreModule[]> {
  const game = readGameYaml(root);
  return loadModulesForGame(game, root);
}

export async function loadModulesForGame(
  game: GameYaml,
  root = process.cwd(),
): Promise<GenreModule[]> {
  const ids = normalizeModules(game.genre, game.modules);
  const out: GenreModule[] = [];
  for (const id of ids) {
    if (id.startsWith("./") || id.startsWith("../")) {
      // SEC-1: containment BEFORE import (Layer 2)
      const abs = resolveContainedModule(root, id);
      const mod = await import(pathToFileURL(abs).href);
      const gmod: GenreModule | undefined =
        mod.default ?? mod.gravewakeModule ?? mod.module;
      if (!gmod || typeof gmod.register !== "function") {
        throw new Error(
          `Relative module ${id} must export default GenreModule (or gravewakeModule)`,
        );
      }
      out.push(gmod);
      continue;
    }
    if (id === "genre-card") {
      const m = await import("@anvil/genre-card");
      out.push(m.cardModule);
    } else if (id === "genre-topdown2d") {
      const m = await import("@anvil/genre-topdown2d");
      out.push(m.topdownModule);
    } else if (id === "genre-vn") {
      const m = await import("@anvil/genre-vn");
      out.push(m.vnModule);
    } else if (id === "genre-shmup") {
      const m = await import("@anvil/genre-shmup");
      out.push(m.shmupModule);
    } else if (id === "genre-fps2") {
      const m = await import("@anvil/genre-fps2");
      out.push(m.fps2Module);
    } else if (id === "genre-arpg") {
      const m = await import("@anvil/genre-arpg");
      out.push(m.arpgModule);
    } else if (id === "genre-net") {
      const m = await import("@anvil/genre-net");
      out.push(m.netModule);
    }
  }
  return out;
}
