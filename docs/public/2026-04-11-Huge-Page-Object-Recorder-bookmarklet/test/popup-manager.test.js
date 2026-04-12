import { describe, expect, test } from "bun:test";
import {
  capturePopupGeometry,
  closePopupWindow,
  isPopupAlive,
  monitorPopupClosed,
  openRecorderPopup,
} from "../src/popup-manager.js";

function createPopupStub() {
  const eventTarget = new EventTarget();
  const document = window.document.implementation.createHTMLDocument("popup");
  const popup = {
    document,
    closed: false,
    outerWidth: 900,
    outerHeight: 700,
    screenX: 24,
    screenY: 36,
    focused: 0,
    addEventListener: eventTarget.addEventListener.bind(eventTarget),
    removeEventListener: eventTarget.removeEventListener.bind(eventTarget),
    dispatchEvent: eventTarget.dispatchEvent.bind(eventTarget),
    focus() {
      this.focused += 1;
    },
    close() {
      this.closed = true;
    },
  };
  return popup;
}

describe("popup manager", () => {
  test("reuses alive popup and focuses it", () => {
    const popup = createPopupStub();
    const opener = {
      open() {
        throw new Error("should not open a second popup");
      },
    };

    const result = openRecorderPopup(opener, {
      currentPopup: popup,
      title: "Recorder",
    });

    expect(result.blocked).toBe(false);
    expect(result.reused).toBe(true);
    expect(result.popupWindow).toBe(popup);
    expect(popup.focused).toBe(1);
  });

  test("returns blocked when opener cannot open popup", () => {
    const opener = {
      open() {
        return null;
      },
    };

    const result = openRecorderPopup(opener, { title: "Recorder" });
    expect(result.blocked).toBe(true);
    expect(result.popupWindow).toBeNull();
  });

  test("opens popup and sets title", () => {
    const popup = createPopupStub();
    const opener = {
      open() {
        return popup;
      },
    };

    const result = openRecorderPopup(opener, { title: "Recorder Popup" });
    expect(result.blocked).toBe(false);
    expect(result.reused).toBe(false);
    expect(result.popupWindow).toBe(popup);
    expect(popup.document.title).toBe("Recorder Popup");
    expect(isPopupAlive(popup)).toBe(true);
  });

  test("tracks close state and stop prevents duplicate callbacks", () => {
    const popup = createPopupStub();
    let closeCount = 0;
    const originalSetInterval = globalThis.setInterval;
    const originalClearInterval = globalThis.clearInterval;
    let scheduledTick = null;
    let clearedTimer = null;

    globalThis.setInterval = (fn) => {
      scheduledTick = fn;
      return 321;
    };
    globalThis.clearInterval = (timerId) => {
      clearedTimer = timerId;
    };

    try {
      const monitor = monitorPopupClosed(popup, () => {
        closeCount += 1;
      }, 40);

      popup.close();
      scheduledTick?.();
      expect(closeCount).toBe(1);

      monitor.stop();
      expect(clearedTimer).toBe(321);
      expect(closeCount).toBe(1);
    } finally {
      globalThis.setInterval = originalSetInterval;
      globalThis.clearInterval = originalClearInterval;
    }
  });

  test("captures and closes popup safely", () => {
    const popup = createPopupStub();
    const geometry = capturePopupGeometry(popup);
    expect(geometry).toEqual({
      width: 900,
      height: 700,
      left: 24,
      top: 36,
    });

    closePopupWindow(popup);
    expect(popup.closed).toBe(true);
    expect(isPopupAlive(popup)).toBe(false);
  });
});
