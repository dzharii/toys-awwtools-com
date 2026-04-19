import type { ParsedHarnessOutput, HarnessSummary, HarnessTestResult } from "../types";
import { createLogger } from "../logging";

const TEST_PREFIX = "__CEETEST__|";
const SUMMARY_PREFIX = "__CEESUMMARY__|";
const harnessLog = createLogger("Harness", "Parser");

export function stripAnsi(value: string): string {
  return value.replace(/\x1B\[[0-?]*[ -/]*[@-~]/g, "");
}

export function parseHarnessOutput(raw: string): ParsedHarnessOutput {
  const cleaned = stripAnsi(raw);
  const lines = cleaned.split(/\r?\n/);
  const tests: HarnessTestResult[] = [];
  let summary: HarnessSummary | null = null;
  const consoleLines: string[] = [];

  for (const line of lines) {
    if (!line.trim()) {
      continue;
    }

    if (line.startsWith(TEST_PREFIX)) {
      const parts = line.split("|");
      if (parts.length >= 6) {
        const index = Number(parts[1] ?? "0");
        const status = parts[2] === "PASS" ? "PASS" : "FAIL";
        const name = parts[3] ?? `test-${index}`;
        const expected = parts[4] ?? "";
        const actual = parts.slice(5).join("|");
        tests.push({ index, status, name, expected, actual });
      }
      continue;
    }

    if (line.startsWith(SUMMARY_PREFIX)) {
      const parts = line.split("|");
      summary = {
        passed: Number(parts[1] ?? "0"),
        failed: Number(parts[2] ?? "0"),
        total: Number(parts[3] ?? "0")
      };
      continue;
    }

    consoleLines.push(line);
  }

  harnessLog.info("Harness output parsed", {
    context: {
      tests: tests.length,
      hasSummary: summary !== null,
      consoleLines: consoleLines.length
    }
  });
  return { tests, summary, consoleLines };
}
