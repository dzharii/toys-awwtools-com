import { z } from "zod";

export const argumentKindSchema = z.enum(["int", "bool", "string", "int_array"]);
export type ArgumentKind = z.infer<typeof argumentKindSchema>;

export const returnKindSchema = z.enum(["int", "bool", "string"]);
export type ReturnKind = z.infer<typeof returnKindSchema>;

export const functionArgSchema = z.object({
  name: z.string().min(1),
  cType: z.string().min(1),
  kind: argumentKindSchema,
  description: z.string().min(1)
});
export type FunctionArg = z.infer<typeof functionArgSchema>;

export const functionSignatureSchema = z.object({
  functionName: z.string().min(1),
  declaration: z.string().min(1),
  returnTypeC: z.string().min(1),
  returnKind: returnKindSchema,
  arguments: z.array(functionArgSchema)
});
export type FunctionSignature = z.infer<typeof functionSignatureSchema>;

export const testInputValueSchema = z.union([
  z.number().int(),
  z.boolean(),
  z.string(),
  z.array(z.number().int())
]);

export const testCaseSchema = z.object({
  name: z.string().min(1),
  input: z.record(z.string(), testInputValueSchema),
  expected: z.union([z.number().int(), z.boolean(), z.string()]),
  scope: z.enum(["official", "custom"]).default("official")
});
export type TestCase = z.infer<typeof testCaseSchema>;

export const c99SupportItemSchema = z.object({
  header: z.string(),
  status: z.enum(["supported", "emulated", "unsupported"]),
  notes: z.string()
});
export type C99SupportItem = z.infer<typeof c99SupportItemSchema>;

export const problemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  summary: z.string().min(1),
  statementMarkdown: z.string().min(1),
  constraintsMarkdown: z.string().min(1),
  examplesMarkdown: z.string().min(1),
  signature: functionSignatureSchema,
  starterCode: z.string().min(1),
  visibleTests: z.array(testCaseSchema),
  defaultCustomTestsJson: z.string().min(2)
});
export type ProblemDefinition = z.infer<typeof problemSchema>;

export const compileDiagnosticSchema = z.object({
  file: z.string(),
  line: z.number().int().positive(),
  column: z.number().int().positive(),
  severity: z.enum(["warning", "error", "note", "fatal error"]),
  message: z.string()
});
export type CompileDiagnostic = z.infer<typeof compileDiagnosticSchema>;

export interface HarnessTestResult {
  index: number;
  status: "PASS" | "FAIL";
  name: string;
  expected: string;
  actual: string;
}

export interface HarnessSummary {
  passed: number;
  failed: number;
  total: number;
}

export interface ParsedHarnessOutput {
  tests: HarnessTestResult[];
  summary: HarnessSummary | null;
  consoleLines: string[];
}

export interface CompileRequestPayload {
  runId: string;
  source: string;
  problem: ProblemDefinition;
  tests: TestCase[];
}

export interface CompileSuccess {
  ok: true;
  runId: string;
  wasmBytes: ArrayBuffer;
  compilerLog: string;
  generatedSource: string;
}

export interface CompileFailure {
  ok: false;
  runId: string;
  compilerLog: string;
  diagnostics: CompileDiagnostic[];
  generatedSource: string;
  message: string;
}

export type CompileResponsePayload = CompileSuccess | CompileFailure;

export interface RunRequestPayload {
  runId: string;
  wasmBytes: ArrayBuffer;
}

export interface RunSuccess {
  ok: true;
  runId: string;
  runtimeLog: string;
}

export interface RunFailure {
  ok: false;
  runId: string;
  runtimeLog: string;
  message: string;
}

export type RunResponsePayload = RunSuccess | RunFailure;

export const localStorageKeys = {
  selectedProblem: "ceetcode:selected_problem",
  draftPrefix: "ceetcode:draft:",
  customPrefix: "ceetcode:custom_tests:"
} as const;

export const c99SupportMatrix: C99SupportItem[] = [
  {
    header: "<stdio.h>",
    status: "supported",
    notes: "printf, puts, and basic stream APIs work through WASI-backed libc."
  },
  {
    header: "<stdlib.h>",
    status: "supported",
    notes: "malloc/free and common conversion functions are available."
  },
  {
    header: "<string.h>",
    status: "supported",
    notes: "Core string and memory routines are available in the linked libc."
  },
  {
    header: "<time.h>",
    status: "emulated",
    notes: "WASI time behavior is sandboxed and may differ from host OS semantics."
  },
  {
    header: "<signal.h>",
    status: "unsupported",
    notes: "POSIX-style process signal semantics are not available in browser workers."
  }
];
