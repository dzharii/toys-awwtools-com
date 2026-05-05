import { describe, expect, test } from "bun:test";
import {
  buildSnippet,
  classifyInputText,
  getLineColumnFromOffset,
  parseInput,
  parseJsonLines
} from "../src/core/parse-input.js";

describe("parse-input", () => {
  test("handles empty and whitespace input", () => {
    expect(parseInput("").kind).toBe("empty");
    expect(parseInput("   \n\t").kind).toBe("empty");
  });

  test("parses valid JSON document", () => {
    const result = parseInput('{"items":[1,2,3]}');
    expect(result.ok).toBe(true);
    expect(result.kind).toBe("json");
    expect(result.root.items.length).toBe(3);
  });

  test("parses valid JSONL with blank lines", () => {
    const text = '{"id":1}\n\n{"id":2}\n';
    const result = parseInput(text);
    expect(result.ok).toBe(true);
    expect(result.kind).toBe("jsonl");
    expect(result.root.length).toBe(2);
    expect(result.meta.blankLineCount).toBeGreaterThan(0);
  });

  test("reports invalid JSON with location and hint", () => {
    const result = parseInput('{"items":[1,2,]}');
    expect(result.ok).toBe(false);
    expect(result.error.code).toBe("E_PARSE_JSON");
    expect(result.error.line).toBe(1);
    expect(result.error.column).toBeGreaterThan(0);
    expect(result.error.hint.length).toBeGreaterThan(0);
  });

  test("reports invalid JSONL line details", () => {
    const result = parseJsonLines('{"id":1}\n{id:2}');
    expect(result.ok).toBe(false);
    expect(result.error.code).toBe("E_PARSE_JSONL");
    expect(result.error.line).toBe(2);
  });

  test("classifies likely input kinds", () => {
    expect(classifyInputText("")).toBe("empty");
    expect(classifyInputText("{\"a\":1}")).toBe("json");
    expect(classifyInputText('{"a":1}\n{"b":2}')).toBe("jsonl");
    expect(classifyInputText("hello world")).toBe("unknown");
  });

  test("line/column from offset works", () => {
    const text = "a\nbc\ndef";
    expect(getLineColumnFromOffset(text, 0)).toEqual({ line: 1, column: 1 });
    expect(getLineColumnFromOffset(text, 2)).toEqual({ line: 2, column: 1 });
    expect(getLineColumnFromOffset(text, 6)).toEqual({ line: 3, column: 2 });
  });

  test("snippet includes pointer", () => {
    const snippet = buildSnippet("x\ny\nz", 2, 1);
    expect(snippet.line).toContain("2");
    expect(snippet.pointer).toContain("^");
  });
});

