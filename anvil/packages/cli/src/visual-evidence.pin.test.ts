import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

// The vendored schema is a VERBATIM, SHA-pinned copy of the schema of record
// (EMCC Library Codex §9). If this pin fails the vendored file drifted from
// canon — do NOT edit the pin to match; reconcile with Librarian.
const CONTENT_PIN = "8c6eb411faa8d0ff31afe0440dc60554dc5875212049d0e462323f8e763452bd";

const schemaPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "schemas/visual-evidence.schema.json",
);

describe("visual-evidence vendored schema pin", () => {
  it("matches the Library Codex §9 content pin byte-for-byte", () => {
    const bytes = fs.readFileSync(schemaPath); // RAW bytes, no newline translation
    const sha = createHash("sha256").update(bytes).digest("hex");
    expect(sha).toBe(CONTENT_PIN);
  });
});
