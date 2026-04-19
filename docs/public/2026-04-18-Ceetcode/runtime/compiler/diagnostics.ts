import type { CompileDiagnostic } from "../types";
import { stripAnsi } from "../harness/parse-harness-output";
import { createLogger } from "../logging";

const diagnosticRegex = /^(?<file>[^:\n]+):(?<line>\d+):(?<column>\d+):\s*(?<severity>warning|error|note|fatal error):\s*(?<message>.+)$/;
const diagnosticLog = createLogger("Run", "Diagnostics");

export function parseCompileDiagnostics(compilerLog: string): CompileDiagnostic[] {
  const diagnostics: CompileDiagnostic[] = [];
  const clean = stripAnsi(compilerLog);

  for (const line of clean.split(/\r?\n/)) {
    const match = line.match(diagnosticRegex);
    if (!match || !match.groups) continue;

    diagnostics.push({
      file: match.groups.file,
      line: Number(match.groups.line),
      column: Number(match.groups.column),
      severity: match.groups.severity as CompileDiagnostic["severity"],
      message: match.groups.message.trim()
    });
  }

  diagnosticLog.info("Compile diagnostics parsed", {
    context: { count: diagnostics.length }
  });
  return diagnostics;
}
