/**
 * G0 greybox headless autobattler — integer/milli-cell, id-order, PREP/COMBAT/RESOLVE.
 * Module-owned; engine only supplies SeededRng + hashString.
 */
import { SeededRng } from "@anvil/core";

export type Phase = "PREP" | "COMBAT" | "RESOLVE";

export interface Unit {
  id: number;
  team: 0 | 1;
  /** milli-cells (integer) */
  x: number;
  y: number;
  hp: number;
  atk: number;
  /** ticks until next attack */
  cd: number;
  alive: boolean;
}

export interface SimSnapshot {
  tick: number;
  phase: Phase;
  seed: number;
  units: ReadonlyArray<{
    id: number;
    team: number;
    x: number;
    y: number;
    hp: number;
    atk: number;
    cd: number;
    alive: boolean;
  }>;
  winner: number | null;
}

export interface AutobattlerSimOpts {
  seed: number;
  /** combat ticks before forced RESOLVE (default 200) */
  maxCombatTicks?: number;
}

export class AutobattlerSim {
  readonly seed: number;
  private readonly maxCombatTicks: number;
  private readonly rng: SeededRng;
  private readonly oppRng: SeededRng;
  private tick = 0;
  private phase: Phase = "PREP";
  private units: Unit[] = [];
  private winner: number | null = null;
  private combatTicks = 0;

  constructor(opts: AutobattlerSimOpts) {
    this.seed = opts.seed >>> 0;
    this.maxCombatTicks = opts.maxCombatTicks ?? 200;
    this.rng = new SeededRng(this.seed).stream("sim");
    this.oppRng = new SeededRng(this.seed).stream("opponent");
  }

  /** PREP: place two units per side on integer grid. */
  prep(): void {
    if (this.phase !== "PREP") return;
    // Player team 0
    this.units.push({
      id: 1,
      team: 0,
      x: 1000,
      y: 2000,
      hp: 100,
      atk: 10 + this.rng.randomInt(0, 3),
      cd: 0,
      alive: true,
    });
    this.units.push({
      id: 2,
      team: 0,
      x: 1000,
      y: 4000,
      hp: 80,
      atk: 12,
      cd: 1,
      alive: true,
    });
    // Opponent team 1 — uses forked opponent stream only
    this.units.push({
      id: 10,
      team: 1,
      x: 7000,
      y: 2000,
      hp: 90 + this.oppRng.randomInt(0, 5),
      atk: 11,
      cd: 0,
      alive: true,
    });
    this.units.push({
      id: 11,
      team: 1,
      x: 7000,
      y: 4000,
      hp: 100,
      atk: 9 + this.oppRng.randomInt(0, 2),
      cd: 2,
      alive: true,
    });
    this.phase = "COMBAT";
  }

  step(): void {
    if (this.phase === "PREP") {
      this.prep();
      return;
    }
    if (this.phase === "RESOLVE") return;

    this.tick += 1;
    this.combatTicks += 1;

    // id-order iteration (stable)
    const order = [...this.units].sort((a, b) => a.id - b.id);
    for (const u of order) {
      if (!u.alive) continue;
      if (u.cd > 0) {
        u.cd -= 1;
        continue;
      }
      const target = this.acquire(u);
      if (!target) continue;
      // Attack
      target.hp -= u.atk;
      u.cd = 3 + this.rng.randomInt(0, 2);
      if (target.hp <= 0) {
        target.hp = 0;
        target.alive = false;
      }
    }

    const alive0 = this.units.some((u) => u.team === 0 && u.alive);
    const alive1 = this.units.some((u) => u.team === 1 && u.alive);
    if (!alive0 || !alive1 || this.combatTicks >= this.maxCombatTicks) {
      this.phase = "RESOLVE";
      if (alive0 && !alive1) this.winner = 0;
      else if (alive1 && !alive0) this.winner = 1;
      else this.winner = alive0 === alive1 ? (alive0 ? null : null) : alive0 ? 0 : 1;
      // draw if both or neither
      if (alive0 === alive1) this.winner = null;
    }
  }

  /** Run N combat-oriented steps (auto-prep on first). */
  run(steps: number): void {
    for (let i = 0; i < steps; i++) this.step();
  }

  /**
   * Death-mid-attack stress: force a unit to die mid-pass while others still act.
   * Deterministic via id-order.
   */
  forceKill(id: number): void {
    const u = this.units.find((x) => x.id === id);
    if (u) {
      u.hp = 0;
      u.alive = false;
    }
  }

  snapshot(): SimSnapshot {
    // Exclude any engine dt accumulator — tick is the only time index.
    const units = [...this.units]
      .sort((a, b) => a.id - b.id)
      .map((u) => ({
        id: u.id,
        team: u.team as number,
        x: u.x,
        y: u.y,
        hp: u.hp,
        atk: u.atk,
        cd: u.cd,
        alive: u.alive,
      }));
    return {
      tick: this.tick,
      phase: this.phase,
      seed: this.seed,
      units,
      winner: this.winner,
    };
  }

  private acquire(attacker: Unit): Unit | null {
    // Nearest living enemy by manhattan milli-cells; tie → lower id
    let best: Unit | null = null;
    let bestD = Infinity;
    for (const u of this.units) {
      if (!u.alive || u.team === attacker.team) continue;
      const d = Math.abs(u.x - attacker.x) + Math.abs(u.y - attacker.y);
      if (d < bestD || (d === bestD && best !== null && u.id < best.id) || (d === bestD && best === null)) {
        bestD = d;
        best = u;
      }
    }
    return best;
  }
}
