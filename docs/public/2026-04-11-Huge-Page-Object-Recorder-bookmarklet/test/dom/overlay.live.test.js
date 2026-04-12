import { describe, expect, test } from "bun:test";
import { createOverlayApp } from "../../src/overlay.js";
import { TOOL_NAMESPACE } from "../../src/utils.js";
import { buildFixture, setRect } from "./fixtures/matrix-fixtures.js";

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

function findHoverHighlight() {
  return Array.from(document.querySelectorAll("div")).find((node) =>
    node.style.border.includes("30, 117, 255"),
  );
}

function findSelectedHighlights() {
  return Array.from(document.querySelectorAll('[data-overlay-role="selected"]'));
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

async function flushOverlay() {
  await new Promise((resolve) => setTimeout(resolve, 0));
  await new Promise((resolve) => setTimeout(resolve, 0));
}

describe("overlay live geometry", () => {
  test("hover highlight tracks live geometry after layout events", async () => {
    const { aliases } = buildFixture("chat", { sendButtonSignal: "data-testid" });
    const app = createOverlayApp(window);
    app.mount();

    const original = document.elementFromPoint;
    document.elementFromPoint = () => aliases.sendButton;

    try {
      dispatchPointer("pointermove", 400, 600, document);
      await flushOverlay();
      const highlight = findHoverHighlight();
      expect(Boolean(highlight)).toBe(true);
      expect(highlight.style.left).toBe("1100px");

      setRect(aliases.sendButton, {
        left: 1005,
        top: 640,
        width: 120,
        height: 48,
      });
      document.dispatchEvent(new window.Event("scroll", { bubbles: false, cancelable: false }));
      await flushOverlay();

      expect(highlight.style.left).toBe("1005px");
      expect(highlight.style.top).toBe("640px");
    } finally {
      document.elementFromPoint = original;
      app.destroy();
    }
  });

  test("nested scroll layout events keep hover highlight aligned", async () => {
    const { aliases } = buildFixture("chat", { repeatCount: 5, transcriptScrollable: true });
    const target = aliases.transcript.querySelector("article");
    const app = createOverlayApp(window);
    app.mount();

    const original = document.elementFromPoint;
    document.elementFromPoint = () => target;

    try {
      dispatchPointer("pointermove", 410, 160, document);
      await flushOverlay();
      const highlight = findHoverHighlight();
      expect(Boolean(highlight)).toBe(true);

      setRect(target, {
        left: 360,
        top: 120,
        width: 860,
        height: 60,
      });
      aliases.transcript.dispatchEvent(new window.Event("scroll", { bubbles: false, cancelable: false }));
      await flushOverlay();

      expect(highlight.style.left).toBe("360px");
      expect(highlight.style.top).toBe("120px");
    } finally {
      document.elementFromPoint = original;
      app.destroy();
    }
  });

  test("selected highlight tracks geometry updates for selected object", async () => {
    const { aliases } = buildFixture("chat", { sendButtonSignal: "data-testid" });
    const app = createOverlayApp(window);
    app.mount();

    const original = document.elementFromPoint;
    document.elementFromPoint = () => aliases.sendButton;

    try {
      dispatchPointer("pointermove", 400, 600, document);
      aliases.sendButton.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true }));
      await flushOverlay();

      let selectedMarkers = findSelectedHighlights();
      expect(selectedMarkers.length).toBeGreaterThan(0);
      expect(selectedMarkers[0].style.left).toBe("1100px");

      setRect(aliases.sendButton, {
        left: 960,
        top: 602,
        width: 120,
        height: 48,
      });
      window.dispatchEvent(new window.Event("resize"));
      await flushOverlay();

      selectedMarkers = findSelectedHighlights();
      expect(selectedMarkers.length).toBeGreaterThan(0);
      expect(selectedMarkers[0].style.left).toBe("960px");
      expect(selectedMarkers[0].style.top).toBe("602px");
    } finally {
      document.elementFromPoint = original;
      app.destroy();
    }
  });

  test("inspect click is shielded from underlying page action", async () => {
    const { aliases } = buildFixture("chat", { sendButtonSignal: "data-testid" });
    const app = createOverlayApp(window);
    app.mount();

    const host = findHost();
    const shadowRoot = host.shadowRoot;

    let clickCount = 0;
    aliases.sendButton.addEventListener("click", () => {
      clickCount += 1;
    });

    const original = document.elementFromPoint;
    document.elementFromPoint = () => aliases.sendButton;

    try {
      dispatchPointer("pointermove", 400, 600, document);
      aliases.sendButton.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true }));
      await flushOverlay();

      const selectedCount = Array.from(shadowRoot.querySelectorAll(`.${TOOL_NAMESPACE}-pill`)).find((node) =>
        node.textContent?.includes("selected"),
      )?.textContent;

      expect(clickCount).toBe(0);
      expect(selectedCount).toContain("1 selected");
    } finally {
      document.elementFromPoint = original;
      app.destroy();
    }
  });

  test("area pointerdown prevents pass-through activation", () => {
    const { aliases } = buildFixture("chat", { sendButtonSignal: "data-testid" });
    const app = createOverlayApp(window);
    app.mount();

    const host = findHost();
    const shadowRoot = host.shadowRoot;
    findButton(shadowRoot, "Select Area")?.click();

    try {
      const allowed = aliases.sendButton.dispatchEvent(
        new window.MouseEvent("pointerdown", {
          bubbles: true,
          cancelable: true,
          clientX: 1110,
          clientY: 610,
        }),
      );
      expect(allowed).toBe(false);
    } finally {
      app.destroy();
    }
  });
});
