import { describe, expect, test } from "vitest";
import { readFileSync } from "node:fs";

describe("token source", () => {
  const source = JSON.parse(readFileSync("packages/tokens/src/tokens.json", "utf8"));

  test("defines the expected public themes", () => {
    expect(Object.keys(source.themes)).toEqual(["default", "dark", "highContrast"]);
  });

  test("keeps component-facing semantic token groups available", () => {
    expect(source.semantic.space.actionX).toBeDefined();
    expect(source.semantic.type.controlSize).toBeDefined();
    expect(source.semantic.radius.control).toBeDefined();
  });
});
