import { describe, expect, test } from "bun:test";
import { chooseDefaultTheme, cycleTheme, getThemeMeta } from "../src/ui/themes.js";
import {
  appendChildren,
  createButton,
  createInput,
  createLabel,
  createNode,
  createSection,
  createTextarea,
  replaceChildren,
} from "../src/ui/dom.js";

function makeFakeElement(tagName) {
  return {
    tagName,
    className: "",
    textContent: "",
    value: "",
    type: "",
    name: "",
    id: "",
    part: "",
    style: {},
    dataset: {},
    attributes: {},
    children: [],
    append(...children) {
      this.children.push(...children);
    },
    setAttribute(name, value) {
      this.attributes[name] = String(value);
    },
    listeners: {},
    addEventListener(name, handler) {
      this.listeners[name] = handler;
    },
    replaceChildren() {
      this.children = [];
    },
  };
}

function makeFakeDocument() {
  return {
    createElement(tagName) {
      return makeFakeElement(tagName);
    },
  };
}

describe("ui helpers", () => {
  test("creates safe text-based nodes without html parsing", () => {
    const document = makeFakeDocument();
    const node = createNode(document, "div", {
      className: "panel",
      text: "<strong>literal</strong>",
      attrs: { role: "note" },
      dataset: { state: "ready" },
    });
    expect(node.className).toBe("panel");
    expect(node.textContent).toBe("<strong>literal</strong>");
    expect(node.attributes.role).toBe("note");
    expect(node.dataset.state).toBe("ready");
  });

  test("supports button, textarea, and replaceChildren helpers", () => {
    const document = makeFakeDocument();
    const button = createButton(document, { text: "Run", attrs: { "aria-label": "Run tool" } });
    const textarea = createTextarea(document, { value: "[data-testid=\"send\"]" });
    const parent = createNode(document, "div");
    replaceChildren(parent, [button, textarea]);
    expect(button.type).toBe("button");
    expect(button.attributes["aria-label"]).toBe("Run tool");
    expect(textarea.value).toBe('[data-testid="send"]');
    expect(parent.children).toHaveLength(2);
  });

  test("covers helper options and convenience constructors", () => {
    const document = makeFakeDocument();
    const input = createInput(document, {
      type: "search",
      name: "query",
      id: "query",
      part: "field",
      value: "value",
      style: { width: "100%" },
      properties: { autocomplete: "off" },
      on: { input() {} },
    });
    const label = createLabel(document, {}, ["Query"]);
    const section = createSection(document, { className: "stack" }, [label, input]);
    appendChildren(section, [null, undefined, false, "tail"]);

    expect(input.type).toBe("search");
    expect(input.name).toBe("query");
    expect(input.id).toBe("query");
    expect(input.part).toBe("field");
    expect(input.style.width).toBe("100%");
    expect(input.autocomplete).toBe("off");
    expect(typeof input.listeners.input).toBe("function");
    expect(section.className).toBe("stack");
    expect(section.children.at(-1)).toBe("tail");
  });
});

describe("themes", () => {
  test("uses inverse desktop defaults", () => {
    expect(
      chooseDefaultTheme({ navigator: { platform: "MacIntel", userAgent: "Macintosh" } }),
    ).toBe("windowsXp");
    expect(
      chooseDefaultTheme({ navigator: { platform: "Win32", userAgent: "Windows NT" } }),
    ).toBe("macos");
    expect(
      chooseDefaultTheme({ navigator: { platform: "Linux x86_64", userAgent: "Linux" } }),
    ).toBe("macos");
    expect(
      chooseDefaultTheme({ navigator: { platform: "iPhone", userAgent: "iPhone Mobile Safari" } }),
    ).toBe("macos");
  });

  test("cycles and resolves theme metadata", () => {
    expect(cycleTheme("macos")).toBe("windowsXp");
    expect(getThemeMeta("windowsXp").label).toBe("Windows XP Utility");
  });
});
