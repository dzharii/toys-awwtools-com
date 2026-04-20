import { DEFAULT_THEME } from "../themes/default-theme.js";

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
    for (const [token, value] of Object.entries(this.#theme)) {
      target.style.setProperty(token, value);
    }
  }
}

export const defaultThemeService = new ThemeService(DEFAULT_THEME);
