import { hashString } from "@anvil/core";
import { canonicalize } from "./serialize.js";

/** Versioned sim-state hash: algorithm+version prefix + FNV-1a of canonical form. */
export function hashSimState(snapshot: unknown): string {
  return `ss1:${hashString(canonicalize(snapshot))}`;
}
