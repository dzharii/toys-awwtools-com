import { DEFAULT_THEME } from "../themes/default-theme.js";
import { PUBLIC_TOKENS } from "./constants.js";

export function applyThemePatch(target, themePatch = {}) {
  if (!target?.style) return;

  for (const [token, value] of Object.entries(themePatch || {})) {
    if (value == null) continue;
    target.style.setProperty(token, String(value));
  }
}

export function copyPublicThemeContext(source, target, tokens = PUBLIC_TOKENS) {
  if (!source || !target?.style || typeof getComputedStyle === "undefined") return;

  const computed = getComputedStyle(source);
  for (const token of Object.values(tokens)) {
    const value = computed.getPropertyValue(token);
    if (value) target.style.setProperty(token, value.trim());
  }
}

export function createTheme(baseTheme = DEFAULT_THEME, patch = {}) {
  return { ...(baseTheme || {}), ...(patch || {}) };
}

export class ThemeService {
  #theme;

  constructor(theme = DEFAULT_THEME) {
    this.#theme = { ...theme };
  }

  get tokens() {
    return { ...this.#theme };
  }

  setTheme(themePatch) {
    this.#theme = { ...this.#theme, ...themePatch };
    return this.tokens;
  }

  applyTheme(target) {
    applyThemePatch(target, this.#theme);
  }

  applyThemePatch(target, themePatch) {
    applyThemePatch(target, themePatch);
  }
}

export const defaultThemeService = new ThemeService(DEFAULT_THEME);
