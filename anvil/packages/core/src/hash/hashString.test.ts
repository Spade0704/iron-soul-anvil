import { describe, expect, it } from "vitest";
import { hashString } from "./hashString.js";

describe("hashString (FNV-1a)", () => {
  it("matches external reference vectors", () => {
    // Independent FNV-1a 32-bit fixtures (offset basis 0x811c9dc5, prime 0x01000193)
    expect(hashString("")).toBe("811c9dc5");
    expect(hashString("a")).toBe("e40c292c");
    expect(hashString("foobar")).toBe("bf9cf968");
  });

  it("is deterministic and length-sensitive", () => {
    expect(hashString("ss1-payload")).toBe(hashString("ss1-payload"));
    expect(hashString("x")).not.toBe(hashString("y"));
  });
});
