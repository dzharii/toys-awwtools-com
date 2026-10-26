import { describe, expect, test } from "bun:test";
import { readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { parseTemplate } from "../../src/features/templates/parser";
import { renderTemplate } from "../../src/features/templates/renderer";
import { validateManifest } from "../../src/features/templates/loader";
const greeting =
  "TEMPLATE: Greeting\nTEXT:\n  Hello {{$name}} and {{$name}}.\n$name: Who?\n  EXAMPLE: Alex";

describe("GTL parsing and rendering", () => {
  test("repeated references resolve one answer without mutating the definition", () => {
    const template = parseTemplate(greeting).template!;
    const before = structuredClone(template);
    expect(renderTemplate(template, template.versions[0]!, { name: "Alex" })).toEqual({
      text: "Hello Alex and Alex.",
      unresolved: [],
      canCopy: true,
    });
    expect(template).toEqual(before);
  });
  test("normalizes CRLF and preserves internal blank lines and relative indentation", () => {
    const template = parseTemplate(
      "TEMPLATE: Note\r\nTEXT:\r\n  First\r\n\r\n    Indented\r\n  Last\r\n\r\n",
    ).template!;
    expect(renderTemplate(template, template.versions[0]!, {}).text).toBe(
      "First\n\n  Indented\nLast",
    );
  });
  test("undeclared references get generated required guidance with source locations", () => {
    const result = parseTemplate("TEMPLATE: Greeting\nTEXT:\n  Hello {{$first-name}}.");
    expect(result.template?.placeholders["first-name"]?.question).toBe("Enter first name.");
    expect(result.diagnostics[0]).toMatchObject({
      severity: "warning",
      line: 3,
      column: 9,
      code: "UNDECLARED_PLACEHOLDER",
    });
  });
  test("multiline answers are literal, optional empty values do not rewrite punctuation", () => {
    const template = parseTemplate(
      "TEMPLATE: Note\nTEXT:\n  {{$body}}, {{$notes}}.\n$body: Note?\n  INPUT: multiline\n$notes OPTIONAL: Notes?",
    ).template!;
    const generated = renderTemplate(template, template.versions[0]!, {
      body: "Line 1\n\nLine 2",
      notes: " \t ",
    });
    expect(generated.text).toBe("Line 1\n\nLine 2, .");
    expect(generated.canCopy).toBe(true);
  });
  const incompleteAnswers: Record<string, string>[] = [{}, { name: "" }, { name: " \n\t" }];
  test.each(incompleteAnswers)("unanswered required fields block copying: %j", (answers) => {
    const template = parseTemplate(greeting).template!;
    expect(renderTemplate(template, template.versions[0]!, answers)).toMatchObject({
      canCopy: false,
      unresolved: ["name"],
    });
  });
  test("choice keys render labels, never default to the first option, and invalid options block export", () => {
    const template = parseTemplate(
      "TEMPLATE: Tone\nTEXT:\n  {{$tone}}\n$tone OPTIONAL: Tone?\n  OPTION friendly: Friendly tone\n  OPTION formal: Formal tone",
    ).template!;
    const version = template.versions[0]!;
    expect(renderTemplate(template, version, {}).text).toBe("");
    expect(renderTemplate(template, version, { tone: "friendly" }).text).toBe("Friendly tone");
    expect(renderTemplate(template, version, { tone: "unknown" }).canCopy).toBe(false);
  });
  test("case-sensitive identifiers include prototype-looking names safely", () => {
    const template = parseTemplate(
      "TEMPLATE: Case\nTEXT:\n  {{$constructor}} {{$Name}} {{$name}}",
    ).template!;
    expect(renderTemplate(template, template.versions[0]!, {}).unresolved).toEqual([
      "constructor",
      "Name",
      "name",
    ]);
  });
  test.each([
    ["TEXT:\n  Hello", "MISSING_TEMPLATE"],
    ["TEMPLATE: X\nTEXT:\n", "EMPTY_TEXT"],
    ["TEMPLATE: X\nTEXT:\n  {{$input}", "UNCLOSED_REFERENCE"],
    ["TEMPLATE: X\nTEXT:\n  {{input}}", "INVALID_REFERENCE"],
    ["TEMPLATE: X\nTEXT:\n  {{$1input}}", "INVALID_REFERENCE"],
    ["TEMPLATE: X\nTEXT:\n  {{$a}}\n$a: A?\n$a: Again?", "DUPLICATE_PLACEHOLDER"],
    ["TEMPLATE: X\nTEXT:\n  x\nVERSION: V\n  TEXT:\n    y", "MIXED_TEXT"],
    ["TEMPLATE: X\nVERSION: V\n  TEXT:\n    x\nVERSION: V\n  TEXT:\n    y", "DUPLICATE_VERSION"],
    ["TEMPLATE: X\nTEXT:\n  {{$a}}\n$a: A?\n  INPUT: number", "INVALID_INPUT"],
    ["TEMPLATE: X\nTEXT:\n  {{$a}}\n$a: A?\n  OPTION bad", "INVALID_OPTION"],
    [
      "TEMPLATE: X\nTEXT:\n  {{$a}}\n$a: A?\n  OPTION ok: Okay\n  OPTION ok: Fine",
      "DUPLICATE_OPTION",
    ],
    [
      "TEMPLATE: X\nTEXT:\n  {{$a}}\n$a: A?\n  INPUT: multiline\n  OPTION ok: Okay",
      "INCOMPATIBLE_INPUT",
    ],
    ["TEMPLATE: X\nWHEN: ignored\nTEXT:\n  x", "UNKNOWN_DIRECTIVE"],
    ["TEMPLATE: X\nVERSION: Missing", "MISSING_VERSION_TEXT"],
  ])("invalid source reports %s / %s", (source, code) => {
    const parsed = parseTemplate(source);
    expect(parsed.template).toBeNull();
    expect(
      parsed.diagnostics.some((item) => item.code === code && item.line > 0 && item.column > 0),
    ).toBe(true);
  });
  test("unused declarations are nonblocking warnings", () => {
    const parsed = parseTemplate("TEMPLATE: Fixed\nTEXT:\n  Hello.\n$unused: Unused?");
    expect(parsed.template).not.toBeNull();
    expect(parsed.diagnostics).toContainEqual(
      expect.objectContaining({ code: "UNUSED_PLACEHOLDER", severity: "warning" }),
    );
  });
  test("all bundled writing styles parse and produce meaningful output", async () => {
    const folder = resolve(import.meta.dir, "../../templates");
    let styles = 0;
    for (const file of (await readdir(folder)).filter((name) => name.endsWith(".gtl"))) {
      const parsed = parseTemplate(await Bun.file(resolve(folder, file)).text());
      expect(parsed.diagnostics.filter((item) => item.severity === "error")).toEqual([]);
      expect(parsed.template).not.toBeNull();
      const template = parsed.template!;
      const answers = Object.fromEntries(
        Object.values(template.placeholders).map((field) => [
          field.name,
          field.options[0]?.key || field.examples[0] || "Example",
        ]),
      );
      for (const version of template.versions) {
        const result = renderTemplate(template, version, answers);
        expect(result.canCopy).toBe(true);
        expect(result.text.trim().length).toBeGreaterThan(0);
        styles++;
      }
    }
    expect(styles).toBeGreaterThanOrEqual(6);
  });
  test("manifest rejects duplicate IDs and external or traversing paths", () => {
    const entry = { id: "x", name: "X", description: "", category: "", file: "x.gtl" };
    expect(() => validateManifest({ templates: [entry, entry] })).toThrow();
    expect(() => validateManifest({ templates: [{ ...entry, file: "../x.gtl" }] })).toThrow();
    expect(() =>
      validateManifest({ templates: [{ ...entry, file: "https://example.org/x.gtl" }] }),
    ).toThrow();
  });
});
