const themeButtons = document.querySelectorAll("[data-theme-button]");

function readStoredTheme() {
  try {
    return localStorage.getItem("my-ds-preview-theme");
  } catch {
    // Browsers can block localStorage in private or restricted contexts.
    return null;
  }
}

function storeTheme(theme) {
  try {
    localStorage.setItem("my-ds-preview-theme", theme);
  } catch {
    // Theme switching should still work for the current page even without persistence.
  }
}

function syncThemeButtons(theme) {
  for (const themeButton of themeButtons) {
    themeButton.setAttribute(
      "aria-pressed",
      String(themeButton.dataset.themeButton === theme),
    );
  }
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  syncThemeButtons(theme);
  storeTheme(theme);
}

for (const themeButton of themeButtons) {
  themeButton.addEventListener("click", () => applyTheme(themeButton.dataset.themeButton));
}

applyTheme(readStoredTheme() || "default");
