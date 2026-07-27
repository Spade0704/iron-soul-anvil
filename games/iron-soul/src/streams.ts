/**
 * RNG-1a stream surface — frozen label set + per-sim createStreams.
 *
 * Root SeededRng is module-private and never escapes. Streams are built once
 * per sim, stored on sim state (not a module-level const). Labels are the
 * sixth schema commitment (RNG-4); renames are forbidden.
 *
 * Spec: wiki.project_iron_soul …/anvil-arena-autobattler-design.md §6.1.1
 *
 * Bounds: assertStreamsWithinCliff uses SeededRng.isStateExact() — not a
 * per-draw counter. getState() is masked (>>> 0) and cannot recover n; the
 * cliff IS loss of integer exactness on the unmasked accumulator.
 */
import { SeededRng } from "@anvil/core";

/**
 * Frozen v0.1 label set (flat kebab). Adopt shipped `sim`/`opponent` as-is —
 * golden.json ss1:be646bd7 is pinned to those strings. Do not rename.
 */
export const STREAM_LABELS = [
  "sim",
  "opponent",
  "shop",
  "crit",
  "bow-check",
  "override",
] as const;

export type StreamLabel = (typeof STREAM_LABELS)[number];

export type StreamBag = Readonly<Record<StreamLabel, SeededRng>>;

/**
 * mulberry32 canonicity cliff: floor(2^53 / 0x6d2b79f5).
 * Documentation + error text — not a comparison operand.
 * Number.isSafeInteger(state) flips false at draw 4,917,759 (one past this);
 * first masked-vs-unmasked divergence is at 4,917,760.
 * Headroom is UNCOMPUTED (pending §13); do not invent a multiple here.
 */
export const MULBERRY32_CANONICITY_CLIFF = 4_917_758;

/**
 * Build every named stream once from the run seed. Root never escapes.
 * Construction-order independent (stream is pure over rootSeed+label).
 * Returns plain SeededRng instances — no Proxy, no per-draw counter.
 */
export function createStreams(rootSeed: number): StreamBag {
  const root = new SeededRng(rootSeed >>> 0);
  const record = {} as Record<StreamLabel, SeededRng>;
  for (const label of STREAM_LABELS) {
    // Eager once-at-init (RNG-1). Never call .stream() in per-tick paths.
    record[label] = root.stream(label);
  }
  // Root dropped here — no field, no return, no export.
  const streams = Object.freeze(record) as StreamBag;
  assertStreamKeys(streams);
  return streams;
}

/** Object.keys(streams) must deep-equal STREAM_LABELS (insertion order). */
export function assertStreamKeys(streams: StreamBag): void {
  const keys = Object.keys(streams);
  if (keys.length !== STREAM_LABELS.length) {
    throw new Error(
      `createStreams: key count ${keys.length} !== STREAM_LABELS ${STREAM_LABELS.length}`,
    );
  }
  for (let i = 0; i < STREAM_LABELS.length; i++) {
    if (keys[i] !== STREAM_LABELS[i]) {
      throw new Error(
        `createStreams: keys ${JSON.stringify(keys)} !== STREAM_LABELS ${JSON.stringify(STREAM_LABELS)}`,
      );
    }
  }
}

/**
 * One comparison per stream per run (not per draw): accumulator still exact.
 * Uses isStateExact() — fails safe one draw before first real divergence.
 * Demonstrably fires — see streams.test.ts.
 */
export function assertStreamsWithinCliff(streams: StreamBag): void {
  for (const label of STREAM_LABELS) {
    if (!streams[label].isStateExact()) {
      throw new Error(
        `stream '${label}' passed the mulberry32 canonicity cliff ` +
          `(~${MULBERRY32_CANONICITY_CLIFF} draws): accumulator no longer exact`,
      );
    }
  }
}

/**
 * Hash input for RNG position: sorted (label, state) pairs, fixed-width u32.
 * Reordering STREAM_LABELS must be a no-op (sort by label string).
 */
export function streamStatePairs(
  streams: StreamBag,
): ReadonlyArray<readonly [StreamLabel, string]> {
  const labels = [...STREAM_LABELS].sort();
  return labels.map((label) => {
    const u32 = streams[label].getState() >>> 0;
    return [label, u32.toString(16).padStart(8, "0")] as const;
  });
}

export function canonicalizeStreamStates(streams: StreamBag): string {
  const pairs = streamStatePairs(streams);
  return `{${pairs.map(([l, s]) => `${JSON.stringify(l)}:${JSON.stringify(s)}`).join(",")}}`;
}
