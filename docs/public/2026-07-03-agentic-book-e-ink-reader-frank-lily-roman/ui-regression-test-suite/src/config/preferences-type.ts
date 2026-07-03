/**
 * Reader preference shape (mirrors js/preferences.js DEFAULT_PREFERENCES).
 * Duplicated here to preserve source decoupling; used for seeding localStorage.
 */
export interface ReaderPreferences {
  version: number;
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  measure: number;
  paraSpacing: number;
  align: "left" | "justify";
  readerMode: "paged" | "scroll";
  theme: "warm-paper" | "cool-paper" | "high-contrast" | "dark";
  contrast: "soft" | "normal";
  textureStrength: number;
  margin: number;
  einkIntensity: "off" | "reduced" | "balanced" | "strong";
  refreshStyle: "adaptive" | "flash" | "wash";
  fullRefreshInterval: number;
  ghosting: number;
  motion: "system" | "reduced" | "full";
  showProgress: boolean;
  debugEnabled: boolean;
}

export const DEFAULT_PREFERENCES: ReaderPreferences = {
  version: 1,
  fontFamily: "Literata",
  fontSize: 20,
  lineHeight: 1.55,
  measure: 68,
  paraSpacing: 0.9,
  align: "left",
  readerMode: "paged",
  theme: "warm-paper",
  contrast: "soft",
  textureStrength: 0.5,
  margin: 28,
  einkIntensity: "balanced",
  refreshStyle: "adaptive",
  fullRefreshInterval: 6,
  ghosting: 0.5,
  motion: "system",
  showProgress: true,
  debugEnabled: false,
};
