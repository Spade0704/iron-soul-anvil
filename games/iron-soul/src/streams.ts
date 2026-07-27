/**
 * RNG-1a stream surface — frozen label set + per-sim createStreams.
 *
 * Root SeededRng is module-private and never escapes. Streams are built once
 * per sim, stored on sim state (not a module-level const). Labels are the
 * sixth schema commitment (RNG-4); renames are forbidden.
 *
 * Spec: wiki.project_iron_soul …/anvil-arena-autobattler-design.md §6.1.1
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
 * Past this many draws per generator the unmasked accumulator stops being
 * exact and the generator silently stops matching reference mulberry32.
 * Headroom is UNCOMPUTED (pending §13); do not invent a multiple here.
 */
export const MULBERRY32_CANONICITY_CLIFF = 4_917_758;

const drawCounts = new WeakMap<SeededRng, { n: number }>();

function track(inner: SeededRng): SeededRng {
  const counter = { n: 0 };
  const proxy = new Proxy(inner, {
    get(target, prop, receiver) {
      if (prop === "random") {
        return () => {
          counter.n += 1;
          return target.random();
        };
      }
      const val = Reflect.get(target, prop, receiver);
      if (typeof val === "function") {
        return (val as (...args: unknown[]) => unknown).bind(receiver);
      }
      return val;
    },
  }) as SeededRng;
  drawCounts.set(proxy, counter);
  return proxy;
}

/**
 * Build every named stream once from the run seed. Root never escapes.
 * Construction-order independent (stream is pure over rootSeed+label).
 */
export function createStreams(rootSeed: number): StreamBag {
  const root = new SeededRng(rootSeed >>> 0);
  const record = {} as Record<StreamLabel, SeededRng>;
  for (const label of STREAM_LABELS) {
    // Eager once-at-init (RNG-1). Never call .stream() in per-tick paths.
    record[label] = track(root.stream(label));
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

export function getStreamDrawCount(rng: SeededRng): number {
  return drawCounts.get(rng)?.n ?? 0;
}

/**
 * One comparison per run (not per draw): no stream may exceed the canonicity cliff.
 * Demonstrably fires — see streams.test.ts.
 */
export function assertStreamsWithinCliff(streams: StreamBag): void {
  for (const label of STREAM_LABELS) {
    const n = getStreamDrawCount(streams[label]);
    if (n > MULBERRY32_CANONICITY_CLIFF) {
      throw new Error(
        `stream '${label}' exceeded mulberry32 canonicity cliff: ${n} draws > ${MULBERRY32_CANONICITY_CLIFF}`,
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
