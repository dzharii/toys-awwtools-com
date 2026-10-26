import type { CommandRegistry } from "../core/commands.js";
import type { ContextSegment } from "../core/context-segments.js";
import type { Rect } from "../core/geometry.js";

export interface AwwWindowElement extends HTMLElement {
  getRect(): Rect | null;
  setRect(nextRect: Rect): void;
  setActive(isActive: boolean): void;
  setZIndex(zIndex: number): void;
  requestClose(): void;
  isClosable(): boolean;
}

export interface AwwMenubarElement extends HTMLElement {
  commandRegistry: CommandRegistry;
}

export interface AwwMenuElement extends HTMLElement {
  getItems(): HTMLElement[];
  portalTo(container: ParentNode | null): void;
  restorePortal(): void;
  openAtViewportRect(anchorRect: DOMRect | DOMRectReadOnly): void;
  close(): void;
  focusFirst(): void;
}

export interface AwwSegmentStripElement extends HTMLElement {
  segments: unknown[];
}

export interface AwwUrlPickerElement extends HTMLElement {
  value: string;
}

export interface AwwProgressElement extends HTMLElement {
  value: number;
  max: number;
}

export interface AwwToastElement extends HTMLElement {
  startTimer(): void;
}

export interface AwwButtonElement extends HTMLElement {
  disabled: boolean;
  busy: boolean;
}

export interface AwwTextControlElement extends HTMLElement {
  value: string;
  disabled: boolean;
}

export interface AwwCheckboxElement extends HTMLElement {
  checked: boolean;
  disabled: boolean;
  value: string;
}

export interface AwwRadioElement extends AwwCheckboxElement {}

export interface AwwSelectElement extends AwwTextControlElement {
  options: HTMLOptionsCollection;
}

export interface AwwRangeElement extends AwwTextControlElement {
  min: string;
  max: string;
}

export interface AwwDialogElement extends HTMLElement {
  show(): void;
  close(reason?: string): void;
}

export interface AwwCommandPaletteElement extends HTMLElement {
  commands: Array<Record<string, unknown>>;
}

export interface AwwShortcutHelpElement extends HTMLElement {
  shortcuts: Array<Record<string, unknown>>;
}

export interface AwwRichPreviewElement extends HTMLElement {
  html: string;
}

export interface AwwBrowserPanelElement extends HTMLElement {
  retry(): void;
  openExternally(): void;
}

export interface AwwManualCopyElement extends HTMLElement {
  value: string;
  selectionStart: number;
  selectionEnd: number;
  selectText(): void;
}

export interface AwwMetricCardElement extends HTMLElement {
  update(value: string | number, label?: string): void;
}

export interface AwwContextPanelElement extends HTMLElement {
  segments: unknown[];
  expand(): void;
  collapse(): void;
}

export interface AwwStatusLineElement extends HTMLElement {
  update(message: string, options?: Record<string, unknown>): void;
}

export interface AwwSegmentContainerElement extends HTMLElement {
  segments: unknown[];
}

export interface AwwContextBarElement extends AwwSegmentContainerElement {
  expand(): void;
  collapse(): void;
}

export interface BookmarkletUiGlobals {
  [key: string]: unknown;
}

/** Ambient browser globals exposed by loaded RetroOS UI bundles. */
declare global {
  var awwtools: { bookmarkletUi?: BookmarkletUiGlobals } | undefined;
  var awwbookmarklet: BookmarkletUiGlobals | undefined;

  interface HTMLElementTagNameMap {
    "awwbookmarklet-window": AwwWindowElement;
    "awwbookmarklet-menubar": AwwMenubarElement;
    "awwbookmarklet-menu": AwwMenuElement;
    "awwbookmarklet-button": AwwButtonElement;
    "awwbookmarklet-icon-button": AwwButtonElement;
    "awwbookmarklet-input": AwwTextControlElement;
    "awwbookmarklet-textarea": AwwTextControlElement;
    "awwbookmarklet-checkbox": AwwCheckboxElement;
    "awwbookmarklet-radio": AwwRadioElement;
    "awwbookmarklet-select": AwwSelectElement;
    "awwbookmarklet-range": AwwRangeElement;
    "awwbookmarklet-segment-strip": AwwSegmentStripElement;
    "awwbookmarklet-url-picker": AwwUrlPickerElement;
    "awwbookmarklet-progress": AwwProgressElement;
    "awwbookmarklet-dialog": AwwDialogElement;
    "awwbookmarklet-toast": AwwToastElement;
    "awwbookmarklet-status-line": AwwStatusLineElement;
    "awwbookmarklet-command-palette": AwwCommandPaletteElement;
    "awwbookmarklet-shortcut-help": AwwShortcutHelpElement;
    "awwbookmarklet-rich-preview": AwwRichPreviewElement;
    "awwbookmarklet-browser-panel": AwwBrowserPanelElement;
    "awwbookmarklet-manual-copy": AwwManualCopyElement;
    "awwbookmarklet-metric-card": AwwMetricCardElement;
    "awwbookmarklet-context-panel": AwwContextPanelElement;
    "awwbookmarklet-context-bar": AwwContextBarElement;
    "awwbookmarklet-status-strip": AwwSegmentContainerElement;
    "awwbookmarklet-titlebar": AwwSegmentContainerElement;
  }
}
