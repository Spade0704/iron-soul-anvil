import { describe, expect, it } from "vitest";
import { SeededRng } from "./SeededRng.js";

/** Gravewake canary: seed 42 first-10 vector must stay byte-identical to pre-G0 mulberry32. */
const SEED_42_FIRST_10 = [
  0.6011037519201636, 0.44829055899754167, 0.8524657934904099,
  0.6697340414393693, 0.17481389874592423, 0.5265925421845168,
  0.2732279943302274, 0.6247446539346129, 0.8654746483080089,
  0.4723170551005751,
] as const;

function seq(seed: number, n: number): number[] {
  const r = new SeededRng(seed);
  return Array.from({ length: n }, () => r.random());
}

describe("SeededRng", () => {
  it("seeds 0 and 1 produce different sequences", () => {
    const a = seq(0, 16);
    const b = seq(1, 16);
    expect(a).not.toEqual(b);
  });

  it("gravewake canary: seed 42 output vector unchanged", () => {
    const got = seq(42, 10);
    expect(got).toEqual([...SEED_42_FIRST_10]);
  });

  it("same seed is deterministic", () => {
    expect(seq(99, 8)).toEqual(seq(99, 8));
  });

  it("stream is call-order independent (pure of rootSeed+name)", () => {
    const root = new SeededRng(7);
    const a1 = root.stream("sim");
    const a2 = root.stream("opponent");
    // Draws on root must not affect stream() purity
    root.random();
    root.random();
    const b1 = root.stream("sim");
    const b2 = root.stream("opponent");
    expect(seqFrom(a1, 12)).toEqual(seqFrom(b1, 12));
    expect(seqFrom(a2, 12)).toEqual(seqFrom(b2, 12));
    // Different names → different streams
    expect(seqFrom(a1, 12)).not.toEqual(seqFrom(a2, 12));
  });

  it("fork isolation: parent sequence matches no-fork run up to fork point; child independent", () => {
    const control = new SeededRng(123);
    const parent = new SeededRng(123);
    for (let i = 0; i < 5; i++) {
      expect(parent.random()).toBe(control.random());
    }
    const child = parent.fork();
    // fork() already advanced parent once — align control with one draw
    control.random();

    const childSeq = seqFrom(child, 20);
    const parentCont = seqFrom(parent, 20);
    const controlCont = seqFrom(control, 20);
    expect(parentCont).toEqual(controlCont);
    expect(childSeq).not.toEqual(parentCont);

    // Re-fork at same point → same parent continuation
    const parent2 = new SeededRng(123);
    for (let i = 0; i < 5; i++) parent2.random();
    parent2.fork();
    expect(seqFrom(parent2, 10)).toEqual(parentCont.slice(0, 10));
  });

  it("fork advances parent (call-order dependent)", () => {
    const early = new SeededRng(55);
    for (let i = 0; i < 3; i++) early.random();
    const childEarly = early.fork();

    const late = new SeededRng(55);
    for (let i = 0; i < 8; i++) late.random();
    const childLate = late.fork();

    expect(seqFrom(childEarly, 8)).not.toEqual(seqFrom(childLate, 8));
  });

  it("child-seed collision/correlation sweep across labels", () => {
    const root = new SeededRng(42);
    const starts = new Set<number>();
    for (let i = 0; i < 10_000; i++) {
      const child = root.stream(`label-${i}`);
      // peek first u32-ish via random scaled — use internal via first draw uniqueness
      starts.add(child.random());
    }
    // Expect high uniqueness of first draws (collision rate << naive birthday on 10k)
    expect(starts.size).toBeGreaterThan(9_900);
  });

  it("getState returns state >>> 0 and is read-only (no setter)", () => {
    const r = new SeededRng(42);
    expect(typeof r.getState()).toBe("number");
    expect(r.getState()).toBe(r.getState() >>> 0);
    // No restore/setter surface on the public API.
    expect("setState" in r).toBe(false);
    expect(
      Object.getOwnPropertyDescriptor(SeededRng.prototype, "getState")?.set,
    ).toBeUndefined();
  });

  /**
   * STATE canary: representation-preserving output changes that alter
   * `state mod 2^32` must trip here (stored hashes depend on getState).
   * Seed 42, 100 draws — constant recorded against mulberry32 as of ARENA-1.
   */
  it("getState canary: seed 42 after 100 draws is stable", () => {
    const r = new SeededRng(42);
    for (let i = 0; i < 100; i++) r.random();
    // Fixed-width u32; update only with a conscious stored-hash migration.
    expect(r.getState()).toBe(((0x6d2b79f5 * 100 + 42) >>> 0));
  });

  it("getState twin: reseeding to state>>>0 matches continuation while state < 2^32", () => {
    // One draw from seed 1: state = 1 + 0x6d2b79f5 = 0x6d2b79f6 (< 2^32).
    const short = new SeededRng(1);
    short.random();
    const s = short.getState();
    expect(s).toBe(0x6d2b79f6);
    const cont = seqFrom(short, 16);
    const twin = new SeededRng(s);
    expect(seqFrom(twin, 16)).toEqual(cont);
  });
});

function seqFrom(r: SeededRng, n: number): number[] {
  return Array.from({ length: n }, () => r.random());
}
