import { afterEach } from "bun:test";
import { GlobalRegistrator } from "@happy-dom/global-registrator";

GlobalRegistrator.register();

if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

if (typeof window !== "undefined" && typeof window.matchMedia !== "function") {
  window.matchMedia = (query) => ({
    matches: false,
    media: String(query ?? ""),
    onchange: null,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent() {
      return false;
    },
  });
}

if (typeof navigator !== "undefined") {
  if (!navigator.clipboard) {
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: async () => {},
      },
      configurable: true,
    });
  } else if (typeof navigator.clipboard.writeText !== "function") {
    navigator.clipboard.writeText = async () => {};
  }
}

afterEach(() => {
  if (typeof document !== "undefined") {
    if (document.body) {
      document.body.innerHTML = "";
    }
    if (document.head) {
      document.head.innerHTML = "";
    }
  }
});
