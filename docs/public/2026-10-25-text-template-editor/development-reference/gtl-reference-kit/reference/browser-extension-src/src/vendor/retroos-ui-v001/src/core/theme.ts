// RetroOS UI v001 editable vendored framework source.
// This file may be changed inside this repository, but changes should remain
// generic, reusable, and suitable to merge back into the standalone RetroOS UI
// framework. Do not add this browser extension's feature-specific business
// logic here. Put project-specific integration in an adapter or bridge layer
// outside src/vendor/retroos-ui-v001/.

import { DEFAULT_THEME } from "../themes/default-theme.js";
import { PUBLIC_TOKENS } from "./constants.js";

export type ThemeTokens = Record<string, string | number | null | undefined>;

export function applyThemePatch(target: HTMLElement | null | undefined, themePatch: ThemeTokens = {}): void {
  if (!target?.style) return;

  for (const [token, value] of Object.entries(themePatch || {})) {
    if (value == null) continue;
    target.style.setProperty(token, String(value));
  }
}

/** Copies public CSS custom properties across DOM boundaries such as portals. */
export function copyPublicThemeContext(source: Element | null | undefined, target: HTMLElement | null | undefined, tokens = PUBLIC_TOKENS): void {
  if (!source || !target?.style || typeof getComputedStyle === "undefined") return;

  const computed = getComputedStyle(source);
  for (const token of Object.values(tokens)) {
    const value = computed.getPropertyValue(token);
    if (value) target.style.setProperty(token, value.trim());
  }
}

export function createTheme(baseTheme: ThemeTokens = DEFAULT_THEME, patch: ThemeTokens = {}): ThemeTokens {
  return { ...(baseTheme || {}), ...(patch || {}) };
}

export class ThemeService {
  #theme: ThemeTokens;

  constructor(theme: ThemeTokens = DEFAULT_THEME) {
    this.#theme = { ...theme };
  }

  get tokens() {
    return { ...this.#theme };
  }

  setTheme(themePatch: ThemeTokens) {
    this.#theme = { ...this.#theme, ...themePatch };
    return this.tokens;
  }

  applyTheme(target: HTMLElement) {
    applyThemePatch(target, this.#theme);
  }

  applyThemePatch(target: HTMLElement, themePatch: ThemeTokens) {
    applyThemePatch(target, themePatch);
  }
}

export const defaultThemeService = new ThemeService(DEFAULT_THEME);
