import { describe, expect, test } from "bun:test";
import { createOverlayApp } from "../../src/overlay.js";
import { TOOL_NAMESPACE } from "../../src/utils.js";
import { buildFixture } from "./fixtures/matrix-fixtures.js";

const cases = [
  {
    id: "OV01",
    title: "Mount creates recorder shell and overlays",
    description:
      "Overlay mount should create host shadow UI and page-level overlay layers for highlight, area, drag, and match markers.",
    fixture: "shell",
    mutate: { nav: true, toolbar: true },
    act: "mountOverlay",
    expect: { hostExists: true, windowExists: true, overlayNodesExist: true },
  },
  {
    id: "OV02",
    title: "Mode switch to area updates stable UI state",
    description:
      "Switching to area mode should update toolbar state and status/subtitle text to area mode.",
    fixture: "shell",
    mutate: { nav: true, toolbar: true },
    act: "mountAndClick:Select Area",
    expect: { subtitleMentions: "area mode", statusMentions: "Area mode enabled" },
  },
  {
    id: "OV03",
    title: "Clear action empties selected objects",
    description:
      "After selecting one object in inspect mode, clear should reset selected count and restore empty-state guidance.",
    fixture: "chat",
    mutate: { sendButtonSignal: "data-testid" },
    act: "selectOneThenClear",
    expect: { selectedCountText: "0 selected", emptyStateMentions: "Select Element or Select Area" },
  },
  {
    id: "OV04",
    title: "Show JSON reveals export preview",
    description:
      "With selected objects present, show JSON should reveal the preview textarea with serialized content.",
    fixture: "chat",
    mutate: { sendButtonSignal: "data-testid" },
    act: "selectOneThenShowJson",
    expect: { previewVisible: true, previewContains: ["\"objects\"", "\"selector\"", "\"kind\""] },
  },
  {
    id: "OV05",
    title: "Copy JSON uses clipboard and updates status",
    description:
      "Copy action should call clipboard writeText and update status with copy confirmation when the promise resolves.",
    fixture: "chat",
    mutate: { sendButtonSignal: "data-testid" },
    act: "selectOneThenCopyJson",
    expect: { clipboardCalled: true, statusMentions: "copied" },
  },
  {
    id: "OV06",
    title: "Area drag rectangle is visible during drag",
    description:
      "In area mode, drag box should appear during pointer drag and hide after pointerup to prevent stuck selection overlays.",
    fixture: "chat",
    mutate: {},
    act: "areaDragLifecycle",
    expect: { dragVisibleDuringDrag: true, dragHiddenAfterDrop: true },
  },
  {
    id: "OV07",
    title: "Heuristic popover closes on Escape without blocking selector controls",
    description:
      "Heuristic picker should close on Escape and keep selector test controls accessible instead of covering them persistently.",
    fixture: "chat",
    mutate: { sendButtonSignal: "data-testid" },
    act: "heuristicPopoverEscape",
    expect: { popoverClosed: true, testButtonAccessible: true },
  },
];

function findHost() {
  return Array.from(document.documentElement.children).find((node) =>
    node.shadowRoot?.querySelector(`.${TOOL_NAMESPACE}-shell`),
  );
}

function findButton(shadowRoot, label) {
  return Array.from(shadowRoot.querySelectorAll("button")).find(
    (button) => button.textContent?.trim() === label,
  );
}

function dispatchPointer(type, x, y, target = document.body) {
  target.dispatchEvent(
    new window.MouseEvent(type, {
      bubbles: true,
      cancelable: true,
      clientX: x,
      clientY: y,
    }),
  );
}

function findDragBoxNode() {
  return Array.from(document.querySelectorAll("div")).find((node) =>
    node.style.border.includes("245, 150, 35"),
  );
}

function selectInspectTarget(targetElement) {
  const original = document.elementFromPoint;
  document.elementFromPoint = () => targetElement;
  dispatchPointer("pointermove", 400, 600);
  document.body.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true }));
  document.elementFromPoint = original;
}

async function runCase(row) {
  const { aliases } = buildFixture(row.fixture, row.mutate);
  const app = createOverlayApp(window);
  app.mount();

  const host = findHost();
  if (!host) {
    throw new Error(`Overlay host missing for ${row.id}`);
  }

  const shadowRoot = host.shadowRoot;
  const statusNode = shadowRoot.querySelector(`.${TOOL_NAMESPACE}-status`);
  const subtitleNode = shadowRoot.querySelector(`.${TOOL_NAMESPACE}-subtitle`);

  const result = {
    host,
    shadowRoot,
    statusText: statusNode?.textContent ?? "",
    subtitleText: subtitleNode?.textContent ?? "",
    clipboardCalls: 0,
  };

  try {
    if (row.act === "mountOverlay") {
      result.windowExists = Boolean(shadowRoot.querySelector(`.${TOOL_NAMESPACE}-window`));
      result.overlayNodesExist = Boolean(findDragBoxNode()) && document.querySelectorAll("div").length > 0;
      return result;
    }

    if (row.act.startsWith("mountAndClick:")) {
      const label = row.act.split(":")[1];
      findButton(shadowRoot, label)?.click();
      result.statusText = statusNode?.textContent ?? "";
      result.subtitleText = subtitleNode?.textContent ?? "";
      return result;
    }

    if (row.act === "selectOneThenClear") {
      selectInspectTarget(aliases.sendButton);
      findButton(shadowRoot, "Clear")?.click();
      result.selectedCountText = Array.from(
        shadowRoot.querySelectorAll(`.${TOOL_NAMESPACE}-pill`),
      ).find((node) => node.textContent?.includes("selected"))?.textContent ?? "";
      result.emptyStateText =
        shadowRoot.querySelector(`.${TOOL_NAMESPACE}-selected-list .${TOOL_NAMESPACE}-empty`)?.textContent ?? "";
      return result;
    }

    if (row.act === "selectOneThenShowJson") {
      selectInspectTarget(aliases.sendButton);
      findButton(shadowRoot, "Show JSON")?.click();
      const preview = shadowRoot.querySelector('textarea[aria-label="Exported JSON preview"]');
      result.previewVisible = Boolean(preview && !preview.closest("section")?.hidden);
      result.previewText = preview?.value ?? "";
      return result;
    }

    if (row.act === "selectOneThenCopyJson") {
      const clipboard = navigator.clipboard;
      const originalWriteText = clipboard.writeText;
      clipboard.writeText = async () => {
        result.clipboardCalls += 1;
      };

      selectInspectTarget(aliases.sendButton);
      findButton(shadowRoot, "Copy JSON")?.click();
      await new Promise((resolve) => setTimeout(resolve, 0));
      result.statusText = statusNode?.textContent ?? "";

      clipboard.writeText = originalWriteText;
      return result;
    }

    if (row.act === "areaDragLifecycle") {
      findButton(shadowRoot, "Select Area")?.click();
      dispatchPointer("pointerdown", 320, 610, document.body);
      dispatchPointer("pointermove", 520, 700, document);
      const dragBox = findDragBoxNode();
      result.dragVisibleDuringDrag = Boolean(dragBox && dragBox.style.display === "block");
      dispatchPointer("pointerup", 520, 700, document);
      result.dragHiddenAfterDrop = Boolean(dragBox && dragBox.style.display === "none");
      return result;
    }

    if (row.act === "heuristicPopoverEscape") {
      selectInspectTarget(aliases.sendButton);
      shadowRoot
        .querySelector(`.${TOOL_NAMESPACE}-heuristic-anchor button`)
        ?.click();
      const popover = shadowRoot.querySelector(`.${TOOL_NAMESPACE}-popover`);
      expect(popover?.hidden).toBe(false);

      document.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
      result.popoverClosed = Boolean(popover?.hidden);
      result.testButtonAccessible = Boolean(findButton(shadowRoot, "Test Selector"));
      return result;
    }

    throw new Error(`Unsupported action ${row.act}`);
  } finally {
    app.destroy();
  }
}

function assertCase(actual, expected) {
  if (expected.hostExists) {
    expect(Boolean(actual.host)).toBe(true);
  }
  if (expected.windowExists) {
    expect(actual.windowExists).toBe(true);
  }
  if (expected.overlayNodesExist) {
    expect(actual.overlayNodesExist).toBe(true);
  }
  if (expected.subtitleMentions) {
    expect(actual.subtitleText.toLowerCase().includes(expected.subtitleMentions.toLowerCase())).toBe(true);
  }
  if (expected.statusMentions) {
    expect(actual.statusText.toLowerCase().includes(expected.statusMentions.toLowerCase())).toBe(true);
  }
  if (expected.selectedCountText) {
    expect(actual.selectedCountText).toContain(expected.selectedCountText);
  }
  if (expected.emptyStateMentions) {
    expect(actual.emptyStateText.includes(expected.emptyStateMentions)).toBe(true);
  }
  if (typeof expected.previewVisible === "boolean") {
    expect(actual.previewVisible).toBe(expected.previewVisible);
  }
  if (expected.previewContains) {
    for (const snippet of expected.previewContains) {
      expect(actual.previewText.includes(snippet)).toBe(true);
    }
  }
  if (expected.clipboardCalled) {
    expect(actual.clipboardCalls).toBeGreaterThan(0);
  }
  if (typeof expected.dragVisibleDuringDrag === "boolean") {
    expect(actual.dragVisibleDuringDrag).toBe(expected.dragVisibleDuringDrag);
  }
  if (typeof expected.dragHiddenAfterDrop === "boolean") {
    expect(actual.dragHiddenAfterDrop).toBe(expected.dragHiddenAfterDrop);
  }
  if (typeof expected.popoverClosed === "boolean") {
    expect(actual.popoverClosed).toBe(expected.popoverClosed);
  }
  if (typeof expected.testButtonAccessible === "boolean") {
    expect(actual.testButtonAccessible).toBe(expected.testButtonAccessible);
  }
}

describe("overlay matrix", () => {
  for (const row of cases) {
    test(`${row.id} ${row.title}`, async () => {
      const actual = await runCase(row);
      assertCase(actual, row.expect);
      expect(row.description.length).toBeGreaterThan(20);
    });
  }
});
