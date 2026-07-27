/**
 * RNG-5 freeze-set gate + createStreams / bounds assertion.
 *
 * IMPORTS STREAM_LABELS from the production constant — does not declare a copy.
 * A gate guarding a local copy can go green over a set that no longer describes the sim.
 *
 * Compares observed draw sequences (not mere child seeds) so path-3
 * initialState(0) folds are caught. s* is derived via splitmix32Inverse.
 */
import { describe, expect, it } from "vitest";
import { SeededRng, splitmix32, hashString } from "@anvil/core";
import {
  STREAM_LABELS,
  MULBERRY32_CANONICITY_CLIFF,
  assertStreamsWithinCliff,
  canonicalizeStreamStates,
  createStreams,
  streamStatePairs,
  type StreamLabel,
} from "./streams.js";

const GOLDEN = 0x9e3779b9;
const DRAWS = 8;

/** Local mirror of SeededRng's module-private labelHash. Validated below. */
function labelHash(name: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < name.length; i++) {
    h ^= name.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function invOdd(m: number): number {
  let inv = m;
  for (let i = 0; i < 5; i++) inv = Math.imul(inv, 2 - Math.imul(m, inv));
  return inv >>> 0;
}

function unXorShift(y: number, shift: number): number {
  let x = y >>> 0;
  for (let i = 0; i < Math.ceil(32 / shift); i++) x = (y ^ (x >>> shift)) >>> 0;
  return x >>> 0;
}

function splitmix32Inverse(out: number): number {
  let z = unXorShift(out >>> 0, 16);
  z = Math.imul(z, invOdd(0xc2b2ae35));
  z = unXorShift(z >>> 0, 13);
  z = Math.imul(z, invOdd(0x85ebca6b));
  z = unXorShift(z >>> 0, 16);
  return (z - GOLDEN) >>> 0;
}

function draws(rng: SeededRng, n = DRAWS): number[] {
  return Array.from({ length: n }, () => rng.random());
}

function streamDraws(rootSeed: number, label: string): number[] {
  return draws(new SeededRng(rootSeed).stream(label));
}

describe("createStreams (RNG-1a)", () => {
  it("Object.keys(streams) deep-equals STREAM_LABELS", () => {
    const streams = createStreams(42);
    expect(Object.keys(streams)).toEqual([...STREAM_LABELS]);
  });

  it("returns frozen record; root never escapes as a key", () => {
    const streams = createStreams(7);
    expect(Object.isFrozen(streams)).toBe(true);
    expect("root" in streams).toBe(false);
    for (const label of STREAM_LABELS) {
      expect(streams[label]).toBeInstanceOf(SeededRng);
    }
  });

  it("sim/opponent match pure stream() sequences (golden-preserving)", () => {
    const seed = 42;
    const streams = createStreams(seed);
    const simRef = new SeededRng(seed).stream("sim");
    const oppRef = new SeededRng(seed).stream("opponent");
    expect(draws(streams.sim, 20)).toEqual(draws(simRef, 20));
    expect(draws(streams.opponent, 20)).toEqual(draws(oppRef, 20));
  });

  it("per-sim: two createStreams instances do not share generator position", () => {
    const a = createStreams(99);
    const b = createStreams(99);
    a.sim.random();
    a.sim.random();
    // a advanced; b still at draw 0 sequence-wise (independent instances)
    expect(draws(b.sim, 5)).toEqual(draws(new SeededRng(99).stream("sim"), 5));
    // a is not at the same position as a fresh stream
    expect(draws(a.sim, 5)).not.toEqual(draws(new SeededRng(99).stream("sim"), 5));
  });

  it("stream-state hash is order-independent (sorted label,state pairs)", () => {
    const streams = createStreams(42);
    streams.crit.random();
    streams.shop.random();
    const canon = canonicalizeStreamStates(streams);
    const pairs = streamStatePairs(streams);
    // Sorted by label string, not STREAM_LABELS array order.
    const labels = pairs.map(([l]) => l);
    expect(labels).toEqual([...labels].sort());
    // Fixed-width u32 hex
    for (const [, s] of pairs) {
      expect(s).toMatch(/^[0-9a-f]{8}$/);
    }
    // Re-hash stable
    expect(canonicalizeStreamStates(streams)).toBe(canon);
    expect(hashString(canon).length).toBe(8);
  });
});

describe("canonicity-cliff bounds assertion (isStateExact)", () => {
  it("passes under a normal short run", () => {
    const streams = createStreams(1);
    for (let i = 0; i < 1000; i++) streams.sim.random();
    expect(streams.sim.isStateExact()).toBe(true);
    expect(() => assertStreamsWithinCliff(streams)).not.toThrow();
  });

  it(
    "demonstrably fires when a stream exceeds the canonicity cliff",
    () => {
      const streams = createStreams(1);
      // Honest full-length run: real mulberry draws until past the cliff.
      // isStateExact flips false at draw 4,917,759 (cliff doc value + 1).
      // No Proxy — plain SeededRng ~3 ns/draw; ~15 ms for 4.92M draws.
      const need = MULBERRY32_CANONICITY_CLIFF + 1;
      for (let i = 0; i < need; i++) streams.sim.random();
      expect(streams.sim.isStateExact()).toBe(false);
      expect(() => assertStreamsWithinCliff(streams)).toThrow(
        /passed the mulberry32 canonicity cliff/,
      );
    },
    60_000,
  );
});

describe("RNG-5 freeze-set gate (imports STREAM_LABELS)", () => {
  // Gate uses the production constant — not a local mirror of the label list.
  const LABELS: readonly StreamLabel[] = STREAM_LABELS;
  const sStar = splitmix32Inverse(0);

  it("splitmix32Inverse actually inverts splitmix32", () => {
    for (const v of [0, 1, 42, 0x7fffffff, 0xdeadbeef, GOLDEN, 0xffffffff]) {
      expect(splitmix32(splitmix32Inverse(v >>> 0))).toBe(v >>> 0);
    }
    expect(splitmix32(sStar)).toBe(0);
  });

  it("mirror is faithful: both degenerate branches reach the fold sequence", () => {
    const foldSeq = draws(new SeededRng(splitmix32(GOLDEN)));
    for (const label of LABELS) {
      const h = labelHash(label);
      expect(streamDraws(h, label)).toEqual(foldSeq);
      expect(streamDraws((h ^ sStar) >>> 0, label)).toEqual(foldSeq);
    }
  });

  it("no two labels share a sequence at any degenerate root seed", () => {
    const candidates = new Set<number>();
    for (const label of LABELS) {
      const h = labelHash(label);
      candidates.add(h >>> 0);
      candidates.add((h ^ sStar) >>> 0);
    }
    for (const rootSeed of candidates) {
      const seen = new Map<string, string>();
      for (const label of LABELS) {
        const key = streamDraws(rootSeed, label).join(",");
        const prior = seen.get(key);
        expect(
          prior,
          `labels '${prior}' and '${label}' share a sequence at rootSeed 0x${(
            rootSeed >>> 0
          )
            .toString(16)
            .padStart(8, "0")}`,
        ).toBeUndefined();
        seen.set(key, label);
      }
    }
  });

  it("the gate catches a known-bad label pair (path-3 regression)", () => {
    const a = "aaaq";
    const b = "qdih-roll";
    expect(labelHash(a)).not.toBe(labelHash(b));
    expect((labelHash(a) ^ labelHash(b)) >>> 0).not.toBe(GOLDEN);
    const rootSeed = (labelHash(a) ^ sStar) >>> 0;
    expect(streamDraws(rootSeed, a)).toEqual(streamDraws(rootSeed, b));
  });

  it("labels are flat kebab-case; no duplicates; settled hashes", () => {
    for (const label of LABELS) expect(label).toMatch(/^[a-z][a-z0-9-]*$/);
    expect(new Set(LABELS).size).toBe(LABELS.length);
    // Independent hash check for the frozen six (FNV-1a 32).
    expect(labelHash("sim")).toBe(0xdd302594);
    expect(labelHash("opponent")).toBe(0x43bb9764);
    expect(labelHash("shop")).toBe(0xa847e0a9);
    expect(labelHash("crit")).toBe(0x9654058d);
    expect(labelHash("bow-check")).toBe(0xc885b452);
    expect(labelHash("override")).toBe(0xc4b95c3d);
  });

  it("explicit: no pair XORs to the three forbidden deltas", () => {
    const forbidden = new Set([0x9e3779b9, 0x61c88647, 0xfffffffe]);
    for (let i = 0; i < LABELS.length; i++) {
      for (let j = i + 1; j < LABELS.length; j++) {
        const d = (labelHash(LABELS[i]!) ^ labelHash(LABELS[j]!)) >>> 0;
        expect(forbidden.has(d)).toBe(false);
        expect(labelHash(LABELS[i]!)).not.toBe(labelHash(LABELS[j]!));
      }
    }
  });
});
