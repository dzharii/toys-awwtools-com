import { describe, expect, test } from "bun:test";
import { createOverlayApp } from "../../src/overlay.js";
import { TOOL_NAMESPACE } from "../../src/utils.js";
import { buildFixture } from "./fixtures/matrix-fixtures.js";

function findHostInDocument(targetDocument) {
  return Array.from(targetDocument.documentElement.children).find((node) =>
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

function selectInspectTarget(targetElement) {
  const original = document.elementFromPoint;
  document.elementFromPoint = () => targetElement;
  dispatchPointer("pointermove", 420, 620, document);
  document.body.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true }));
  document.elementFromPoint = original;
}

function createPopupStub() {
  const eventTarget = new EventTarget();
  const popupDocument = document.implementation.createHTMLDocument("popup");
  return {
    document: popupDocument,
    closed: false,
    outerWidth: 960,
    outerHeight: 780,
    screenX: 42,
    screenY: 56,
    focusCalled: 0,
    addEventListener: eventTarget.addEventListener.bind(eventTarget),
    removeEventListener: eventTarget.removeEventListener.bind(eventTarget),
    dispatchEvent: eventTarget.dispatchEvent.bind(eventTarget),
    focus() {
      this.focusCalled += 1;
    },
    close() {
      this.closed = true;
    },
  };
}

describe("overlay popup", () => {
  test("shows Open in popup window action in inline titlebar", () => {
    buildFixture("shell", { nav: true, toolbar: true });
    const app = createOverlayApp(window);
    app.mount();

    try {
      const host = findHostInDocument(document);
      expect(host).toBeDefined();
      const button = findButton(host.shadowRoot, "Open in popup window");
      expect(Boolean(button)).toBe(true);
      expect(button.hidden).toBe(false);
    } finally {
      app.destroy();
    }
  });

  test("blocked popup keeps recorder inline and shows actionable status", () => {
    buildFixture("shell", { nav: true, toolbar: true });
    const app = createOverlayApp(window);
    app.mount();

    const originalOpen = window.open;
    window.open = () => null;

    try {
      const host = findHostInDocument(document);
      const shadowRoot = host.shadowRoot;
      findButton(shadowRoot, "Open in popup window")?.click();

      const statusText = shadowRoot.querySelector(`.${TOOL_NAMESPACE}-status`)?.textContent ?? "";
      expect(statusText.toLowerCase()).toContain("blocked");
      expect(Boolean(findHostInDocument(document))).toBe(true);
    } finally {
      window.open = originalOpen;
      app.destroy();
    }
  });

  test("transfers to popup and returns inline with state preserved", () => {
    const { aliases } = buildFixture("chat", { sendButtonSignal: "data-testid" });
    window.sessionStorage.setItem(
      "huge-page-object-recorder:window-state",
      JSON.stringify({
        frame: { left: 660, top: 380, width: 440, height: 320 },
        themeId: "macos",
      }),
    );
    const app = createOverlayApp(window);
    app.mount();

    const originalOpen = window.open;
    const popup = createPopupStub();
    window.open = () => popup;

    try {
      let host = findHostInDocument(document);
      const shadowRoot = host.shadowRoot;

      selectInspectTarget(aliases.sendButton);
      const beforeTransferCount = Array.from(
        shadowRoot.querySelectorAll(`.${TOOL_NAMESPACE}-pill`),
      ).find((node) => node.textContent?.includes("selected"))?.textContent;
      expect(beforeTransferCount).toContain("1 selected");

      findButton(shadowRoot, "Open in popup window")?.click();

      const popupHost = findHostInDocument(popup.document);
      expect(Boolean(popupHost)).toBe(true);
      const popupShadow = popupHost.shadowRoot;
      const shell = popupShadow.querySelector(`.${TOOL_NAMESPACE}-shell`);
      const popupWindowNode = popupShadow.querySelector(`.${TOOL_NAMESPACE}-window`);
      expect(shell?.dataset.hostMode).toBe("popup");
      expect(findButton(popupShadow, "Open in popup window")?.hidden).toBe(true);
      expect(findButton(popupShadow, "Return to page")?.hidden).toBe(false);
      expect(popupWindowNode?.style.left).toBe("");
      expect(popupWindowNode?.style.top).toBe("");
      expect(popupWindowNode?.style.width).toBe("");
      expect(popupWindowNode?.style.height).toBe("");
      expect(popup.document.documentElement.style.overflow).toBe("hidden");
      expect(popup.document.body.style.overflow).toBe("hidden");

      findButton(popupShadow, "Return to page")?.click();

      host = findHostInDocument(document);
      expect(Boolean(host)).toBe(true);
      const restoredShadow = host.shadowRoot;
      const restoredShell = restoredShadow.querySelector(`.${TOOL_NAMESPACE}-shell`);
      const restoredWindowNode = restoredShadow.querySelector(`.${TOOL_NAMESPACE}-window`);
      expect(restoredShell?.dataset.hostMode).toBe("inline");
      expect(Boolean(restoredWindowNode?.style.left)).toBe(true);
      expect(Boolean(restoredWindowNode?.style.top)).toBe(true);
      expect(Boolean(restoredWindowNode?.style.width)).toBe(true);
      expect(Boolean(restoredWindowNode?.style.height)).toBe(true);
      const afterTransferCount = Array.from(
        restoredShadow.querySelectorAll(`.${TOOL_NAMESPACE}-pill`),
      ).find((node) => node.textContent?.includes("selected"))?.textContent;
      expect(afterTransferCount).toContain("1 selected");
      expect(popup.closed).toBe(true);
    } finally {
      window.open = originalOpen;
      app.destroy();
    }
  });
});
