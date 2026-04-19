import { z } from "zod";
import { createLogger } from "./logging";
import type { ProblemDefinition, TestCase, ArgumentKind } from "./types";

const customTestLog = createLogger("Run", "CustomTests");

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
    customTestLog.info("No custom tests provided", {
      context: { problemId: problem.id }
    });
    return { tests: [], error: null };
  }

  let parsedRaw: unknown;
  try {
    parsedRaw = JSON.parse(trimmed);
  } catch (error) {
    customTestLog.warn("Custom tests JSON parse failed", {
      context: { problemId: problem.id, message: (error as Error).message }
    });
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
    customTestLog.warn("Custom tests schema validation failed", {
      context: {
        problemId: problem.id,
        issue: result.error.issues[0]?.message ?? "invalid format"
      }
    });
    return { tests: [], error: `Custom tests validation error: ${result.error.issues[0]?.message ?? "invalid format"}` };
  }

  const tests: TestCase[] = result.data.map((item) => ({
    name: item.name,
    input: item.input,
    expected: item.expected,
    scope: "custom"
  }));

  customTestLog.info("Custom tests parsed", {
    context: { problemId: problem.id, count: tests.length }
  });
  return { tests, error: null };
}
