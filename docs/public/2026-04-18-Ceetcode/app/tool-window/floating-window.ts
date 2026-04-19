import { attachDragBehavior, type FloatingWindowGeometry } from "./drag";
import { attachResizeBehavior, type ResizeDirection } from "./resize";

const DEFAULT_VIEWPORT_MARGIN = 10;
let nextFloatingWindowZIndex = 1300;

export interface FloatingWindowOptions {
  id: string;
  title: string;
  minWidth: number;
  minHeight: number;
  defaultWidthRatio?: number;
  defaultHeightRatio?: number;
  maxWidth?: number;
  maxHeight?: number;
  viewportMargin?: number;
  storageKey?: string;
  onRequestClose?: () => void;
  onRequestOpenStandalone?: () => void;
  onOpenStateChanged?: (isOpen: boolean) => void;
}

interface PersistedGeometry {
  left: number;
  top: number;
  width: number;
  height: number;
}

type InteractionPhase = "idle" | "dragging" | "resizing";

function clamp(value: number, min: number, max: number): number {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

function createResizeHandle(direction: ResizeDirection): HTMLDivElement {
  const handle = document.createElement("div");
  handle.className = `tool-window-resize-handle handle-${direction}`;
  handle.dataset.resizeDir = direction;
  handle.setAttribute("aria-hidden", "true");
  return handle;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export class FloatingToolWindow {
  private readonly options: FloatingWindowOptions;
  private readonly root: HTMLDivElement;
  private readonly titleElement: HTMLSpanElement;
  private readonly contentElement: HTMLDivElement;
  private readonly interactionOverlay: HTMLDivElement;
  private readonly dragCleanup: () => void;
  private readonly resizeCleanup: () => void;
  private geometry: FloatingWindowGeometry;
  private previewOffset = { x: 0, y: 0 };
  private interactionPhase: InteractionPhase = "idle";
  private rafId: number | null = null;
  private isCurrentlyOpen = false;

  constructor(options: FloatingWindowOptions) {
    this.options = options;
    const viewportMargin = options.viewportMargin ?? DEFAULT_VIEWPORT_MARGIN;

    this.geometry = this.buildDefaultGeometry();

    this.root = document.createElement("div");
    this.root.className = "tool-window";
    this.root.dataset.toolWindowId = options.id;
    this.root.dataset.testid = `${options.id}-window`;
    this.root.setAttribute("data-testid", `${options.id}-window`);
    this.root.hidden = true;

    const titleBar = document.createElement("header");
    titleBar.className = "tool-window-titlebar";
    titleBar.dataset.dragHandle = "true";

    const titleGroup = document.createElement("div");
    titleGroup.className = "tool-window-title-group";

    const titleText = document.createElement("span");
    titleText.className = "tool-window-title";
    titleText.textContent = options.title;
    titleText.setAttribute("data-testid", `${options.id}-title`);
    this.titleElement = titleText;

    titleGroup.appendChild(titleText);

    const controls = document.createElement("div");
    controls.className = "tool-window-controls";

    const popoutButton = document.createElement("button");
    popoutButton.type = "button";
    popoutButton.className = "tool-window-control tool-window-control-popout";
    popoutButton.textContent = "Pop Out";
    popoutButton.title = "Open in new tab";
    popoutButton.setAttribute("data-testid", `${options.id}-popout`);
    popoutButton.addEventListener("click", () => {
      options.onRequestOpenStandalone?.();
    });

    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = "tool-window-control tool-window-control-close";
    closeButton.textContent = "Close";
    closeButton.title = "Close";
    closeButton.setAttribute("data-testid", `${options.id}-close`);
    closeButton.addEventListener("click", () => {
      this.close();
      options.onRequestClose?.();
    });

    controls.appendChild(popoutButton);
    controls.appendChild(closeButton);

    titleBar.appendChild(titleGroup);
    titleBar.appendChild(controls);

    const body = document.createElement("div");
    body.className = "tool-window-body";
    body.setAttribute("data-testid", `${options.id}-body`);
    this.contentElement = body;
    this.interactionOverlay = document.createElement("div");
    this.interactionOverlay.className = "tool-window-interaction-overlay";
    this.interactionOverlay.textContent = "Adjusting window...";
    this.interactionOverlay.setAttribute("aria-hidden", "true");
    body.appendChild(this.interactionOverlay);

    this.root.appendChild(titleBar);
    this.root.appendChild(body);

    const resizeDirections: ResizeDirection[] = ["n", "s", "e", "w", "ne", "nw", "se", "sw"];
    for (const direction of resizeDirections) {
      this.root.appendChild(createResizeHandle(direction));
    }

    document.body.appendChild(this.root);

    this.dragCleanup = attachDragBehavior({
      dragHandle: titleBar,
      getGeometry: () => this.geometry,
      onPreviewOffset: (deltaX, deltaY) => {
        this.previewOffset = {
          x: Math.round(deltaX),
          y: Math.round(deltaY)
        };
        this.scheduleVisualSync();
      },
      onCommitGeometry: (next) => {
        this.geometry = next;
        this.previewOffset = { x: 0, y: 0 };
        this.scheduleVisualSync();
        this.persistGeometry();
      },
      bringToFront: () => this.bringToFront(),
      onInteractionStart: () => {
        this.interactionPhase = "dragging";
        this.scheduleVisualSync();
      },
      onInteractionEnd: () => {
        this.interactionPhase = "idle";
        this.scheduleVisualSync();
      },
      viewportMargin
    });

    this.resizeCleanup = attachResizeBehavior({
      rootElement: this.root,
      getGeometry: () => this.geometry,
      setGeometry: (next) => {
        this.geometry = next;
        this.scheduleVisualSync();
      },
      bringToFront: () => this.bringToFront(),
      onInteractionStart: () => {
        this.interactionPhase = "resizing";
        this.scheduleVisualSync();
      },
      onInteractionEnd: () => {
        this.interactionPhase = "idle";
        this.scheduleVisualSync();
        this.persistGeometry();
      },
      minWidth: options.minWidth,
      minHeight: options.minHeight,
      viewportMargin
    });

    this.root.addEventListener("pointerdown", () => {
      this.bringToFront();
    });

    this.root.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        this.close();
        options.onRequestClose?.();
      }
    });

    this.applyPersistedGeometry();
    this.flushVisualSync();

    window.addEventListener("resize", this.handleWindowResize);
  }

  private readonly handleWindowResize = (): void => {
    const viewportMargin = this.options.viewportMargin ?? DEFAULT_VIEWPORT_MARGIN;
    const maxWidth = Math.max(this.options.minWidth, window.innerWidth - viewportMargin * 2);
    const maxHeight = Math.max(this.options.minHeight, window.innerHeight - viewportMargin * 2);

    const width = clamp(this.geometry.width, this.options.minWidth, maxWidth);
    const height = clamp(this.geometry.height, this.options.minHeight, maxHeight);
    const left = clamp(this.geometry.left, viewportMargin, Math.max(viewportMargin, window.innerWidth - viewportMargin - width));
    const top = clamp(this.geometry.top, viewportMargin, Math.max(viewportMargin, window.innerHeight - viewportMargin - height));

    this.geometry = { left, top, width, height };
    this.scheduleVisualSync();
    this.persistGeometry();
  };

  private buildDefaultGeometry(): FloatingWindowGeometry {
    const viewportMargin = this.options.viewportMargin ?? DEFAULT_VIEWPORT_MARGIN;
    const widthRatio = this.options.defaultWidthRatio ?? 0.5;
    const heightRatio = this.options.defaultHeightRatio ?? 0.72;

    const maxWidth = Math.max(this.options.minWidth, Math.min(this.options.maxWidth ?? 1120, window.innerWidth - viewportMargin * 2));
    const maxHeight = Math.max(this.options.minHeight, Math.min(this.options.maxHeight ?? 860, window.innerHeight - viewportMargin * 2));

    const width = clamp(Math.round(window.innerWidth * widthRatio), this.options.minWidth, maxWidth);
    const height = clamp(Math.round(window.innerHeight * heightRatio), this.options.minHeight, maxHeight);

    const left = clamp(
      Math.round((window.innerWidth - width) / 2),
      viewportMargin,
      Math.max(viewportMargin, window.innerWidth - viewportMargin - width)
    );

    const top = clamp(
      Math.round((window.innerHeight - height) / 2) - 24,
      viewportMargin,
      Math.max(viewportMargin, window.innerHeight - viewportMargin - height)
    );

    return { left, top, width, height };
  }

  private scheduleVisualSync(): void {
    if (this.rafId !== null) {
      return;
    }

    this.rafId = window.requestAnimationFrame(() => {
      this.rafId = null;
      this.flushVisualSync();
    });
  }

  private flushVisualSync(): void {
    this.root.style.left = `${Math.round(this.geometry.left)}px`;
    this.root.style.top = `${Math.round(this.geometry.top)}px`;
    this.root.style.width = `${Math.round(this.geometry.width)}px`;
    this.root.style.height = `${Math.round(this.geometry.height)}px`;

    if (this.previewOffset.x !== 0 || this.previewOffset.y !== 0) {
      this.root.style.transform = `translate3d(${this.previewOffset.x}px, ${this.previewOffset.y}px, 0)`;
    } else {
      this.root.style.transform = "";
    }

    this.root.classList.toggle("is-dragging", this.interactionPhase === "dragging");
    this.root.classList.toggle("is-resizing", this.interactionPhase === "resizing");
    this.root.classList.toggle("is-interacting", this.interactionPhase !== "idle");
  }

  private bringToFront(): void {
    nextFloatingWindowZIndex += 1;
    this.root.style.zIndex = String(nextFloatingWindowZIndex);
  }

  private applyPersistedGeometry(): void {
    if (!this.options.storageKey) {
      return;
    }

    try {
      const raw = window.localStorage.getItem(this.options.storageKey);
      if (!raw) {
        return;
      }

      const parsed = JSON.parse(raw) as Partial<PersistedGeometry>;
      if (
        !isFiniteNumber(parsed.left) ||
        !isFiniteNumber(parsed.top) ||
        !isFiniteNumber(parsed.width) ||
        !isFiniteNumber(parsed.height)
      ) {
        return;
      }

      this.geometry = {
        left: parsed.left,
        top: parsed.top,
        width: parsed.width,
        height: parsed.height
      };

      this.handleWindowResize();
    } catch {
      // Persisted geometry is optional.
    }
  }

  private persistGeometry(): void {
    if (!this.options.storageKey) {
      return;
    }

    try {
      window.localStorage.setItem(this.options.storageKey, JSON.stringify(this.geometry));
    } catch {
      // Storage may be unavailable.
    }
  }

  setTitle(nextTitle: string): void {
    this.titleElement.textContent = nextTitle;
  }

  getContentElement(): HTMLDivElement {
    return this.contentElement;
  }

  getGeometry(): FloatingWindowGeometry {
    return { ...this.geometry };
  }

  isOpen(): boolean {
    return this.isCurrentlyOpen;
  }

  open(): void {
    if (this.isCurrentlyOpen) {
      this.bringToFront();
      return;
    }

    this.flushVisualSync();
    this.root.hidden = false;
    this.root.setAttribute("aria-hidden", "false");
    this.isCurrentlyOpen = true;
    this.bringToFront();
    this.options.onOpenStateChanged?.(true);
  }

  close(): void {
    if (!this.isCurrentlyOpen) {
      return;
    }

    this.previewOffset = { x: 0, y: 0 };
    this.interactionPhase = "idle";
    this.flushVisualSync();
    this.root.hidden = true;
    this.root.setAttribute("aria-hidden", "true");
    this.isCurrentlyOpen = false;
    this.options.onOpenStateChanged?.(false);
  }

  dispose(): void {
    window.removeEventListener("resize", this.handleWindowResize);
    if (this.rafId !== null) {
      window.cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.dragCleanup();
    this.resizeCleanup();
    this.root.remove();
  }
}
