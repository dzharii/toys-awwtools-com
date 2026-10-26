import { expect, test } from "bun:test";
import { fieldNavigation } from "../../src/features/documents/keyboard";
import {
  copyRichText,
  escapeHtml,
  filename,
  markdownText,
  semanticHtml,
} from "../../src/features/export/service";
import {
  defaultSettings,
  isSettings,
  isValidSetting,
  settingsSchema,
} from "../../src/features/settings/schema";
import { snapshotParameters } from "../../src/platform/diagnostics/logger";
const base = {
  key: "ArrowRight",
  start: 4,
  end: 4,
  length: 4,
  multiline: false,
  composing: false,
  modified: false,
  index: 0,
  count: 3,
};
test("field arrows transfer only at boundaries and never wrap", () => {
  expect(fieldNavigation(base)).toEqual({ index: 1, caret: "start" });
  expect(fieldNavigation({ ...base, start: 2, end: 2 })).toBeNull();
  expect(fieldNavigation({ ...base, index: 2 })).toBeNull();
  expect(fieldNavigation({ ...base, key: "ArrowLeft", start: 0, end: 0, index: 1 })).toEqual({
    index: 0,
    caret: "end",
  });
  expect(fieldNavigation({ ...base, key: "ArrowUp", index: 1 })).toEqual({
    index: 0,
    caret: "end",
  });
});
test("multiline native arrows, composition, selections, modifiers and tab are preserved", () => {
  for (const override of [
    { multiline: true, key: "ArrowDown" },
    { composing: true },
    { modified: true },
    { start: 0, end: 4 },
    { key: "Tab" },
  ]) {
    expect(fieldNavigation({ ...base, ...override })).toBeNull();
  }
});
test("exports contain literal escaped content and semantic paragraphs, not executable markup", () => {
  expect(semanticHtml('<script>alert("x")</script>\nnext\n\nlast')).toBe(
    "<p>&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;<br>\nnext</p>\n<p>last</p>",
  );
  expect(escapeHtml("&<>\"'")).toBe("&amp;&lt;&gt;&quot;&#39;");
  expect(markdownText("# Heading\n[link](bad)")).toBe("\\# Heading  \n\\[link\\]\\(bad\\)");
  expect(filename("A/B:<test>?")).toBe("A-B--test--");
});
test("the settings schema validates all defaults and rejects bad intervals", () => {
  expect(isSettings(defaultSettings)).toBe(true);
  const interval = settingsSchema.find((item) => item.id === "autosaveSeconds")!;
  for (const value of [0, -1, 1.2, NaN, Infinity, "60", 3601])
    expect(isValidSetting(interval, value)).toBe(false);
  expect(isValidSetting(interval, 60)).toBe(true);
});
test("logging snapshots parameters and cyclic values cannot break the application", () => {
  const value: { count: number; self?: unknown } = { count: 1 };
  const snapshot = snapshotParameters(value);
  value.count = 2;
  expect(snapshot).toBe('{"count":1}');
  value.self = value;
  expect(snapshotParameters(value)).toContain("could not be serialized");
});
