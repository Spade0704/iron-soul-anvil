/**
 * Module-owned canonical serializer for sim snapshots.
 * Throws on NaN / non-integer / -0 / undefined / Map / Set (fail-closed).
 * Promotion criterion: stays in games/iron-soul until a second title needs it.
 */

function isNegativeZero(n: number): boolean {
  return n === 0 && 1 / n === -Infinity;
}

function assertSafeNumber(n: number, path: string): void {
  if (Number.isNaN(n)) throw new Error(`canonicalize: NaN at ${path}`);
  if (!Number.isFinite(n)) throw new Error(`canonicalize: non-finite at ${path}`);
  if (isNegativeZero(n)) throw new Error(`canonicalize: -0 at ${path}`);
  if (!Number.isInteger(n)) throw new Error(`canonicalize: non-integer at ${path}`);
}

export function canonicalize(value: unknown, path = "$"): string {
  if (value === undefined) {
    throw new Error(`canonicalize: undefined at ${path}`);
  }
  if (value === null) {
    return "null";
  }
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }
  if (typeof value === "string") {
    return JSON.stringify(value);
  }
  if (typeof value === "number") {
    assertSafeNumber(value, path);
    return String(value);
  }
  if (typeof value === "bigint") {
    return `${value}n`;
  }
  if (value instanceof Map) {
    throw new Error(`canonicalize: Map at ${path}`);
  }
  if (value instanceof Set) {
    throw new Error(`canonicalize: Set at ${path}`);
  }
  if (Array.isArray(value)) {
    const parts = value.map((v, i) => canonicalize(v, `${path}[${i}]`));
    return `[${parts.join(",")}]`;
  }
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj).sort();
    const parts = keys.map((k) => {
      if (!(k in obj)) throw new Error(`canonicalize: missing key ${k} at ${path}`);
      return `${JSON.stringify(k)}:${canonicalize(obj[k], `${path}.${k}`)}`;
    });
    return `{${parts.join(",")}}`;
  }
  throw new Error(`canonicalize: unsupported type at ${path}: ${typeof value}`);
}
