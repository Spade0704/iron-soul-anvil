import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { AutobattlerSim } from "./sim.js";
import { hashSimState } from "./hash.js";
import { SeededRng, hashString } from "@anvil/core";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const goldenPath = path.join(root, "replay", "golden.json");
const vectorsPath = path.join(root, "fixtures", "external-vectors.json");

function runSim(seed: number, steps: number) {
  const sim = new AutobattlerSim({ seed });
  sim.run(steps);
  return sim;
}

describe("AutobattlerSim G0 greybox", () => {
  it("same seed → identical hash across two fresh runs", () => {
    const a = hashSimState(runSim(42, 100).snapshot());
    const b = hashSimState(runSim(42, 100).snapshot());
    expect(a).toBe(b);
  });

  it("different seeds diverge", () => {
    const a = hashSimState(runSim(0, 50).snapshot());
    const b = hashSimState(runSim(1, 50).snapshot());
    expect(a).not.toBe(b);
  });

  it("golden hash matches committed golden.json (seed 42, 100 ticks)", () => {
    const golden = JSON.parse(fs.readFileSync(goldenPath, "utf8")) as {
      seed: number;
      steps: number;
      hash: string;
      engineNote: string;
    };
    const sim = runSim(golden.seed, golden.steps);
    expect(hashSimState(sim.snapshot())).toBe(golden.hash);
  });

  it("death-mid-attack is deterministic under replay", () => {
    const run = () => {
      const sim = new AutobattlerSim({ seed: 7 });
      sim.prep();
      sim.step();
      sim.forceKill(10);
      sim.run(40);
      return hashSimState(sim.snapshot());
    };
    expect(run()).toBe(run());
  });

  it("double play of same step sequence is stable (in-process re-run)", () => {
    const h1 = hashSimState(runSim(99, 80).snapshot());
    const h2 = hashSimState(runSim(99, 80).snapshot());
    expect(h1).toBe(h2);
  });

  it("cross-process: two node child processes agree on hash", () => {
    const script = path.join(root, "src", "crossProcessHash.mjs");
    const a = spawnSync(process.execPath, [script, "42", "100"], {
      encoding: "utf8",
    });
    const b = spawnSync(process.execPath, [script, "42", "100"], {
      encoding: "utf8",
    });
    expect(a.status).toBe(0);
    expect(b.status).toBe(0);
    expect(a.stdout.trim()).toBe(b.stdout.trim());
    expect(a.stdout.trim().startsWith("ss1:")).toBe(true);
  });

  it("external-vector conformance (mulberry32 + FNV fixtures)", () => {
    const vectors = JSON.parse(fs.readFileSync(vectorsPath, "utf8")) as {
      mulberry32_seed42_first5: number[];
      fnv1a: Record<string, string>;
      sim_seed42_steps100_hash: string;
    };
    const r = new SeededRng(42);
    const got = Array.from({ length: 5 }, () => r.random());
    expect(got).toEqual(vectors.mulberry32_seed42_first5);

    for (const [input, expected] of Object.entries(vectors.fnv1a)) {
      expect(hashString(input)).toBe(expected);
    }

    const h = hashSimState(runSim(42, 100).snapshot());
    expect(h).toBe(vectors.sim_seed42_steps100_hash);
  });
});

