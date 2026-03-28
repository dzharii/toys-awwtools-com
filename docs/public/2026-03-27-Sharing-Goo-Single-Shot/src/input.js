import { extractPreferredUrlFromDataTransfer, normalizeUrl, parseUrlCandidates } from "./utils.js";

export class InputController {
  constructor(options) {
    this.element = options.element;
    this.pasteReceiver = options.pasteReceiver;
    this.geometry = options.geometry;
    this.onPointer = options.onPointer;
    this.onPointerLeave = options.onPointerLeave;
    this.onDropUrl = options.onDropUrl;
    this.onTrustedInteraction = options.onTrustedInteraction;
    this.onDragStateChange = options.onDragStateChange;
    this.onFocusChange = options.onFocusChange;
    this.dragDepth = 0;
  }

  attach() {
    this.element.addEventListener("pointerdown", this.#handleTrustedInteraction, { passive: true });
    this.element.addEventListener("pointermove", this.#handlePointerMove, { passive: true });
    this.element.addEventListener("pointerenter", this.#handlePointerMove, { passive: true });
    this.element.addEventListener("pointerleave", this.#handlePointerLeave, { passive: true });

    this.element.addEventListener("dragenter", this.#handleDragEnter);
    this.element.addEventListener("dragover", this.#handleDragOver);
    this.element.addEventListener("dragleave", this.#handleDragLeave);
    this.element.addEventListener("drop", this.#handleDrop);

    this.element.addEventListener("touchstart", this.#handleTrustedInteraction, { passive: true });
    this.element.addEventListener("touchmove", this.#handleTouchMove, { passive: true });
    this.element.addEventListener("touchend", this.#handlePointerLeave, { passive: true });
    this.element.addEventListener("touchcancel", this.#handlePointerLeave, { passive: true });

    window.addEventListener("paste", this.#handlePaste);
    window.addEventListener("keydown", this.#handleKeydown, { passive: false });

    this.pasteReceiver.addEventListener("focus", () => this.onFocusChange(true));
    this.pasteReceiver.addEventListener("blur", () => this.onFocusChange(false));
    this.pasteReceiver.addEventListener("pointerdown", () => {
      this.pasteReceiver.focus({ preventScroll: true });
    });
  }

  detach() {
    this.element.removeEventListener("pointerdown", this.#handleTrustedInteraction);
    this.element.removeEventListener("pointermove", this.#handlePointerMove);
    this.element.removeEventListener("pointerenter", this.#handlePointerMove);
    this.element.removeEventListener("pointerleave", this.#handlePointerLeave);

    this.element.removeEventListener("dragenter", this.#handleDragEnter);
    this.element.removeEventListener("dragover", this.#handleDragOver);
    this.element.removeEventListener("dragleave", this.#handleDragLeave);
    this.element.removeEventListener("drop", this.#handleDrop);

    this.element.removeEventListener("touchstart", this.#handleTrustedInteraction);
    this.element.removeEventListener("touchmove", this.#handleTouchMove);
    this.element.removeEventListener("touchend", this.#handlePointerLeave);
    this.element.removeEventListener("touchcancel", this.#handlePointerLeave);

    window.removeEventListener("paste", this.#handlePaste);
    window.removeEventListener("keydown", this.#handleKeydown);
  }

  #handleTrustedInteraction = () => {
    this.onTrustedInteraction();
    this.pasteReceiver.focus({ preventScroll: true });
  };

  #handlePointerMove = (event) => {
    const point = this.geometry.redirectPixelToInterior(event.clientX, event.clientY);
    const normalized = this.geometry.pixelToNormalized(point.x, point.y);
    if (!normalized) return;
    this.onPointer(normalized.x, normalized.y, event.clientX, event.clientY);
  };

  #handleTouchMove = (event) => {
    const touch = event.touches && event.touches[0];
    if (!touch) return;
    const point = this.geometry.redirectPixelToInterior(touch.clientX, touch.clientY);
    const normalized = this.geometry.pixelToNormalized(point.x, point.y);
    if (!normalized) return;
    this.onPointer(normalized.x, normalized.y, touch.clientX, touch.clientY);
  };

  #handlePointerLeave = () => {
    this.onPointerLeave();
  };

  #handleDragEnter = (event) => {
    if (!this.#dragEventContainsUrl(event)) return;
    event.preventDefault();
    this.dragDepth += 1;
    this.onTrustedInteraction();
    const normalized = this.#normalizedFromClient(event.clientX, event.clientY);
    this.onDragStateChange(true, normalized);
  };

  #handleDragOver = (event) => {
    if (!this.#dragEventContainsUrl(event)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    const normalized = this.#normalizedFromClient(event.clientX, event.clientY);
    this.onDragStateChange(true, normalized);
    this.onPointer(normalized.x, normalized.y, event.clientX, event.clientY);
  };

  #handleDragLeave = (event) => {
    if (!this.#dragEventContainsUrl(event)) return;
    event.preventDefault();
    this.dragDepth = Math.max(0, this.dragDepth - 1);
    if (this.dragDepth === 0) {
      this.onDragStateChange(false, null);
    }
  };

  #handleDrop = (event) => {
    if (!this.#dragEventContainsUrl(event)) return;
    event.preventDefault();
    this.dragDepth = 0;
    this.onDragStateChange(false, null);
    const normalized = this.#normalizedFromClient(event.clientX, event.clientY);
    const url = extractPreferredUrlFromDataTransfer(event.dataTransfer);
    if (url) {
      this.onDropUrl(url, normalized, "drop");
    }
  };

  #handlePaste = (event) => {
    this.onTrustedInteraction();
    const text = event.clipboardData?.getData("text/plain") ?? "";
    const candidates = parseUrlCandidates(text);
    let normalized = null;
    for (const candidate of candidates) {
      normalized = normalizeUrl(candidate);
      if (normalized) break;
    }
    if (!normalized) return;

    event.preventDefault();
    const fallback = { x: 0.5, y: 0.34 };
    this.onDropUrl(normalized, fallback, "paste");
  };

  #handleKeydown = (event) => {
    const isPasteShortcut =
      (event.metaKey || event.ctrlKey) &&
      !event.altKey &&
      !event.shiftKey &&
      String(event.key).toLowerCase() === "v";

    if (isPasteShortcut) {
      this.pasteReceiver.focus({ preventScroll: true });
    }
  };

  #normalizedFromClient(clientX, clientY) {
    const point = this.geometry.redirectPixelToInterior(clientX, clientY);
    return this.geometry.pixelToNormalized(point.x, point.y) ?? { x: 0.5, y: 0.5 };
  }

  #dragEventContainsUrl(event) {
    const types = Array.from(event.dataTransfer?.types ?? []);
    return types.includes("text/uri-list") || types.includes("text/plain");
  }
}

