/**
 * Mulberry32 — deterministic [0,1).
 *
 * G0 (B1): additive stream/fork surface. Algorithm frozen as mulberry32.
 * Seed 0 historically aliased to seed 1 (`state = 0` coerced to 1). Fixed by
 * mapping seed 0 to a dedicated non-1 initial state; all other seeds preserve
 * prior output vectors (gravewake canary).
 */

/** splitmix32 — used for seed derivation only (stream labels / fork). */
export function splitmix32(x: number): number {
  let z = (x + 0x9e3779b9) >>> 0;
  z = Math.imul(z ^ (z >>> 16), 0x85ebca6b);
  z = Math.imul(z ^ (z >>> 13), 0xc2b2ae35);
  return (z ^ (z >>> 16)) >>> 0;
}

function labelHash(name: string): number {
  // FNV-1a 32-bit over UTF-16 code units (JS string)
  let h = 0x811c9dc5;
  for (let i = 0; i < name.length; i++) {
    h ^= name.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function initialState(seed: number): number {
  const s = seed >>> 0;
  if (s === 0) {
    // Historical: `if (state === 0) state = 1` made seed 0 === seed 1.
    // Dedicated scramble so seed 0 diverges; never land on 0 or 1.
    let d = splitmix32(0x9e3779b9);
    if (d === 0 || d === 1) d = 0xa5a5a5a5;
    return d;
  }
  return s;
}

export class SeededRng {
  private state: number;
  /** Immutable construction seed (for pure stream() derivation). */
  private readonly rootSeed: number;

  constructor(seed: number) {
    this.rootSeed = seed >>> 0;
    this.state = initialState(seed);
  }

  random(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  randomInt(min: number, maxExclusive: number): number {
    return min + Math.floor(this.random() * (maxExclusive - min));
  }

  /**
   * Read-only view of the mulberry32 accumulator, masked to u32.
   *
   * `this.state` is an unmasked accumulating JS double (not a u32). Only the
   * low 32 bits reach the output path, so the accessor MUST apply `>>> 0`.
   * No setter / restore — mid-run resume is a separate decision.
   */
  getState(): number {
    return this.state >>> 0;
  }

  /**
   * True while the mulberry32 accumulator is still an exact integer.
   *
   * `this.state` is an unmasked accumulating double. Past 2^53 the `+=` is
   * no longer exact and the generator silently stops matching reference
   * mulberry32 — so exactness IS canonicity. Read-only, emits no output, so
   * the gravewake vector is untouched.
   */
  isStateExact(): boolean {
    return Number.isSafeInteger(this.state);
  }

  /**
   * Pure function of rootSeed+name — call-order independent.
   * Does not advance this generator. Same name always yields the same child seed.
   */
  stream(name: string): SeededRng {
    const mixed = (this.rootSeed ^ labelHash(name)) >>> 0;
    const childSeed = splitmix32(mixed === 0 ? 0x9e3779b9 : mixed);
    return new SeededRng(childSeed);
  }

  /**
   * Seeded from parent's current state; call-order dependent.
   * Advances the parent by one mulberry32 step so successive forks diverge.
   * Child draws never touch the parent's sequence thereafter.
   */
  fork(): SeededRng {
    const childSeed = splitmix32(this.state);
    // Advance parent (consumes one step of the parent's sequence).
    this.random();
    return new SeededRng(childSeed);
  }
}
