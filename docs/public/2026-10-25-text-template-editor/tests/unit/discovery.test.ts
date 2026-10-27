import { expect, test } from "bun:test";
import { resolve } from "node:path";
import { validateManifest } from "../../src/features/templates/loader";
import { parseTemplate } from "../../src/features/templates/parser";
import { normalizeSearch, searchTemplates } from "../../src/features/templates/search";
import { sampleOutput } from "../../src/features/templates/samples";
import { applyNativeSourceEdit } from "../../src/features/template-authoring/source-edit";

const root = resolve(import.meta.dir, "..", "..", "templates");
const entries = validateManifest(await Bun.file(resolve(root, "manifest.json")).json());
const index = await Promise.all(
  entries.map(async (entry, order) => ({
    entry,
    order,
    template: parseTemplate(await Bun.file(resolve(root, entry.file)).text()).template!,
  })),
);
test("search finds guidance JSON, title email and normalized styles without duplicate templates", () => {
  expect(searchTemplates(index, "JSON")[0]!.entry.id).toBe("project-description");
  expect(searchTemplates(index, "email")[0]!.entry.id).toBe("thoughtful-email");
  const style = searchTemplates(index, "Input + Processing -- Output");
  expect(style[0]!.reason).toBe("Style: Input + processing + output");
  expect(new Set(style.map((item) => item.entry.id)).size).toBe(style.length);
  expect(normalizeSearch("  Caf\u00e9--TOOLS! ")).toBe("cafe tools");
});
test("clear restores manifest order, fuzzy is bounded, and private answers cannot be searched", () => {
  expect(searchTemplates([...index].reverse(), " ").map((item) => item.entry.id)).toEqual(
    entries.map((entry) => entry.id),
  );
  expect(searchTemplates(index, "projet")[0]!.entry.id).toBe("project-description");
  expect(searchTemplates(index, "emall")[0]!.entry.id).toBe("thoughtful-email");
  expect(searchTemplates(index, "jx")).toHaveLength(0);
  expect(searchTemplates(index, "privateAnswer729183")).toHaveLength(0);
});
test("all-term matches beat a partial title match with deterministic tie order", () => {
  const first = {
    ...index[0]!,
    entry: { ...index[0]!.entry, id: "one", name: "JSON" },
    order: 0,
    template: parseTemplate("TEMPLATE: One\nTEXT:\n  plain").template!,
  };
  const second = {
    ...index[0]!,
    entry: { ...index[0]!.entry, id: "two", name: "Tools" },
    order: 1,
    template: parseTemplate("TEMPLATE: Two\nTEXT:\n  {{$x}}\n$x: JSON parser").template!,
  };
  expect(searchTemplates([first, second], "JSON parser")[0]!.entry.id).toBe("two");
});
test("samples use deterministic examples, choices and explicit unresolved data", () => {
  const project = index[0]!.template;
  expect(sampleOutput(project, project.versions[0]!).text).toBe(
    "A browser-based tool that formats and validates JSON to make structured data easier to inspect.",
  );
  const template = parseTemplate(
    "TEMPLATE: Sample\nTEXT:\n  {{$kind}} {{$thing}} {{$maybe}}\n$kind: Kind?\n  OPTION first: First choice\n$thing: Thing?\n$maybe OPTIONAL: More?",
  ).template!;
  expect(sampleOutput(template, template.versions[0]!)).toMatchObject({
    text: "First choice [thing] ",
    unresolved: ["thing"],
  });
  expect(sampleOutput(template, template.versions[0]!, { thing: "<literal>" }).text).toContain(
    "<literal>",
  );
});
test("native source changes preserve untouched mixed line endings and map edits exactly", () => {
  const raw = "TEMPLATE: Old\r\nTEXT:\n  hello\r\n";
  expect(applyNativeSourceEdit(raw, "TEMPLATE: New\nTEXT:\n  hello\n")).toBe(
    "TEMPLATE: New\r\nTEXT:\n  hello\r\n",
  );
  expect(applyNativeSourceEdit(raw, raw.replace(/\r\n/g, "\n"))).toBe(raw);
  expect(applyNativeSourceEdit("abc\r\n", "abc\nnext\n")).toBe("abc\r\nnext\r\n");
});
