import { describe, expect, it } from "vitest";
import { canonicalize } from "./serialize.js";
import { hashSimState } from "./hash.js";

describe("canonicalize (module serializer)", () => {
  it("throws on NaN", () => {
    expect(() => canonicalize({ x: NaN })).toThrow(/NaN/);
  });

  it("throws on non-integer float", () => {
    expect(() => canonicalize({ x: 1.5 })).toThrow(/non-integer/);
  });

  it("throws on -0", () => {
    expect(() => canonicalize({ x: -0 })).toThrow(/-0/);
  });

  it("throws on undefined", () => {
    expect(() => canonicalize({ x: undefined })).toThrow(/undefined/);
  });

  it("throws on Map", () => {
    expect(() => canonicalize(new Map())).toThrow(/Map/);
  });

  it("throws on Set", () => {
    expect(() => canonicalize(new Set())).toThrow(/Set/);
  });

  it("sorts object keys stably", () => {
    expect(canonicalize({ b: 1, a: 2 })).toBe(canonicalize({ a: 2, b: 1 }));
  });

  it("hashSimState prefixes ss1:", () => {
    const h = hashSimState({ tick: 0, phase: "PREP", units: [] });
    expect(h.startsWith("ss1:")).toBe(true);
    expect(h.length).toBe(12); // "ss1:" + 8 hex digits
  });
});
