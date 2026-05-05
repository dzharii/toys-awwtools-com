import { describe, expect, test } from "bun:test";
import { parseInput } from "../src/core/parse-input.js";
import { EXAMPLES } from "../src/examples/index.js";

describe("examples", () => {
  test("examples have unique ids and required fields", () => {
    const ids = new Set();
    for (const example of EXAMPLES) {
      expect(example.id.length).toBeGreaterThan(0);
      expect(example.title.length).toBeGreaterThan(0);
      expect(example.description.length).toBeGreaterThan(0);
      expect(example.text.length).toBeGreaterThan(0);
      expect(ids.has(example.id)).toBe(false);
      ids.add(example.id);
    }
  });

  test("JSON and JSONL examples parse", () => {
    for (const example of EXAMPLES) {
      const parsed = parseInput(example.text);
      expect(parsed.ok).toBe(true);
      if (example.kind === "jsonl") expect(parsed.kind).toBe("jsonl");
    }
  });
});

