import { z } from "zod";
import type { ProblemDefinition, TestCase, ArgumentKind } from "./types";

function schemaForKind(kind: ArgumentKind) {
  if (kind === "int") return z.number().int();
  if (kind === "bool") return z.union([z.boolean(), z.number().int().min(0).max(1)]);
  if (kind === "string") return z.string();
  return z.array(z.number().int());
}

function schemaForReturnKind(kind: ProblemDefinition["signature"]["returnKind"]) {
  if (kind === "int") return z.number().int();
  if (kind === "bool") return z.union([z.boolean(), z.number().int().min(0).max(1)]);
  return z.string();
}

export function parseCustomTests(problem: ProblemDefinition, jsonText: string): { tests: TestCase[]; error: string | null } {
  const trimmed = jsonText.trim();
  if (!trimmed) {
    return { tests: [], error: null };
  }

  let parsedRaw: unknown;
  try {
    parsedRaw = JSON.parse(trimmed);
  } catch (error) {
    return {
      tests: [],
      error: `Custom tests JSON parse error: ${(error as Error).message}`
    };
  }

  const inputSchema = z.object(
    Object.fromEntries(problem.signature.arguments.map((arg) => [arg.name, schemaForKind(arg.kind)]))
  );

  const testSchema = z.object({
    name: z.string().min(1),
    input: inputSchema,
    expected: schemaForReturnKind(problem.signature.returnKind)
  });

  const arraySchema = z.array(testSchema);
  const result = arraySchema.safeParse(parsedRaw);
  if (!result.success) {
    return { tests: [], error: `Custom tests validation error: ${result.error.issues[0]?.message ?? "invalid format"}` };
  }

  const tests: TestCase[] = result.data.map((item) => ({
    name: item.name,
    input: item.input,
    expected: item.expected,
    scope: "custom"
  }));

  return { tests, error: null };
}
