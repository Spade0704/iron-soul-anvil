/**
 * Cross-process hash worker: node crossProcessHash.mjs <seed> <steps>
 * Requires games/iron-soul dist + @anvil/core dist.
 */
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const seed = Number(process.argv[2] ?? 42);
const steps = Number(process.argv[3] ?? 100);

const simPath = path.resolve(here, "../dist/sim.js");
const hashPath = path.resolve(here, "../dist/hash.js");

let AutobattlerSim;
let hashSimState;
try {
  ({ AutobattlerSim } = await import(pathToFileURL(simPath).href));
  ({ hashSimState } = await import(pathToFileURL(hashPath).href));
} catch {
  console.error("dist missing — run: pnpm --filter @games/iron-soul build");
  process.exit(2);
}

const sim = new AutobattlerSim({ seed });
sim.run(steps);
process.stdout.write(hashSimState(sim.snapshot()) + "\n");
