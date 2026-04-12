import { describe, expect, test } from "bun:test";

const SOURCE_FILES = [
  "src/overlay.js",
  "src/entry.js",
  "src/ui/dom.js",
  "src/ui/themes.js",
  "src/ui/styles.js",
];

describe("ui safety", () => {
  test("does not use unsafe html insertion APIs in source", async () => {
    for (const file of SOURCE_FILES) {
      const source = await Bun.file(file).text();
      expect(source.includes("innerHTML")).toBe(false);
      expect(source.includes("outerHTML")).toBe(false);
      expect(source.includes("insertAdjacentHTML")).toBe(false);
      expect(source.includes("createContextualFragment")).toBe(false);
      expect(source.includes("template.innerHTML")).toBe(false);
    }
  });

  test("mounts ui into a shadow root and keeps selector strings textual", async () => {
    const overlaySource = await Bun.file("src/overlay.js").text();
    const domSource = await Bun.file("src/ui/dom.js").text();
    const styleSource = await Bun.file("src/ui/styles.js").text();
    expect(overlaySource.includes("attachShadow")).toBe(true);
    expect(domSource.includes("textContent")).toBe(true);
    expect(styleSource.includes(".${TOOL_NAMESPACE}-popover")).toBe(true);
    expect(styleSource.includes("position: static;")).toBe(true);
    expect(overlaySource.includes("renderAreaPreview")).toBe(true);
    expect(overlaySource.includes("setOverlayStyle(refs.dragBox")).toBe(true);
  });
});
