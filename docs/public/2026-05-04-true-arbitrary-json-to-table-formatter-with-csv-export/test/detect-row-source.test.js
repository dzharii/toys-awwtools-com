import { describe, expect, test } from "bun:test";
import { chooseBestRowSource, findRowSourceCandidates, formatPathLabel } from "../src/core/detect-row-source.js";

describe("row source detection", () => {
  test("selects results[] candidate in object payload", () => {
    const parseResult = {
      ok: true,
      kind: "json",
      root: {
        metadata: { tags: ["a"] },
        results: [
          { id: 1, success: true },
          { id: 2, success: false, error: { code: "E1" } }
        ]
      },
      meta: { rootType: "object" }
    };
    const candidates = findRowSourceCandidates(parseResult);
    const best = chooseBestRowSource(candidates);
    expect(best.pathLabel).toBe("results[]");
    expect(best.score).toBeGreaterThan(0);
  });

  test("uses JSONL records candidate", () => {
    const parseResult = {
      ok: true,
      kind: "jsonl",
      root: [{ id: 1 }, { id: 2 }],
      lineItems: [{ lineNumber: 1, value: { id: 1 } }, { lineNumber: 2, value: { id: 2 } }],
      meta: { rootType: "array" }
    };
    const candidates = findRowSourceCandidates(parseResult);
    expect(candidates[0].kind).toBe("jsonl");
    expect(candidates[0].confidence).toBe("high");
  });

  test("falls back to objectAsRow for root object with no arrays", () => {
    const parseResult = {
      ok: true,
      kind: "json",
      root: { id: "job-1", status: "failed" },
      meta: { rootType: "object" }
    };
    const candidates = findRowSourceCandidates(parseResult);
    expect(candidates.some((candidate) => candidate.kind === "objectAsRow")).toBe(true);
  });

  test("path label handles special keys", () => {
    expect(formatPathLabel(["job.items"], "array")).toContain('["job.items"][]');
    expect(formatPathLabel(["job items"], "array")).toContain('["job items"][]');
  });
});

