import type { ProblemDefinition, TestCase } from "../types";

function escapeCString(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t")
    .replace(/\"/g, "\\\"");
}

function toCInt(value: unknown): number {
  if (typeof value === "boolean") return value ? 1 : 0;
  if (typeof value === "number") return value | 0;
  throw new Error(`Expected int-compatible value, got ${String(value)}`);
}

function buildArgDeclaration(testIndex: number, argName: string, kind: string, value: unknown): { declaration: string; expression: string } {
  const safeName = `arg_${testIndex}_${argName}`.replace(/[^a-zA-Z0-9_]/g, "_");

  if (kind === "int") {
    return { declaration: `int ${safeName} = ${toCInt(value)};`, expression: safeName };
  }

  if (kind === "bool") {
    return { declaration: `int ${safeName} = ${toCInt(value)};`, expression: safeName };
  }

  if (kind === "string") {
    if (typeof value !== "string") {
      throw new Error(`Expected string input for ${argName}`);
    }
    return {
      declaration: `const char* ${safeName} = "${escapeCString(value)}";`,
      expression: safeName
    };
  }

  if (kind === "int_array") {
    if (!Array.isArray(value)) {
      throw new Error(`Expected int array input for ${argName}`);
    }

    const ints = value.map((item) => toCInt(item));
    const literal = ints.length > 0 ? ints.join(", ") : "0";
    const declaration = `int ${safeName}_storage[${Math.max(ints.length, 1)}] = {${literal}};\n    int* ${safeName} = ${safeName}_storage;`;
    return { declaration, expression: safeName };
  }

  throw new Error(`Unsupported argument kind: ${kind}`);
}

function buildExpectedLiteral(problem: ProblemDefinition, value: unknown): string {
  if (problem.signature.returnKind === "string") {
    if (typeof value !== "string") {
      throw new Error("Expected string return value");
    }
    return `"${escapeCString(value)}"`;
  }

  return String(toCInt(value));
}

function buildExpectedDisplay(problem: ProblemDefinition, value: unknown): string {
  if (problem.signature.returnKind === "string") {
    return typeof value === "string" ? value : "<invalid-string-expected>";
  }

  if (problem.signature.returnKind === "bool") {
    return toCInt(value) === 0 ? "false" : "true";
  }

  return String(toCInt(value));
}

export interface GeneratedHarnessSource {
  fullSource: string;
  testCount: number;
}

export function generateHarnessSource(problem: ProblemDefinition, userSource: string, tests: TestCase[]): GeneratedHarnessSource {
  const sections: string[] = [];
  const isScratchpadProblem = problem.id === "new";

  sections.push(`#include <stdio.h>`);
  sections.push(`#include <string.h>`);
  sections.push(`#include <stdint.h>`);
  sections.push(`#include <stdlib.h>`);
  sections.push(``);
  sections.push(`// User submission follows.`);
  sections.push(userSource.trim());
  sections.push(``);
  sections.push(`static void cee_print_escaped(const char* value) {`);
  sections.push(`    if (value == NULL) { printf("<null>"); return; }`);
  sections.push(`    while (*value) {`);
  sections.push(`        if (*value == '\\n') { printf("\\\\n"); }`);
  sections.push(`        else if (*value == '\\r') { printf("\\\\r"); }`);
  sections.push(`        else if (*value == '|') { printf("\\\\|"); }`);
  sections.push(`        else if (*value == '\\\\') { printf("\\\\\\\\"); }`);
  sections.push(`        else { putchar(*value); }`);
  sections.push(`        value++;`);
  sections.push(`    }`);
  sections.push(`}`);
  sections.push(``);
  sections.push(`int main(void) {`);
  sections.push(`    int cee_passed = 0;`);
  sections.push(`    int cee_failed = 0;`);

  tests.forEach((test, index) => {
    sections.push(``);
    sections.push(`    // Test ${index}: ${test.name}`);

    const callExpressions: string[] = [];
    for (const arg of problem.signature.arguments) {
      if (!(arg.name in test.input)) {
        throw new Error(`Missing test input value for argument ${arg.name} in test ${test.name}`);
      }
      const argValue = (test.input as Record<string, unknown>)[arg.name];
      const generated = buildArgDeclaration(index, arg.name, arg.kind, argValue);
      sections.push(`    ${generated.declaration}`);
      callExpressions.push(generated.expression);
    }

    sections.push(`    // Run target function from user code.`);

    if (problem.signature.returnKind === "string") {
      const expectedLiteral = buildExpectedLiteral(problem, test.expected);
      sections.push(`    const char* cee_expected_${index} = ${expectedLiteral};`);
      sections.push(
        `    const char* cee_actual_${index} = ${problem.signature.functionName}(${callExpressions.join(", ")});`
      );
      sections.push(
        `    int cee_pass_${index} = ((cee_expected_${index} == NULL && cee_actual_${index} == NULL) || (cee_expected_${index} != NULL && cee_actual_${index} != NULL && strcmp(cee_expected_${index}, cee_actual_${index}) == 0));`
      );
      sections.push(`    if (cee_pass_${index}) { cee_passed++; } else { cee_failed++; }`);
      sections.push(
        `    printf("__CEETEST__|${index}|%s|${escapeCString(test.name)}|", cee_pass_${index} ? "PASS" : "FAIL");`
      );
      sections.push(`    cee_print_escaped(cee_expected_${index});`);
      sections.push(`    printf("|");`);
      sections.push(`    cee_print_escaped(cee_actual_${index});`);
      sections.push(`    printf("\\n");`);
    } else {
      sections.push(`    int cee_actual_${index} = ${problem.signature.functionName}(${callExpressions.join(", ")});`);
      if (isScratchpadProblem && test.scope === "official") {
        sections.push(`    int cee_expected_${index} = cee_actual_${index};`);
        sections.push(`    int cee_pass_${index} = 1;`);
      } else {
        const expectedLiteral = buildExpectedLiteral(problem, test.expected);
        sections.push(`    int cee_expected_${index} = ${expectedLiteral};`);
        sections.push(`    int cee_pass_${index} = (cee_actual_${index} == cee_expected_${index});`);
      }
      sections.push(`    if (cee_pass_${index}) { cee_passed++; } else { cee_failed++; }`);
      if (isScratchpadProblem && test.scope === "official") {
        sections.push(
          `    printf("__CEETEST__|${index}|%s|${escapeCString(test.name)}|any|%d\\n", cee_pass_${index} ? "PASS" : "FAIL", cee_actual_${index});`
        );
      } else {
        const expectedDisplay = buildExpectedDisplay(problem, test.expected);
        sections.push(
          `    printf("__CEETEST__|${index}|%s|${escapeCString(test.name)}|${escapeCString(expectedDisplay)}|%d\\n", cee_pass_${index} ? "PASS" : "FAIL", cee_actual_${index});`
        );
      }
    }
  });

  sections.push(``);
  sections.push(`    printf("__CEESUMMARY__|%d|%d|%d\\n", cee_passed, cee_failed, ${tests.length});`);
  // Keep process exit successful so assertion mismatches are reported as test results,
  // not misclassified as runtime traps by the worker runtime adapter.
  sections.push(`    return 0;`);
  sections.push(`}`);

  return {
    fullSource: sections.join("\n"),
    testCount: tests.length
  };
}
