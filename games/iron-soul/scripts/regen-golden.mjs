/**
 * Regenerate games/iron-soul/replay/golden.json after intentional sim changes.
 * Usage (from games/iron-soul): node scripts/regen-golden.mjs
 * PR must note the intentional sim change when updating golden.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const simMod = await import(pathToFileURL(path.join(root, "dist/sim.js")).href);
const hashMod = await import(pathToFileURL(path.join(root, "dist/hash.js")).href);

const seed = 42;
const steps = 100;
const sim = new simMod.AutobattlerSim({ seed });
sim.run(steps);
const hash = hashMod.hashSimState(sim.snapshot());

const out = {
  seed,
  steps,
  hash,
  engineNote: "@anvil/core SeededRng mulberry32 + hashString FNV-1a; module ss1 serializer",
  updateProtocol: "pnpm sim:regen-golden + PR note of intentional sim change",
};

const dest = path.join(root, "replay", "golden.json");
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(dest, JSON.stringify(out, null, 2) + "\n");
console.log("wrote", dest, hash);
