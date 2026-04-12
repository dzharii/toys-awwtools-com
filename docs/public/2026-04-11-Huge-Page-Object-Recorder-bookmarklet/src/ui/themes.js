export const TOOL_THEMES = {
  macos: {
    id: "macos",
    label: "macOS Utility",
    className: "theme-macos",
  },
  windowsXp: {
    id: "windowsXp",
    label: "Windows XP Utility",
    className: "theme-windows-xp",
  },
};

function detectPlatform(windowObject) {
  const userAgentDataPlatform = windowObject.navigator?.userAgentData?.platform ?? "";
  const platform = `${userAgentDataPlatform} ${windowObject.navigator?.platform ?? ""} ${
    windowObject.navigator?.userAgent ?? ""
  }`.toLowerCase();

  const isMobile = /iphone|ipad|android|mobile/.test(platform);
  if (isMobile) {
    return "mobile";
  }
  if (/mac/.test(platform)) {
    return "mac";
  }
  if (/win/.test(platform)) {
    return "windows";
  }
  if (/linux|x11/.test(platform)) {
    return "linux";
  }
  return "desktop";
}

export function chooseDefaultTheme(windowObject = window) {
  const platform = detectPlatform(windowObject);
  if (platform === "mac") {
    return TOOL_THEMES.windowsXp.id;
  }
  if (platform === "windows" || platform === "linux" || platform === "desktop") {
    return TOOL_THEMES.macos.id;
  }
  return TOOL_THEMES.macos.id;
}

export function getThemeMeta(themeId) {
  return TOOL_THEMES[themeId] ?? TOOL_THEMES.macos;
}

export function cycleTheme(themeId) {
  return themeId === TOOL_THEMES.macos.id ? TOOL_THEMES.windowsXp.id : TOOL_THEMES.macos.id;
}
